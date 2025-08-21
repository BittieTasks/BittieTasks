'use client'

import { useState } from 'react'
import { useAuth } from '@/components/auth/SimpleAuthProvider'
import EarningsOverview from '@/components/dashboard/EarningsOverview'
import { useToast } from @/app/hooks/use-toast'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useQuery } from '@tanstack/react-query'
import { 
  Coins, Award, Clock, Star, Plus, ChevronDown, Users, Calendar, MapPin, 
  TrendingUp, CheckCircle, AlertCircle, Loader2, Timer, Crown, Zap, X
} from 'lucide-react'
import TaskDeadlineTimer from '@/components/TaskDeadlineTimer'

interface UserStats {
  total_earnings: number
  tasks_completed: number
  active_tasks: number
  rating: number
  achievements: string[]
  monthly_goal: number
  subscription_tier: string
}

interface TaskActivity {
  id: string
  title: string
  status: 'applied' | 'accepted' | 'completed' | 'verified' | 'joined' | 'expired'
  payout: number
  location: string
  applied_at: string
  task_type: 'shared' | 'solo' | 'sponsored'
  deadline?: string | null
  deadline_extended?: boolean
}

export default function DashboardSection() {
  const { user, isAuthenticated } = useAuth()
  const { toast } = useToast()
  const [showSubscriptionPrompt, setShowSubscriptionPrompt] = useState(true)

  // Fetch user's task applications
  const { data: taskApplications = [], isLoading: applicationsLoading, error: applicationsError } = useQuery({
    queryKey: ['/api/tasks/applications'],
    enabled: isAuthenticated && !!user,
    retry: 1,
    queryFn: async () => {
      const { apiRequest } = await import('@/lib/queryClient')
      const response = await apiRequest('GET', '/api/tasks/applications')
      return response.json()
    }
  })

  // Fetch user's created tasks
  const { data: createdTasks = [], isLoading: createdTasksLoading, error: createdTasksError } = useQuery({
    queryKey: ['/api/tasks/created'],
    enabled: isAuthenticated && !!user,
    retry: 1,
    queryFn: async () => {
      const { apiRequest } = await import('@/lib/queryClient')
      const response = await apiRequest('GET', '/api/tasks/created')
      return response.json()
    }
  })

  // Calculate user stats from live applications data
  const userStats: UserStats = {
    total_earnings: taskApplications.filter((app: TaskActivity) => app.status === 'verified').reduce((sum: number, app: TaskActivity) => sum + app.payout, 0),
    tasks_completed: taskApplications.filter((app: TaskActivity) => app.status === 'completed' || app.status === 'verified').length,
    active_tasks: taskApplications.filter((app: TaskActivity) => app.status === 'applied' || app.status === 'accepted').length,
    rating: user?.app_metadata?.rating || 5.0,
    achievements: user?.app_metadata?.achievements || [],
    monthly_goal: user?.app_metadata?.monthly_goal || 500,
    subscription_tier: user?.app_metadata?.subscription_tier || 'free'
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified': return 'bg-green-100 text-green-800 border-green-200'
      case 'completed': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'accepted': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'applied': return 'bg-gray-100 text-gray-800 border-gray-200'
      case 'joined': return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'expired': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (applicationsLoading || createdTasksLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Welcome back!</h1>
        <p className="text-gray-600">Your live earnings and task activity - real money, authentic data.</p>
      </div>

      {/* Subscription Upgrade Prompt */}
      {showSubscriptionPrompt && (
        <Card className="bg-gradient-to-r from-teal-50 to-purple-50 border-teal-200 mb-6">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-teal-100 rounded-lg">
                  <Crown className="w-8 h-8 text-teal-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Unlock Higher Earnings</h3>
                  <p className="text-gray-600">Upgrade to Pro or Premium to reduce platform fees and access more tasks</p>
                  <div className="flex items-center space-x-4 mt-2">
                    <Badge className="bg-teal-100 text-teal-800">Pro: 7% fee</Badge>
                    <Badge className="bg-purple-100 text-purple-800">Premium: 5% fee</Badge>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Button 
                  onClick={() => window.location.href = '/subscribe'}
                  className="bg-teal-600 hover:bg-teal-700 text-white"
                >
                  <Zap className="w-4 h-4 mr-2" />
                  Upgrade Now
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setShowSubscriptionPrompt(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-white shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Coins className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Earnings</p>
                <p className="text-2xl font-bold text-gray-900">${userStats.total_earnings}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Tasks Completed</p>
                <p className="text-2xl font-bold text-gray-900">{userStats.tasks_completed}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Clock className="w-6 h-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Tasks</p>
                <p className="text-2xl font-bold text-gray-900">{userStats.active_tasks}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Star className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Rating</p>
                <p className="text-2xl font-bold text-gray-900">{userStats.rating.toFixed(1)}★</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Created Tasks Section */}
      <Card className="bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Tasks You Created</span>
            <Badge className="bg-green-100 text-green-800">
              {createdTasks.length} Created
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {createdTasks.length === 0 ? (
            <div className="text-center py-8">
              <Plus className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">No tasks created yet</p>
              <p className="text-sm text-gray-500">Start by creating Community or Barter tasks from the sidebar</p>
            </div>
          ) : (
            <div className="space-y-4">
              {createdTasks.slice(0, 5).map((task: any) => (
                <div key={task.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <Badge className="bg-teal-100 text-teal-800 border-teal-200" variant="outline">
                        {task.type || 'Community'}
                      </Badge>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{task.title}</h4>
                      <div className="flex items-center text-sm text-gray-600 mt-1">
                        <MapPin className="w-4 h-4 mr-1" />
                        <span className="mr-4">{task.location || task.city || 'Location TBD'}</span>
                        <Calendar className="w-4 h-4 mr-1" />
                        <span>{formatDate(task.created_at)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-teal-600">
                      {task.type === 'barter' ? 'FREE' : `$${task.earning_potential || task.earningPotential || 0}`}
                    </div>
                    <div className="text-xs text-gray-500 capitalize">{task.status || 'Open'}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Task Applications */}
      <Card className="bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Tasks You Applied To</span>
            <Badge className="bg-blue-100 text-blue-800">
              {taskApplications.length} Applications
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {taskApplications.length === 0 ? (
            <div className="text-center py-8">
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">No task applications yet</p>
              <p className="text-sm text-gray-500">Start by browsing available Solo, Community, or Corporate tasks</p>
            </div>
          ) : (
            <div className="space-y-4">
              {taskApplications.slice(0, 5).map((task: TaskActivity) => (
                <div key={task.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <Badge className={getStatusColor(task.status)} variant="outline">
                        {task.status}
                      </Badge>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{task.title}</h4>
                      <div className="flex items-center text-sm text-gray-600 mt-1">
                        <MapPin className="w-4 h-4 mr-1" />
                        <span className="mr-4">{task.location}</span>
                        <Calendar className="w-4 h-4 mr-1" />
                        <span>{formatDate(task.applied_at)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-green-600">${task.payout}</div>
                    <div className="flex flex-col items-end">
                      <div className="text-xs text-gray-500 capitalize mb-1">{task.task_type}</div>
                      {task.status === 'applied' && task.task_type === 'solo' && (
                        <div className="text-xs text-orange-600 font-medium">Ready to Complete</div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}