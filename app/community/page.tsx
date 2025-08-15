'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { MessageCircle, Users, MapPin, Clock, DollarSign, ArrowLeft, Menu, Plus } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import TaskApplicationModal from '@/components/TaskApplicationModal'
import TaskMessaging from '@/components/TaskMessaging'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { apiRequest } from '@/lib/lib/queryClient'
import type { Task } from '@shared/schema'

interface CommunityTask extends Task {
  postedBy?: string
  postedAt?: string
}

export default function CommunityPage() {
  const router = useRouter()
  const [selectedTask, setSelectedTask] = useState<CommunityTask | null>(null)
  const [showApplicationModal, setShowApplicationModal] = useState(false)
  const [selectedTaskForChat, setSelectedTaskForChat] = useState<CommunityTask | null>(null)

  // Fetch community tasks from API
  const { data: communityTasks = [], isLoading, error } = useQuery({
    queryKey: ['/api/tasks', 'shared'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/tasks?type=shared')
      const tasks = await response.json()
      return tasks.map((task: Task) => ({
        ...task,
        price: Number(task.earningPotential),
        participants: task.currentParticipants,
        estimatedTime: task.duration,
        postedBy: 'Community Member', // Placeholder until we have user data
        postedAt: new Date(task.createdAt!).toLocaleDateString(),
      }))
    }
  })

  const handleApplyClick = (task: CommunityTask) => {
    setSelectedTask(task)
    setShowApplicationModal(true)
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'bg-green-100 text-green-800 border-green-200'
      case 'Medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'Hard': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'in-progress': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'completed': return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Navigation Header */}
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            onClick={() => router.push('/dashboard')}
            className="flex items-center gap-2 text-gray-700 hover:text-blue-600"
          >
            <ArrowLeft size={20} />
            Back to Dashboard
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <Menu size={16} />
                Browse Tasks
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => router.push('/solo')}>
                Solo Tasks
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push('/sponsors')}>
                Corporate Tasks
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push('/barter')}>
                Barter Exchange
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push('/')}>
                Home
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Community Tasks
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Join your neighbors in collaborative tasks! Work together, share earnings (7% platform fee), 
            and build stronger community connections through group messaging.
          </p>
          <div className="mt-6">
            <Button 
              size="lg" 
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3"
              data-testid="button-create-community-task"
              onClick={() => router.push('/create-task')}
            >
              Create Community Task
            </Button>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{communityTasks.filter(t => t.status === 'open').length}</div>
              <div className="text-sm text-gray-600">Active Tasks</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{communityTasks.reduce((sum, t) => sum + (t.participants || 0), 0)}</div>
              <div className="text-sm text-gray-600">Total Participants</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">${communityTasks.reduce((sum, t) => sum + (t.price || 0), 0)}</div>
              <div className="text-sm text-gray-600">Total Earnings</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">7%</div>
              <div className="text-sm text-gray-600">Platform Fee</div>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-8">
            <p className="text-gray-600 mb-4">Failed to load community tasks</p>
            <Button variant="outline" onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && communityTasks.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No Community Tasks Yet</h3>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              Be the first to create a community task! Post collaborative work and share earnings with your neighbors.
            </p>
            <Button 
              onClick={() => router.push('/create-task')}
              className="bg-blue-600 hover:bg-blue-700"
              data-testid="button-create-first-task"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create First Community Task
            </Button>
          </div>
        )}

        {/* Task Grid */}
        {!isLoading && !error && communityTasks.length > 0 && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {communityTasks.filter(task => task.status === 'open').map((task) => (
            <Card key={task.id} className="hover:shadow-lg transition-all duration-200 border-0 shadow-md">
              <CardHeader className="pb-4">
                <div className="flex justify-between items-start mb-2">
                  <Badge className={getDifficultyColor(task.difficulty)} variant="outline">
                    {task.difficulty}
                  </Badge>
                  <Badge className={getStatusColor(task.status)} variant="outline">
                    {task.status}
                  </Badge>
                </div>
                <CardTitle className="text-lg line-clamp-2">{task.title}</CardTitle>
                <CardDescription className="line-clamp-3">
                  {task.description}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Posted By */}
                <div className="flex items-center gap-3">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src="" />
                    <AvatarFallback className="bg-blue-100 text-blue-600">
                      {task.postedBy.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="text-sm font-medium">{task.postedBy}</div>
                    <div className="text-xs text-gray-500">{task.postedAt}</div>
                  </div>
                </div>

                {/* Task Details */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="w-4 h-4" />
                    {task.location}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="w-4 h-4" />
                    {task.estimatedTime}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Users className="w-4 h-4" />
                    {task.participants}/{task.maxParticipants} participants
                  </div>
                </div>

                {/* Price and Actions */}
                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="flex items-center gap-1">
                    <DollarSign className="w-4 h-4 text-green-600" />
                    <span className="font-bold text-lg text-green-600">${task.price}</span>
                    <span className="text-sm text-gray-500">shared</span>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => setSelectedTaskForChat(task)}
                      data-testid={`button-message-${task.id}`}
                    >
                      <MessageCircle className="w-4 h-4" />
                    </Button>
                    <Button 
                      size="sm"
                      onClick={() => handleApplyClick(task)}
                      disabled={task.participants >= task.maxParticipants || task.status !== 'open'}
                      data-testid={`button-join-${task.id}`}
                    >
                      {task.participants >= task.maxParticipants ? 'Full' : 'Join Task'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          </div>
        )}

        {/* Application Modal */}
        {selectedTask && (
          <TaskApplicationModal
            task={{
              id: selectedTask.id,
              title: selectedTask.title,
              description: selectedTask.description,
              category: selectedTask.category,
              type: 'community',
              payout: selectedTask.price,
              location: selectedTask.location,
              time_commitment: selectedTask.estimatedTime,
              requirements: ['Valid ID', 'Team player attitude'],
              platform_funded: false
            }}
            userId="current-user"
            onSuccess={() => setShowApplicationModal(false)}
          />
        )}
      </div>
    </div>
  )
}