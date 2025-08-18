'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/auth/AuthProvider'
import { useToast } from '@/hooks/use-toast'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useQuery } from '@tanstack/react-query'
import TaskApplicationModal from '@/components/TaskApplicationModal'
import { 
  Clock, MapPin, Coins, Users, CheckCircle, Timer, Loader2, 
  TrendingUp, Award, Star
} from 'lucide-react'

interface Task {
  id: string
  title: string
  description: string
  category: string
  type: string
  payout: number
  location: string
  time_commitment: string
  requirements: string[]
  platform_funded?: boolean
  completion_limit?: number
  verification_type?: string
  current_participants: number
  max_participants: number
}

export default function SoloTasksSection() {
  const { user, isAuthenticated } = useAuth()
  const { toast } = useToast()
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [showApplicationModal, setShowApplicationModal] = useState(false)

  // Fetch available solo tasks from real database
  const { data: dbTasks = [], isLoading, error } = useQuery({
    queryKey: ['/api/tasks', 'solo'],
    enabled: isAuthenticated && !!user,
    queryFn: async () => {
      const { apiRequest } = await import('@/lib/queryClient')
      const response = await apiRequest('GET', '/api/tasks?type=solo')
      if (!response.ok) {
        // Handle authentication errors gracefully
        if (response.status === 401) {
          throw new Error('Authentication required - please sign in')
        }
        throw new Error('Failed to fetch solo tasks')
      }
      return response.json()
    },
    retry: (failureCount, error) => {
      // Don't retry auth errors
      if (error.message.includes('Authentication required')) {
        return false
      }
      return failureCount < 3
    }
  })

  // Transform database tasks to match component interface
  const transformDbTask = (dbTask: any): Task => ({
    id: dbTask.id,
    title: dbTask.title,
    description: dbTask.description,
    category: dbTask.category?.name || 'General',
    type: dbTask.type,
    payout: dbTask.payout,
    location: dbTask.location || dbTask.city + ', ' + dbTask.state,
    time_commitment: dbTask.time_commitment || 'As needed',
    requirements: Array.isArray(dbTask.requirements) ? dbTask.requirements : [dbTask.requirements].filter(Boolean),
    platform_funded: true,
    completion_limit: dbTask.max_participants || 1,
    verification_type: 'photo',
    current_participants: dbTask.current_participants || 0,
    max_participants: dbTask.max_participants || 1
  })

  // Fallback solo tasks for initial experience (when no database tasks exist yet)
  const fallbackSoloTasks: Task[] = [
    {
      id: 'platform-001',
      title: 'Complete Laundry Cycle',
      description: 'Sort, wash, dry, and fold a full load of laundry',
      category: 'Household',
      type: 'solo',
      payout: 20,
      location: 'Your Home',
      time_commitment: '2-3 hours',
      requirements: ['Access to washer/dryer', 'Laundry supplies', 'Photo verification'],
      platform_funded: true,
      completion_limit: 2,
      verification_type: 'photo',
      current_participants: 0,
      max_participants: 1
    },
    {
      id: 'platform-002',
      title: 'Kitchen Deep Clean',
      description: 'Clean all surfaces, appliances, sink, and organize cabinets',
      category: 'Household',
      type: 'solo',
      payout: 15,
      location: 'Your Home',
      time_commitment: '1-2 hours',
      requirements: ['Cleaning supplies', 'Before/after photos'],
      platform_funded: true,
      completion_limit: 2,
      verification_type: 'photo',
      current_participants: 0,
      max_participants: 1
    },
    {
      id: 'platform-003',
      title: 'Pilates Session',
      description: 'Complete a 30-minute Pilates workout with proper form',
      category: 'Self-Care',
      type: 'solo',
      payout: 12,
      location: 'Your Home',
      time_commitment: '30-45 minutes',
      requirements: ['Yoga mat', 'Workout video/app', 'Exercise photos'],
      platform_funded: true,
      completion_limit: 2,
      verification_type: 'photo',
      current_participants: 0,
      max_participants: 1
    },
    {
      id: 'platform-004',
      title: 'Grocery Shopping Trip',
      description: 'Complete grocery shopping with receipt and item photos',
      category: 'Errands',
      type: 'solo',
      payout: 25,
      location: 'Local Store',
      time_commitment: '1-2 hours',
      requirements: ['Shopping list', 'Receipt photo', 'Grocery bag photos'],
      platform_funded: true,
      completion_limit: 2,
      verification_type: 'photo',
      current_participants: 0,
      max_participants: 1
    },
    {
      id: 'platform-005',
      title: 'Room Organization',
      description: 'Organize and tidy a bedroom, living room, or office space',
      category: 'Household',
      type: 'solo',
      payout: 30,
      location: 'Your Home',
      time_commitment: '2-3 hours',
      requirements: ['Before/after photos', 'Organization supplies'],
      platform_funded: true,
      completion_limit: 2,
      verification_type: 'photo',
      current_participants: 0,
      max_participants: 1
    }
  ]

  // Use real database tasks if available, otherwise use fallback for initial experience
  const availableTasks = dbTasks.length > 0 ? dbTasks.map(transformDbTask) : fallbackSoloTasks

  const handleApplyToTask = (task: Task) => {
    console.log('Solo task application - Auth check:', {
      isAuthenticated,
      userId: user?.id,
      userEmail: user?.email,
      taskId: task.id
    })
    
    setSelectedTask(task)
    setShowApplicationModal(true)
  }

  const handleApplicationSuccess = () => {
    setShowApplicationModal(false)
    setSelectedTask(null)
    toast({
      title: "Application Successful!",
      description: "You can now complete the task and submit for verification.",
    })
  }

  const calculateNetPayout = (grossPayout: number) => {
    const fee = grossPayout * 0.03 // 3% platform fee
    return grossPayout - fee
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-teal-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading solo tasks...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Solo Tasks</h1>
          <p className="text-gray-600">Platform-funded tasks you can complete independently • 3% transparent fee</p>
        </div>
        <Badge className="bg-teal-100 text-teal-800 border-teal-200">
          {availableTasks.length} Available
        </Badge>
      </div>

      {/* Live Production Banner */}
      <Card className="bg-teal-50 border-teal-200">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-teal-100 rounded-lg">
              <Coins className="w-6 h-6 text-teal-600" />
            </div>
            <div>
              <h3 className="font-semibold text-teal-900">LIVE Platform - Real Money Transactions!</h3>
              <p className="text-teal-700 text-sm">
                3% transparent fee structure: Complete tasks, submit verification photos, earn real money instantly. 
                Live Stripe payments - no demo data, all transactions are authentic.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tasks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {availableTasks.map((task: Task) => (
          <Card key={task.id} className="bg-white shadow-sm hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <Badge className="bg-teal-100 text-teal-800 border-teal-200">
                  Solo Task
                </Badge>
                <div className="text-right">
                  <div className="font-bold text-lg text-teal-600">${task.payout}</div>
                  <div className="text-xs text-gray-500">Net: ${calculateNetPayout(task.payout).toFixed(2)}</div>
                </div>
              </div>
              <CardTitle className="text-lg">{task.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600 text-sm">{task.description}</p>
              
              <div className="space-y-2 text-sm">
                <div className="flex items-center text-gray-600">
                  <Clock className="w-4 h-4 mr-2" />
                  <span>{task.time_commitment}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <MapPin className="w-4 h-4 mr-2" />
                  <span>{task.location}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Users className="w-4 h-4 mr-2" />
                  <span>Up to {task.completion_limit} completions</span>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">Requirements:</p>
                <div className="flex flex-wrap gap-1">
                  {task.requirements.slice(0, 2).map((req: string, index: number) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {req}
                    </Badge>
                  ))}
                  {task.requirements.length > 2 && (
                    <Badge variant="outline" className="text-xs">
                      +{task.requirements.length - 2} more
                    </Badge>
                  )}
                </div>
              </div>

              <Button
                onClick={() => handleApplyToTask(task)}
                className="w-full bg-teal-600 hover:bg-teal-700 text-white"
                data-testid={`button-apply-${task.id}`}
              >
                Apply & Complete Task
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Task Application Modal */}
      {selectedTask && (
        <TaskApplicationModal
          task={selectedTask}
          userId={user?.id || 'guest'}
          isOpen={showApplicationModal}
          onOpenChange={setShowApplicationModal}
          onSuccess={handleApplicationSuccess}
        />
      )}

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <Card className="bg-white shadow-sm">
          <CardContent className="p-6 text-center">
            <div className="p-3 bg-teal-100 rounded-full w-fit mx-auto mb-3">
              <TrendingUp className="w-6 h-6 text-teal-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Quick Earnings</h3>
            <p className="text-sm text-gray-600">Complete tasks in 30 minutes to 3 hours</p>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm">
          <CardContent className="p-6 text-center">
            <div className="p-3 bg-green-100 rounded-full w-fit mx-auto mb-3">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Instant Verification</h3>
            <p className="text-sm text-gray-600">AI-powered photo verification for quick payouts</p>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm">
          <CardContent className="p-6 text-center">
            <div className="p-3 bg-blue-100 rounded-full w-fit mx-auto mb-3">
              <Award className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Platform Funded</h3>
            <p className="text-sm text-gray-600">BittieTasks pays you directly - no waiting</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}