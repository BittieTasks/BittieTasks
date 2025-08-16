'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/auth/AuthProvider'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MapPin, Clock, DollarSign, User, Users, Star, ArrowLeft, Menu, Loader2 } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useRouter } from 'next/navigation'
import TaskApplicationModal from '@/components/TaskApplicationModal'
import { useQuery } from '@tanstack/react-query'

interface SoloTask {
  id: string
  title: string
  description: string
  price: number
  location: string
  timeEstimate: string
  category: string
  difficulty: 'Easy' | 'Medium' | 'Hard'
  requiredSkills: string[]
  rating: number
  completedCount: number
  maxUsers?: number
  platform_funded?: boolean
  verification_type?: string
}

// Fetch live solo tasks from database
function useSoloTasks() {
  return useQuery({
    queryKey: ['/api/solo-tasks'],
    queryFn: async () => {
      const response = await fetch('/api/solo-tasks')
      if (!response.ok) {
        throw new Error('Failed to fetch solo tasks')
      }
      const data = await response.json()
      return data.tasks || []
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export default function SoloPage() {
  const [selectedTask, setSelectedTask] = useState<SoloTask | null>(null)
  const [showApplicationModal, setShowApplicationModal] = useState(false)
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()
  
  // Fetch live solo tasks from database
  const { data: soloTasks = [], isLoading, error } = useSoloTasks()
  
  // Check for completion parameter from dashboard
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const completeTaskId = urlParams.get('complete')
    
    if (completeTaskId && isAuthenticated && soloTasks.length > 0) {
      // Find the task to complete
      const taskToComplete = soloTasks.find((task: SoloTask) => task.id === completeTaskId)
      if (taskToComplete) {
        setSelectedTask(taskToComplete)
        setShowApplicationModal(true)
      }
    }
  }, [isAuthenticated, soloTasks])

  const handleApplyClick = (task: SoloTask) => {
    if (!isAuthenticated) {
      // Guide unauthenticated users to sign in
      router.push('/auth?message=Please sign in to apply for tasks')
      return
    }
    setSelectedTask(task)
    setShowApplicationModal(true)
  }

  const handleApplicationSuccess = () => {
    // Close modal and redirect to dashboard after successful verification and payment
    setShowApplicationModal(false)
    setSelectedTask(null)
    router.push('/dashboard?message=Task completed and payment processed!')
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'bg-green-100 text-green-800 border-green-200'
      case 'Medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'Hard': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-green-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading solo tasks...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Failed to load solo tasks</p>
          <Button onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Navigation Header */}
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            onClick={() => router.push('/dashboard')}
            className="flex items-center gap-2 text-gray-700 hover:text-green-600"
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
              <DropdownMenuItem onClick={() => router.push('/community')}>
                Community Tasks
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
            Solo Tasks
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {soloTasks.length} active BittieTasks-funded household and self-care tasks. Complete these platform-paid tasks with our convenient solo format.
            Small 3% processing fee for the solo convenience. Limited to 2 users per task.
          </p>
        </div>

        {/* Stats Bar */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{soloTasks.length}</div>
              <div className="text-sm text-gray-600">Available Tasks</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                ${soloTasks.length > 0 ? Math.round(soloTasks.reduce((sum: number, task: SoloTask) => sum + task.price, 0) / soloTasks.length) : 0}
              </div>
              <div className="text-sm text-gray-600">Average Payout</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">4.7★</div>
              <div className="text-sm text-gray-600">Average Rating</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">97%</div>
              <div className="text-sm text-gray-600">Your Take-Home</div>
            </div>
          </div>
        </div>

        {/* Empty state */}
        {soloTasks.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">No solo tasks available at the moment</p>
            <Button onClick={() => window.location.reload()}>
              Refresh
            </Button>
          </div>
        )}

        {/* Task Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {soloTasks.map((task: SoloTask) => (
            <Card key={task.id} className="hover:shadow-lg transition-all duration-200 border-0 shadow-md">
              <CardHeader className="pb-4">
                <div className="flex justify-between items-start mb-2">
                  <Badge className={getDifficultyColor(task.difficulty)}>
                    {task.difficulty}
                  </Badge>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm text-gray-600">{task.rating}</span>
                  </div>
                </div>
                <CardTitle className="text-lg font-bold text-gray-900 leading-tight">
                  {task.title}
                </CardTitle>
                <CardDescription className="text-gray-600 leading-relaxed">
                  {task.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <DollarSign className="w-4 h-4 text-green-600" />
                    <span className="font-semibold text-green-600">${task.price}</span>
                    <span>({task.maxUsers || 2} spots)</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span>{task.timeEstimate}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="w-4 h-4" />
                    <span>{task.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <User className="w-4 h-4" />
                    <span>{task.category}</span>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-xs font-medium text-gray-500 mb-2">Requirements:</p>
                  <div className="flex flex-wrap gap-1">
                    {task.requiredSkills.map((skill, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>

                <Button 
                  onClick={() => handleApplyClick(task)}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-medium"
                  data-testid={`apply-task-${task.id}`}
                >
                  Apply & Start
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Application Modal */}
      {selectedTask && (
        <TaskApplicationModal
          task={{
            id: selectedTask.id,
            title: selectedTask.title,
            description: selectedTask.description,
            category: selectedTask.category,
            type: 'solo',
            payout: selectedTask.price,
            location: selectedTask.location,
            time_commitment: selectedTask.timeEstimate,
            requirements: selectedTask.requiredSkills,
            platform_funded: true,
            completion_limit: selectedTask.maxUsers,
            verification_type: 'photo'
          }}
          userId={user?.id || ''}
          isOpen={showApplicationModal}
          onOpenChange={setShowApplicationModal}
          onSuccess={handleApplicationSuccess}
        />
      )}
    </div>
  )
}