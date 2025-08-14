'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Send, Users, Clock, MapPin } from 'lucide-react'

interface Message {
  id: string
  sender: string
  senderAvatar?: string
  content: string
  timestamp: string
  isOwn: boolean
}

interface TaskMessagingProps {
  taskId: string
  taskTitle: string
  taskLocation: string
  participants: Array<{
    id: string
    name: string
    avatar?: string
    joinedAt: string
  }>
  messages: Message[]
  onSendMessage: (message: string) => void
}

export function TaskMessaging({
  taskId,
  taskTitle,
  taskLocation,
  participants,
  messages,
  onSendMessage
}: TaskMessagingProps) {
  const [newMessage, setNewMessage] = useState('')

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      onSendMessage(newMessage.trim())
      setNewMessage('')
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      {/* Task Header */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-900">
            <Users className="w-5 h-5" />
            {taskTitle}
          </CardTitle>
          <div className="flex items-center gap-4 text-sm text-blue-700">
            <div className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              {taskLocation}
            </div>
            <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">
              {participants.length} participants
            </Badge>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Participants Sidebar */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="w-5 h-5" />
              Participants
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {participants.map((participant) => (
              <div key={participant.id} className="flex items-center gap-3">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={participant.avatar} />
                  <AvatarFallback className="bg-blue-100 text-blue-600">
                    {participant.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900">
                    {participant.name}
                  </div>
                  <div className="text-xs text-gray-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {participant.joinedAt}
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Chat Area */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="text-lg">Task Discussion</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Messages */}
            <ScrollArea className="h-96 w-full border rounded-lg p-4 bg-gray-50">
              <div className="space-y-4">
                {messages.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">
                    <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>No messages yet. Start the conversation!</p>
                  </div>
                ) : (
                  messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex gap-3 ${
                        message.isOwn ? 'flex-row-reverse' : 'flex-row'
                      }`}
                    >
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={message.senderAvatar} />
                        <AvatarFallback className="bg-gray-200 text-gray-600">
                          {message.sender.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div
                        className={`flex flex-col max-w-xs lg:max-w-md ${
                          message.isOwn ? 'items-end' : 'items-start'
                        }`}
                      >
                        <div
                          className={`px-4 py-2 rounded-lg ${
                            message.isOwn
                              ? 'bg-blue-600 text-white'
                              : 'bg-white border border-gray-200'
                          }`}
                        >
                          <p className="text-sm">{message.content}</p>
                        </div>
                        <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
                          <span>{message.sender}</span>
                          <span>•</span>
                          <span>{message.timestamp}</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>

            {/* Message Input */}
            <div className="flex gap-2">
              <Input
                placeholder="Type your message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1"
                data-testid="input-message"
              />
              <Button 
                onClick={handleSendMessage}
                disabled={!newMessage.trim()}
                data-testid="button-send-message"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>

            {/* Message Guidelines */}
            <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
              <p className="font-medium mb-1">Community Guidelines:</p>
              <ul className="space-y-1">
                <li>• Keep discussions relevant to the task</li>
                <li>• Be respectful and helpful to all participants</li>
                <li>• Share updates on your progress</li>
                <li>• Coordinate meeting times and locations</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}