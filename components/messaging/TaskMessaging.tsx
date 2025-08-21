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
import { useToast } from @/app/hooks/use-toast'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Send, Clock, CheckCircle2, MessageCircle } from 'lucide-react'

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
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Fetch messages for this task
  const { data: messagesData, isLoading, error } = useQuery({
    queryKey: [`/api/messages/${taskId}`],
    enabled: !!taskId && !!user,
    refetchInterval: 3000, // Poll for new messages every 3 seconds
    queryFn: async () => {
      const { supabase } = await import('@/lib/supabase')
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session?.access_token) {
        throw new Error('No session')
      }

      const response = await fetch(`/api/messages/${taskId}`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      })

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
      const { supabase } = await import('@/lib/supabase')
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session?.access_token) {
        throw new Error('No session')
      }

      const response = await fetch(`/api/messages/${taskId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
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
    onSuccess: () => {
      // Refresh messages immediately
      queryClient.invalidateQueries({ queryKey: [`/api/messages/${taskId}`] })
      setMessage('')
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

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages])

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
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              disabled={sendMessageMutation.isPending}
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