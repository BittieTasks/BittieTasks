'use client'

import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/components/auth/SimpleAuthProvider'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { useToast } from '@/hooks/use-toast'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Send, Clock, CheckCircle2, MessageCircle, Wifi, WifiOff } from 'lucide-react'
import { useWebSocket } from '@/hooks/useWebSocket'

interface TaskMessage {
  id: string
  task_id: string
  sender_id: string
  content: string
  message_type: 'text' | 'image' | 'file'
  file_url?: string
  created_at: string
  is_system_message: boolean
  sender: {
    id: string
    first_name: string
    last_name: string
  }
}

interface TaskMessagingProps {
  taskId: string
  taskTitle: string
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}

export default function TaskMessaging({ taskId, taskTitle, isOpen, onOpenChange }: TaskMessagingProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [message, setMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [typingUsers, setTypingUsers] = useState<string[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout>()
  
  // WebSocket connection
  const { socket, isConnected, sendMessage: sendWebSocketMessage } = useWebSocket()

  // Fetch messages for this task
  const { data: messagesData, isLoading, error } = useQuery({
    queryKey: [`/api/tasks/${taskId}/messages`],
    enabled: !!taskId && !!user,
    refetchInterval: isConnected ? false : 10000, // Only poll if WebSocket disconnected
    queryFn: async () => {
      const response = await fetch(`/api/tasks/${taskId}/messages`)

      if (!response.ok) {
        throw new Error('Failed to fetch messages')
      }

      const data = await response.json()
      return data.messages || []
    }
  })

  const messages: TaskMessage[] = messagesData || []

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      // Try WebSocket first
      if (isConnected && user?.id) {
        const success = sendWebSocketMessage({
          type: 'send_message',
          payload: {
            taskId,
            content,
            messageType: 'text'
          },
          taskId,
          userId: user.id,
          timestamp: new Date().toISOString()
        })

        if (success) {
          return { success: true, method: 'websocket' }
        }
      }

      // Fallback to HTTP API
      const response = await fetch(`/api/tasks/${taskId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          content,
          messageType: 'text'
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to send message')
      }

      return response.json()
    },
    onSuccess: (data) => {
      // Only refresh via query if not using WebSocket
      if (data.method !== 'websocket') {
        queryClient.invalidateQueries({ queryKey: [`/api/tasks/${taskId}/messages`] })
      }
      setMessage('')
      stopTyping()
      inputRef.current?.focus()
    },
    onError: (error: any) => {
      toast({
        title: "Failed to send message",
        description: error.message || "Please try again",
        variant: "destructive"
      })
    }
  })

  // WebSocket event handling
  useEffect(() => {
    if (!socket || !isConnected || !user?.id) return

    // Join task room
    sendWebSocketMessage({
      type: 'join_task_room',
      payload: { taskId },
      taskId,
      userId: user.id,
      timestamp: new Date().toISOString()
    })

    const handleMessage = (event: MessageEvent) => {
      try {
        const message = JSON.parse(event.data)
        
        switch (message.type) {
          case 'message_received':
            // Add new message to the list
            queryClient.setQueryData([`/api/tasks/${taskId}/messages`], (old: TaskMessage[] = []) => {
              // Avoid duplicates
              if (old.some(m => m.id === message.payload.id)) return old
              return [...old, message.payload].sort((a, b) => 
                new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
              )
            })
            break
            
          case 'typing_indicator':
            if (message.payload.userId !== user.id) {
              if (message.payload.isTyping) {
                setTypingUsers(prev => 
                  prev.includes(message.payload.userName) 
                    ? prev 
                    : [...prev, message.payload.userName]
                )
              } else {
                setTypingUsers(prev => 
                  prev.filter(userName => userName !== message.payload.userName)
                )
              }
            }
            break
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error)
      }
    }

    socket.addEventListener('message', handleMessage)
    
    return () => {
      socket.removeEventListener('message', handleMessage)
      // Leave task room on cleanup
      sendWebSocketMessage({
        type: 'leave_task_room',
        payload: { taskId },
        taskId,
        userId: user.id,
        timestamp: new Date().toISOString()
      })
    }
  }, [socket, isConnected, taskId, user?.id, sendWebSocketMessage, queryClient])

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages])

  // Handle typing indicators
  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value)
    
    if (!isTyping && e.target.value.length > 0 && isConnected && user?.id) {
      setIsTyping(true)
      sendWebSocketMessage({
        type: 'typing_indicator',
        payload: {
          taskId,
          userId: user.id,
          isTyping: true,
          userName: `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'User'
        },
        taskId,
        userId: user.id,
        timestamp: new Date().toISOString()
      })
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    // Set new timeout to stop typing
    typingTimeoutRef.current = setTimeout(() => {
      stopTyping()
    }, 1000)
  }

  const stopTyping = () => {
    if (isTyping && isConnected && user?.id) {
      setIsTyping(false)
      sendWebSocketMessage({
        type: 'typing_indicator',
        payload: {
          taskId,
          userId: user.id,
          isTyping: false,
          userName: `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'User'
        },
        taskId,
        userId: user.id,
        timestamp: new Date().toISOString()
      })
    }
  }

  // Handle sending message
  const handleSendMessage = () => {
    if (!message.trim() || sendMessageMutation.isPending) return
    
    sendMessageMutation.mutate(message.trim())
  }

  // Handle key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  // Format time
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (days === 0) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    } else if (days === 1) {
      return 'Yesterday'
    } else {
      return date.toLocaleDateString()
    }
  }

  // Get user initials
  const getUserInitials = (firstName: string, lastName: string) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase()
  }

  if (error) {
    return (
      <Card className="bg-white shadow-sm">
        <CardContent className="p-6 text-center">
          <MessageCircle className="w-8 h-8 mx-auto text-gray-400 mb-2" />
          <p className="text-gray-600">Unable to load messages</p>
        </CardContent>
      </Card>
    )
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md h-[600px] flex flex-col bg-white shadow-sm">
        <CardHeader className="pb-3 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-blue-600" />
              <CardTitle className="text-lg font-semibold">Task Messages</CardTitle>
              {isConnected ? (
                <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
                  <Wifi className="w-3 h-3 mr-1" />
                  Live
                </Badge>
              ) : (
                <Badge variant="secondary" className="text-xs bg-yellow-100 text-yellow-700">
                  <WifiOff className="w-3 h-3 mr-1" />
                  Offline
                </Badge>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
            >
              ✕
            </Button>
          </div>
          <p className="text-sm text-gray-600 truncate">{taskTitle}</p>
        </CardHeader>
      
        <CardContent className="flex-1 flex flex-col p-0">
          {/* Messages Area */}
          <ScrollArea className="flex-1 px-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full"></div>
              <span className="ml-2 text-gray-600">Loading messages...</span>
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-8">
              <MessageCircle className="w-12 h-12 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500 mb-2">No messages yet</p>
              <p className="text-sm text-gray-400">Start the conversation about this task</p>
            </div>
          ) : (
            <div className="space-y-4 py-4">
              {messages.map((msg, index) => {
                const isOwn = msg.sender_id === user?.id
                const showAvatar = index === 0 || messages[index - 1].sender_id !== msg.sender_id
                
                return (
                  <div key={msg.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                    <div className={`flex ${isOwn ? 'flex-row-reverse' : 'flex-row'} items-end max-w-[80%] gap-2`}>
                      {/* Avatar */}
                      {showAvatar && !msg.is_system_message && (
                        <Avatar className="w-8 h-8">
                          <AvatarFallback className="text-xs">
                            {msg.sender_id === 'system' ? 'SYS' : getUserInitials(msg.sender.first_name, msg.sender.last_name)}
                          </AvatarFallback>
                        </Avatar>
                      )}
                      {!showAvatar && !msg.is_system_message && <div className="w-8" />}

                      {/* Message Bubble */}
                      <div className={`relative ${msg.is_system_message ? 'mx-auto' : ''}`}>
                        {msg.is_system_message ? (
                          <div className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm text-center">
                            {msg.content}
                          </div>
                        ) : (
                          <>
                            {showAvatar && (
                              <p className={`text-xs text-gray-500 mb-1 ${isOwn ? 'text-right' : 'text-left'}`}>
                                {isOwn ? 'You' : `${msg.sender.first_name} ${msg.sender.last_name}`}
                              </p>
                            )}
                            <div
                              className={`px-4 py-2 rounded-2xl ${
                                isOwn
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-gray-100 text-gray-900'
                              }`}
                            >
                              <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                            </div>
                            <p className={`text-xs text-gray-400 mt-1 ${isOwn ? 'text-right' : 'text-left'}`}>
                              {formatTime(msg.created_at)}
                            </p>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
              
              {/* Typing Indicators */}
              {typingUsers.length > 0 && (
                <div className="flex justify-start">
                  <div className="flex flex-row items-end max-w-[80%] gap-2">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="text-xs">
                        ⌨️
                      </AvatarFallback>
                    </Avatar>
                    <div className="relative">
                      <div className="bg-gray-100 text-gray-900 px-4 py-2 rounded-2xl">
                        <div className="flex items-center gap-1">
                          <div className="flex gap-1">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" />
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-75" />
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-150" />
                          </div>
                        </div>
                      </div>
                      <p className="text-xs text-gray-400 mt-1 text-left">
                        {typingUsers.join(', ')} typing...
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          )}
          </ScrollArea>

          <Separator />

          {/* Message Input */}
          <div className="p-4 flex-shrink-0">
          <div className="flex gap-2">
            <Input
              ref={inputRef}
              value={message}
              onChange={handleTyping}
              onKeyPress={handleKeyPress}
              placeholder={isConnected ? "Type your message..." : "Connecting..."}
              disabled={sendMessageMutation.isPending || !isConnected}
              className="flex-1"
            />
            <Button
              onClick={handleSendMessage}
              disabled={!message.trim() || sendMessageMutation.isPending}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {sendMessageMutation.isPending ? (
                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}