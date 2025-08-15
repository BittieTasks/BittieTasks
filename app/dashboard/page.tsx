'use client'

import { useState, useEffect } from 'react'
// import { useAuth } from '../../components/auth/AuthProvider' // Removed for testing
import CleanLayout from '../../components/CleanLayout'
import { Button } from '../../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Badge } from '../../components/ui/badge'
{/* Tabs import removed - using card-based navigation now */}
import { useToast } from '../../hooks/use-toast'
import { Coins, TrendingUp, Users, Clock, Calendar, MapPin, Star, Award } from 'lucide-react'
import { useRouter } from 'next/navigation'
import FeeTransparency from '../../components/FeeTransparency'

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
      // Fetch actual user stats from API
      const response = await fetch('/api/auth/profile', {
        credentials: 'include'
      })
      
      if (response.ok) {
        const userProfile = await response.json()
        setStats({
          total_earnings: userProfile.total_earnings || 0,
          tasks_completed: userProfile.tasks_completed || 0,
          active_tasks: userProfile.active_tasks || 0,
          rating: userProfile.rating || 0,
          achievements: userProfile.achievements || [],
          monthly_goal: userProfile.monthly_goal || 500.00,
          subscription_tier: userProfile.subscription_tier || 'free'
        })
      } else {
        // Set realistic starting values for new users
        setStats({
          total_earnings: 0,
          tasks_completed: 0,
          active_tasks: 0,
          rating: 0,
          achievements: [],
          monthly_goal: 500.00,
          subscription_tier: 'free'
        })
      }
    } catch (error) {
      console.error('Error loading user stats:', error)
      setStats({
        total_earnings: 0,
        tasks_completed: 0,
        active_tasks: 0,
        rating: 0,
        achievements: [],
        monthly_goal: 500.00,
        subscription_tier: 'free'
      })
    }
  }

  const loadMyTasks = async () => {
    try {
      // Fetch actual user task applications from API
      const response = await fetch('/api/tasks/applications', {
        credentials: 'include'
      })
      
      if (response.ok) {
        const realTasks = await response.json()
        setMyTasks(realTasks)
      } else {
        // Only show incomplete solo task if user actually has one
        const hasIncompleteApplication = localStorage.getItem('incomplete-solo-application')
        if (hasIncompleteApplication) {
          setMyTasks([{
            id: 'incomplete-solo-1',
            title: 'Solo Task Application (Incomplete)',
            status: 'applied',
            payout: 0,
            location: 'Pending Selection',
            applied_at: new Date().toISOString(),
            task_type: 'solo'
          }])
        } else {
          setMyTasks([])
        }
      }
    } catch (error) {
      console.error('Error loading tasks:', error)
      setMyTasks([])
    } finally {
      setLoading(false)
    }
  }

  const handleTaskClick = (task: TaskActivity) => {
    if (task.id === 'incomplete-solo-1') {
      // Redirect to solo tasks page to complete application
      router.push('/solo')
      toast({
        title: "Complete Your Application",
        description: "Redirecting to solo tasks to complete your application form.",
      })
    } else if (task.status === 'applied' && task.task_type === 'solo') {
      // For other pending solo tasks
      router.push(`/task/${task.id}`)
    } else {
      // For other task types
      router.push(`/task/${task.id}`)
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
                    Welcome back, {user?.firstName || user?.email?.split('@')[0] || 'User'}!
                  </h1>
                  <Badge className={subscriptionBadge.color}>
                    {subscriptionBadge.label}
                  </Badge>
                </div>
                <p className="text-gray-600">
                  Track your earnings, manage tasks, and grow your community impact
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button 
                  onClick={() => window.location.href = '/solo'}
                  className="bg-green-600 hover:bg-green-700 text-white"
                  data-testid="button-solo-tasks"
                >
                  Solo Tasks
                </Button>
                <Button 
                  onClick={() => window.location.href = '/community'}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  data-testid="button-community-tasks"
                >
                  Community
                </Button>
                <Button 
                  onClick={() => window.location.href = '/corporate'}
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                  data-testid="button-corporate-tasks"
                >
                  Corporate
                </Button>
                <Button 
                  onClick={() => window.location.href = '/barter'}
                  className="bg-orange-600 hover:bg-orange-700 text-white"
                  data-testid="button-barter-tasks"
                >
                  Barter
                </Button>
              </div>
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

          {/* Fee Transparency */}
          <div className="mb-8">
            <FeeTransparency variant="full" />
          </div>

          {/* Navigation Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card 
              className={`cursor-pointer transition-all duration-200 ${
                activeTab === 'tasks' 
                  ? 'bg-teal-50 border-teal-200 shadow-md' 
                  : 'bg-white hover:bg-gray-50 border-gray-200'
              }`}
              onClick={() => setActiveTab('tasks')}
            >
              <CardContent className="p-6 text-center">
                <div className={`w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center ${
                  activeTab === 'tasks' ? 'bg-teal-100' : 'bg-gray-100'
                }`}>
                  <Clock className={`w-6 h-6 ${activeTab === 'tasks' ? 'text-teal-600' : 'text-gray-600'}`} />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">My Tasks</h3>
                <p className="text-sm text-gray-500">{myTasks.length} active applications</p>
              </CardContent>
            </Card>

            <Card 
              className={`cursor-pointer transition-all duration-200 ${
                activeTab === 'achievements' 
                  ? 'bg-yellow-50 border-yellow-200 shadow-md' 
                  : 'bg-white hover:bg-gray-50 border-gray-200'
              }`}
              onClick={() => setActiveTab('achievements')}
            >
              <CardContent className="p-6 text-center">
                <div className={`w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center ${
                  activeTab === 'achievements' ? 'bg-yellow-100' : 'bg-gray-100'
                }`}>
                  <Award className={`w-6 h-6 ${activeTab === 'achievements' ? 'text-yellow-600' : 'text-gray-600'}`} />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">Achievements</h3>
                <p className="text-sm text-gray-500">{stats.achievements.length} earned</p>
              </CardContent>
            </Card>

            <Card 
              className={`cursor-pointer transition-all duration-200 ${
                activeTab === 'settings' 
                  ? 'bg-blue-50 border-blue-200 shadow-md' 
                  : 'bg-white hover:bg-gray-50 border-gray-200'
              }`}
              onClick={() => setActiveTab('settings')}
            >
              <CardContent className="p-6 text-center">
                <div className={`w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center ${
                  activeTab === 'settings' ? 'bg-blue-100' : 'bg-gray-100'
                }`}>
                  <Users className={`w-6 h-6 ${activeTab === 'settings' ? 'text-blue-600' : 'text-gray-600'}`} />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">Account</h3>
                <p className="text-sm text-gray-500">Settings & preferences</p>
              </CardContent>
            </Card>
          </div>

          {/* Content sections without Tabs wrapper */}
          <div className="space-y-8">

            {activeTab === 'tasks' && (
              <Card className="bg-white shadow-sm border border-gray-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-teal-600" />
                    My Task Applications
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                {myTasks.map((task) => (
                  <Card 
                    key={task.id} 
                    className="bg-white shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => handleTaskClick(task)}
                  >
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
                            {task.id === 'incomplete-solo-1' && (
                              <Badge className="text-xs bg-orange-100 text-orange-800">
                                Action Required
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
                          {task.id === 'incomplete-solo-1' && (
                            <p className="text-sm text-orange-600 mt-2 font-medium">
                              Click to complete your solo task application
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="flex items-center text-teal-600 font-bold text-lg">
                            <Coins className="w-4 h-4 mr-1" />
                            ${task.payout === 0 ? 'TBD' : task.payout.toFixed(2)}
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
                </CardContent>
              </Card>
            )}

            {activeTab === 'achievements' && (
              <Card className="bg-white shadow-sm border border-gray-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-yellow-600" />
                    Your Achievements
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {stats.achievements.length > 0 ? (
                  stats.achievements.map((achievement, index) => (
                    <Card key={index} className="bg-white shadow-sm border border-gray-200">
                      <CardContent className="p-6 text-center">
                        <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
                          <Award className="w-6 h-6 text-yellow-600" />
                        </div>
                        <h3 className="font-semibold text-gray-900 mb-1">{achievement}</h3>
                        <p className="text-sm text-gray-500">Earned this month</p>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="col-span-full text-center py-12">
                    <div className="text-gray-400 mb-4">
                      <Award className="w-12 h-12 mx-auto" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No achievements yet</h3>
                    <p className="text-gray-500 mb-4">
                      Complete tasks to earn your first achievements
                    </p>
                    <Button 
                      onClick={() => router.push('/solo')}
                      className="bg-teal-600 hover:bg-teal-700 text-white"
                    >
                      Start Earning
                    </Button>
                  </div>
                )}
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === 'settings' && (
              <Card className="bg-white shadow-sm border border-gray-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-blue-600" />
                    Account Settings
                  </CardTitle>
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
                      onClick={() => {
                        console.log('Navigating to subscribe page...')
                        router.push('/subscribe')
                      }}
                      variant="outline"
                      data-testid="button-subscription-upgrade"
                    >
                      Upgrade Plan
                    </Button>
                  </div>
                  

                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </CleanLayout>
  )
}