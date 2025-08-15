'use client'

import { useState } from 'react'
import { useAuth } from '@/components/auth/AuthProvider'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { MessageCircle, Users, MapPin, Clock, DollarSign, ArrowLeft, Menu, Plus, Search, Filter } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import TaskApplicationModal from '@/components/TaskApplicationModal'
import TaskMessaging from '@/components/TaskMessaging'
import Navigation from '@/components/shared/Navigation'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { apiRequest } from '@/lib/lib/queryClient'
import type { Task } from '@shared/schema'

interface CommunityTask extends Task {
  postedBy?: string
  postedAt?: string
  price?: number
  participants?: number
  estimatedTime?: string
}

export default function CommunityPage() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuth()
  const [selectedTask, setSelectedTask] = useState<CommunityTask | null>(null)
  const [showApplicationModal, setShowApplicationModal] = useState(false)
  const [selectedTaskForChat, setSelectedTaskForChat] = useState<CommunityTask | null>(null)
  
  // Filtering state
  const [searchTerm, setSearchTerm] = useState('')
  const [difficultyFilter, setDifficultyFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sortBy, setSortBy] = useState('newest')

  // Fetch community tasks from API
  const { data: communityTasks = [], isLoading, error } = useQuery({
    queryKey: ['/api/tasks', 'shared'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/tasks?type=shared')
      const tasks = await response.json()
      return tasks.map((task: Task) => ({
        ...task,
        price: Number(task.earningPotential || 0),
        participants: task.currentParticipants || 0,
        estimatedTime: task.duration || 'Not specified',
        postedBy: 'Community Member', // Placeholder until we have user data
        postedAt: new Date(task.createdAt!).toLocaleDateString(),
      }))
    }
  })

  const handleApplyClick = (task: CommunityTask) => {
    if (!isAuthenticated) {
      router.push('/auth?message=Please sign in to apply for tasks')
      return
    }
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

  // Filter and sort tasks
  const filteredTasks = communityTasks.filter((task: CommunityTask) => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesDifficulty = difficultyFilter === 'all' || task.difficulty === difficultyFilter
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter
    return matchesSearch && matchesDifficulty && matchesStatus
  }).sort((a: CommunityTask, b: CommunityTask) => {
    switch (sortBy) {
      case 'price-high': return (b.price || 0) - (a.price || 0)
      case 'price-low': return (a.price || 0) - (b.price || 0)
      case 'newest': return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
      case 'oldest': return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime()
      default: return 0
    }
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Navigation showBackButton={true} backUrl="/dashboard" title="Community Tasks" />
      
      <div className="max-w-6xl mx-auto p-4">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <h1 className="text-4xl font-bold text-gray-900">Community Tasks</h1>
            <Badge className="bg-blue-100 text-blue-800">7% Platform Fee</Badge>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Join your neighbors in collaborative tasks! Work together, share earnings, 
            and build stronger community connections through group messaging.
          </p>
          <div className="mt-6">
            <Button 
              size="lg" 
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3"
              data-testid="button-create-community-task"
              onClick={() => router.push('/create-task')}
            >
              <Plus className="w-5 h-5 mr-2" />
              Create Community Task
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search tasks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Difficulties</SelectItem>
                <SelectItem value="Easy">Easy</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="Hard">Hard</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
                <SelectItem value="price-high">Highest Pay</SelectItem>
                <SelectItem value="price-low">Lowest Pay</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{communityTasks.filter((t: Task) => t.status === 'open').length}</div>
              <div className="text-sm text-gray-600">Active Tasks</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{communityTasks.reduce((sum: number, t: CommunityTask) => sum + (t.participants || 0), 0)}</div>
              <div className="text-sm text-gray-600">Total Participants</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">${communityTasks.reduce((sum: number, t: CommunityTask) => sum + (t.price || 0), 0)}</div>
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
        {!isLoading && !error && filteredTasks.length > 0 && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredTasks.map((task: CommunityTask) => (
            <Card key={task.id} className="hover:shadow-lg transition-all duration-200 border-0 shadow-md">
              <CardHeader className="pb-4">
                <div className="flex justify-between items-start mb-2">
                  <Badge className={getDifficultyColor(task.difficulty || 'medium')} variant="outline">
                    {task.difficulty || 'Medium'}
                  </Badge>
                  <Badge className={getStatusColor(task.status || 'open')} variant="outline">
                    {task.status || 'Open'}
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
                      {(task.postedBy || 'Unknown').charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="text-sm font-medium">{task.postedBy || 'Unknown'}</div>
                    <div className="text-xs text-gray-500">{task.postedAt || 'Recently'}</div>
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
                      disabled={(task.participants || 0) >= (task.maxParticipants || 1) || task.status !== 'open'}
                      data-testid={`button-join-${task.id}`}
                    >
                      {(task.participants || 0) >= (task.maxParticipants || 1) ? 'Full' : 'Join Task'}
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
              category: selectedTask.categoryId || 'General',
              type: 'community',
              payout: selectedTask.price || 0,
              location: selectedTask.location || 'Not specified',
              time_commitment: selectedTask.estimatedTime || 'Not specified',
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