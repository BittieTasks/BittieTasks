'use client'

import { useState, useEffect } from 'react'
// import { useAuth } from '../../components/auth/AuthProvider' // Removed for testing
import CleanLayout from '../../components/CleanLayout'
import { Button } from '../../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Badge } from '../../components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs'
import { useToast } from '../../hooks/use-toast'
import { Coins, TrendingUp, Users, Clock, Calendar, MapPin, Star, Award } from 'lucide-react'
import { useRouter } from 'next/navigation'

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
  status: 'applied' | 'accepted' | 'completed' | 'verified'
  payout: number
  location: string
  applied_at: string
  task_type: 'shared' | 'solo' | 'sponsored'
}

export default function Dashboard() {
  // const { user } = useAuth() // Removed for testing
  const user = { 
    firstName: 'Test User',
    email: 'test@example.com',
    user_metadata: { subscription_tier: 'free' } 
  } // Mock user for testing
  const { toast } = useToast()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<UserStats>({
    total_earnings: 0,
    tasks_completed: 0,
    active_tasks: 0,
    rating: 0,
    achievements: [],
    monthly_goal: 500,
    subscription_tier: 'free'
  })
  const [myTasks, setMyTasks] = useState<TaskActivity[]>([])
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    if (user) {
      loadUserStats()
      loadMyTasks()
    }
  }, [user])

  const loadUserStats = async () => {
    try {
      // Mock user stats for now - will connect to profile API
      const mockStats: UserStats = {
        total_earnings: 324.50,
        tasks_completed: 12,
        active_tasks: 3,
        rating: 4.8,
        achievements: ['Early Adopter', 'Community Helper', 'Reliable Partner'],
        monthly_goal: 500.00,
        subscription_tier: user?.user_metadata?.subscription_tier || 'free'
      }
      setStats(mockStats)
    } catch (error) {
      console.error('Error loading user stats:', error)
    }
  }

  const loadMyTasks = async () => {
    try {
      // Mock task activity for now - will connect to API
      const mockTasks: TaskActivity[] = [
        {
          id: '1',
          title: 'School Pickup Carpool',
          status: 'accepted',
          payout: 25.00,
          location: 'Lincoln Elementary',
          applied_at: new Date().toISOString(),
          task_type: 'shared'
        },
        {
          id: '2',
          title: 'Grocery Shopping Helper',
          status: 'completed',
          payout: 35.00,
          location: 'Safeway',
          applied_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          task_type: 'solo'
        },
        {
          id: '3',
          title: 'After-School Activities',
          status: 'applied',
          payout: 45.00,
          location: 'Community Center',
          applied_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          task_type: 'shared'
        }
      ]
      setMyTasks(mockTasks)
    } catch (error) {
      console.error('Error loading tasks:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'applied': return 'bg-blue-100 text-blue-800'
      case 'accepted': return 'bg-green-100 text-green-800'
      case 'completed': return 'bg-purple-100 text-purple-800'
      case 'verified': return 'bg-teal-100 text-teal-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getSubscriptionBadge = (tier: string) => {
    switch (tier) {
      case 'pro': return { color: 'bg-blue-100 text-blue-800', label: 'Pro' }
      case 'premium': return { color: 'bg-purple-100 text-purple-800', label: 'Premium' }
      default: return { color: 'bg-gray-100 text-gray-800', label: 'Free' }
    }
  }

  if (loading) {
    return (
      <CleanLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      </CleanLayout>
    )
  }

  const subscriptionBadge = getSubscriptionBadge(stats.subscription_tier)
  const progressPercentage = (stats.total_earnings / stats.monthly_goal) * 100

  return (
    <CleanLayout>
      <div className="min-h-screen bg-gray-50 pb-20">
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                    Welcome back, {user?.user_metadata?.firstName || user?.email?.split('@')[0] || 'User'}!
                  </h1>
                  <Badge className={subscriptionBadge.color}>
                    {subscriptionBadge.label}
                  </Badge>
                </div>
                <p className="text-gray-600">
                  Track your earnings, manage tasks, and grow your community impact
                </p>
              </div>
              <Button 
                onClick={() => router.push('/marketplace')}
                className="bg-teal-600 hover:bg-teal-700 text-white"
                data-testid="button-browse-tasks"
              >
                Browse Tasks
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Total Earnings */}
            <Card className="bg-white shadow-sm border border-gray-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Total Earnings</p>
                    <p className="text-2xl font-bold text-gray-900">
                      ${stats.total_earnings.toFixed(2)}
                    </p>
                  </div>
                  <div className="p-3 bg-teal-100 rounded-lg">
                    <Coins className="w-6 h-6 text-teal-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tasks Completed */}
            <Card className="bg-white shadow-sm border border-gray-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Tasks Completed</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.tasks_completed}</p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-lg">
                    <Award className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Active Tasks */}
            <Card className="bg-white shadow-sm border border-gray-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Active Tasks</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.active_tasks}</p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Clock className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Rating */}
            <Card className="bg-white shadow-sm border border-gray-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Rating</p>
                    <div className="flex items-center gap-1">
                      <p className="text-2xl font-bold text-gray-900">{stats.rating.toFixed(1)}</p>
                      <Star className="w-5 h-5 text-yellow-400 fill-current" />
                    </div>
                  </div>
                  <div className="p-3 bg-yellow-100 rounded-lg">
                    <TrendingUp className="w-6 h-6 text-yellow-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Monthly Goal Progress */}
          <Card className="bg-white shadow-sm border border-gray-200 mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Monthly Goal Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    ${stats.total_earnings.toFixed(2)} of ${stats.monthly_goal.toFixed(2)} goal
                  </span>
                  <span className="text-sm font-medium text-gray-900">
                    {Math.round(progressPercentage)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-teal-600 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                  />
                </div>
                <p className="text-sm text-gray-500">
                  {progressPercentage >= 100 
                    ? "🎉 Congratulations! You've reached your monthly goal!"
                    : `$${(stats.monthly_goal - stats.total_earnings).toFixed(2)} to go this month`
                  }
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Tabs for different views */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="tasks">My Tasks</TabsTrigger>
              <TabsTrigger value="achievements">Achievements</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="tasks" className="mt-6">
              <div className="space-y-4">
                {myTasks.map((task) => (
                  <Card key={task.id} className="bg-white shadow-sm border border-gray-200">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-gray-900">{task.title}</h3>
                            <Badge className={`text-xs ${getStatusColor(task.status)}`}>
                              {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                            </Badge>
                            {task.task_type === 'sponsored' && (
                              <Badge className="text-xs bg-yellow-100 text-yellow-800">
                                Sponsored
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <div className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              {task.location}
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              Applied {new Date(task.applied_at).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center text-teal-600 font-bold text-lg">
                            <Coins className="w-4 h-4 mr-1" />
                            ${task.payout.toFixed(2)}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {myTasks.length === 0 && (
                  <div className="text-center py-12">
                    <div className="text-gray-400 mb-4">
                      <Clock className="w-12 h-12 mx-auto" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No active tasks</h3>
                    <p className="text-gray-500 mb-4">
                      Start earning by applying to tasks in the marketplace
                    </p>
                    <Button 
                      onClick={() => router.push('/marketplace')}
                      className="bg-teal-600 hover:bg-teal-700 text-white"
                      data-testid="button-browse-tasks-empty"
                    >
                      Browse Tasks
                    </Button>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="achievements" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {stats.achievements.map((achievement, index) => (
                  <Card key={index} className="bg-white shadow-sm border border-gray-200">
                    <CardContent className="p-6 text-center">
                      <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Award className="w-6 h-6 text-yellow-600" />
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-1">{achievement}</h3>
                      <p className="text-sm text-gray-500">Earned this month</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="settings" className="mt-6">
              <Card className="bg-white shadow-sm border border-gray-200">
                <CardHeader>
                  <CardTitle>Account Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-900">Subscription Plan</h4>
                      <p className="text-sm text-gray-500">
                        Current plan: {subscriptionBadge.label}
                      </p>
                    </div>
                    <Button 
                      onClick={() => router.push('/subscription')}
                      variant="outline"
                      data-testid="button-subscription-upgrade"
                    >
                      Upgrade Plan
                    </Button>
                  </div>
                  

                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </CleanLayout>
  )
}