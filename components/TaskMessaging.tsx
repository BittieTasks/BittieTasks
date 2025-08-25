'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Send, MessageCircle, Users, X } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiRequest } from '@/lib/queryClient'
import { useToast } from '@/app/hooks/use-toast'
import type { Message } from '@shared/schema'

interface TaskMessagingProps {
  taskId: string
  taskTitle: string
  currentUserId: string
  currentUserName: string
  isOpen: boolean
  onClose: () => void
}

export default function TaskMessaging({ 
  taskId, 
  taskTitle, 
  currentUserId, 
  currentUserName,
  isOpen,
  onClose 
}: TaskMessagingProps) {
  const [newMessage, setNewMessage] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()
  const queryClient = useQueryClient()

  // Fetch messages for this task
  const { data: messages = [], isLoading } = useQuery({
    queryKey: ['/api/messages', taskId],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/messages?taskId=${taskId}`)
      return response.json()
    },
    enabled: isOpen,
    refetchInterval: 5000, // Refresh every 5 seconds for real-time feel
  })

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (messageData: { message: string }) => {
      const response = await apiRequest('POST', '/api/messages', {
        taskId,
        senderId: currentUserId,
        senderName: currentUserName,
        message: messageData.message,
        messageType: 'text'
      })
      return response.json()
    },
    onSuccess: () => {
      setNewMessage('')
      queryClient.invalidateQueries({ queryKey: ['/api/messages', taskId] })
      // Scroll to bottom after sending
      setTimeout(() => scrollToBottom(), 100)
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to Send Message",
        description: error.message,
        variant: "destructive",
      })
    },
  })

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom()
    }
  }, [messages])

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (newMessage.trim()) {
      sendMessageMutation.mutate({ message: newMessage.trim() })
    }
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === today.toDateString()) {
      return 'Today'
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday'
    } else {
      return date.toLocaleDateString()
    }
  }

  const groupMessagesByDate = (messages: Message[]) => {
    const groups: { [key: string]: Message[] } = {}
    
    messages.forEach(message => {
      const date = new Date(message.createdAt!).toDateString()
      if (!groups[date]) {
        groups[date] = []
      }
      groups[date].push(message)
    })
    
    return Object.entries(groups).sort(([a], [b]) => 
      new Date(a).getTime() - new Date(b).getTime()
    )
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md h-[600px] flex flex-col">
        <CardHeader className="flex-shrink-0 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-blue-600" />
              <CardTitle className="text-lg">Task Chat</CardTitle>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              data-testid="button-close-chat"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          <div className="text-sm text-gray-600 truncate">{taskTitle}</div>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col p-0">
          {/* Messages Area */}
          <ScrollArea className="flex-1 px-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full" />
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Users className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                <p className="text-sm">No messages yet</p>
                <p className="text-xs">Start the conversation!</p>
              </div>
            ) : (
              <div className="space-y-4 py-4">
                {groupMessagesByDate(messages).map(([dateString, dayMessages]) => (
                  <div key={dateString}>
                    {/* Date Separator */}
                    <div className="flex items-center justify-center py-2">
                      <Badge variant="secondary" className="text-xs">
                        {formatDate(dateString)}
                      </Badge>
                    </div>
                    
                    {/* Messages for this date */}
                    <div className="space-y-3">
                      {dayMessages.map((message) => (
                        <div 
                          key={message.id}
                          className={`flex gap-2 ${
                            message.senderId === currentUserId ? 'justify-end' : 'justify-start'
                          }`}
                        >
                          {message.senderId !== currentUserId && (
                            <Avatar className="w-6 h-6 flex-shrink-0">
                              <AvatarFallback className="text-xs">
                                {(message.senderId || 'U').charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                          )}
                          
                          <div className={`max-w-[70%] ${
                            message.senderId === currentUserId ? 'order-first' : ''
                          }`}>
                            {message.messageType === 'system' ? (
                              <div className="text-center">
                                <Badge variant="outline" className="text-xs text-gray-500">
                                  {message.content}
                                </Badge>
                              </div>
                            ) : (
                              <div className={`rounded-lg px-3 py-2 ${
                                message.senderId === currentUserId
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-gray-100 text-gray-900'
                              }`}>
                                {message.senderId !== currentUserId && (
                                  <div className="text-xs font-medium mb-1">
                                    {message.senderId || 'User'}
                                  </div>
                                )}
                                <div className="text-sm break-words">
                                  {message.content}
                                </div>
                                <div className={`text-xs mt-1 ${
                                  message.senderId === currentUserId
                                    ? 'text-blue-100'
                                    : 'text-gray-500'
                                }`}>
                                  {formatTime(message.createdAt?.toISOString() || new Date().toISOString())}
                                </div>
                              </div>
                            )}
                          </div>
                          
                          {message.senderId === currentUserId && (
                            <Avatar className="w-6 h-6 flex-shrink-0">
                              <AvatarFallback className="text-xs bg-blue-600 text-white">
                                {currentUserName.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            )}
          </ScrollArea>

          {/* Message Input */}
          <div className="border-t p-4">
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-1"
                disabled={sendMessageMutation.isPending}
                data-testid="input-message"
              />
              <Button
                type="submit"
                size="sm"
                disabled={!newMessage.trim() || sendMessageMutation.isPending}
                data-testid="button-send-message"
              >
                <Send className="w-4 h-4" />
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}