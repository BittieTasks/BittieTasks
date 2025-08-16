'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/auth/AuthProvider'
import EarningsOverview from '@/components/dashboard/EarningsOverview'
import { useToast } from '@/hooks/use-toast'
import CleanLayout from '@/components/CleanLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { useQuery } from '@tanstack/react-query'
import { 
  Coins, Award, Clock, Star, Plus, ChevronDown, Users, Calendar, MapPin, 
  TrendingUp, CheckCircle, AlertCircle, Loader2, Timer 
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

export default function Dashboard() {
  const { user, isAuthenticated, loading: authLoading, signOut } = useAuth()
  const { toast } = useToast()
  const router = useRouter()

  // This component can now be embedded in the unified app
  const isEmbedded = typeof window !== 'undefined' && window.location.pathname === '/dashboard'

  // Fetch user's task applications
  const { data: taskApplications = [], isLoading: applicationsLoading, error: applicationsError } = useQuery({
    queryKey: ['/api/tasks/applications'],
    enabled: isAuthenticated && !!user,
    retry: 1,
    queryFn: async () => {
      const { supabase } = await import('@/lib/supabase')
      const { data: { session } } = await supabase.auth.getSession()
      
      const headers: Record<string, string> = {}
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`
      }
      
      const response = await fetch('/api/tasks/applications', { headers })
      if (!response.ok) {
        throw new Error('Failed to fetch applications')
      }
      return response.json()
    }
  })

  // Calculate user stats from live applications data
  const userStats: UserStats = {
    total_earnings: taskApplications.filter((app: TaskActivity) => app.status === 'verified').reduce((sum: number, app: TaskActivity) => sum + app.payout, 0),
    tasks_completed: taskApplications.filter((app: TaskActivity) => app.status === 'completed' || app.status === 'verified').length,
    active_tasks: taskApplications.filter((app: TaskActivity) => app.status === 'applied' || app.status === 'accepted').length,
    rating: user?.app_metadata?.rating || 5.0, // User's actual rating from metadata
    achievements: user?.app_metadata?.achievements || [],
    monthly_goal: user?.app_metadata?.monthly_goal || 250, // User-set goal
    subscription_tier: user?.app_metadata?.subscription_tier || 'free' // Actual tier
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Authentication Required</h2>
          <p className="text-gray-600 mb-6">You need to be signed in to view your dashboard.</p>
          <Button 
            onClick={() => router.push('/auth')}
            className="bg-teal-600 hover:bg-teal-700 text-white"
          >
            Sign In
          </Button>
        </div>
      </div>
    )
  }

  return (
    <CleanLayout>
      <div className="min-h-screen bg-gray-50 pb-20">
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                    Welcome back, {user?.email?.split('@')[0] || 'User'}!
                  </h1>
                  <Badge className="bg-gray-100 text-gray-800">Free</Badge>
                </div>
                <p className="text-gray-600">
                  Track your earnings, manage tasks, and grow your community impact
                </p>
              </div>
              <div className="flex items-center gap-4">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button className="bg-teal-600 hover:bg-teal-700 text-white" data-testid="dropdown-explore-tasks">
                      <Plus className="w-4 h-4 mr-2" />
                      Explore Tasks
                      <ChevronDown className="w-4 h-4 ml-2" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuItem onClick={() => router.push('/solo')} className="cursor-pointer">
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-teal-500 rounded-full mr-3"></div>
                        <div>
                          <div className="font-medium">Solo Tasks</div>
                          <div className="text-xs text-gray-500">Platform funded • 3% fee</div>
                        </div>
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push('/community')} className="cursor-pointer">
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                        <div>
                          <div className="font-medium">Community Tasks</div>
                          <div className="text-xs text-gray-500">Peer coordination • 7% fee</div>
                        </div>
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push('/corporate')} className="cursor-pointer">
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
                        <div>
                          <div className="font-medium">Corporate Tasks</div>
                          <div className="text-xs text-gray-500">Business partnerships • 15% fee</div>
                        </div>
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push('/barter')} className="cursor-pointer">
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                        <div>
                          <div className="font-medium">Barter Exchange</div>
                          <div className="text-xs text-gray-500">Trade services • 0% fees</div>
                        </div>
                      </div>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button
                  variant="outline"
                  onClick={async () => {
                    try {
                      await signOut()
                      toast({
                        title: "Signed Out",
                        description: "You have been successfully signed out.",
                      })
                    } catch (error) {
                      toast({
                        title: "Sign Out Failed",
                        description: "There was an error signing out. Please try again.",
                        variant: "destructive",
                      })
                    }
                  }}
                  className="text-gray-600 border-gray-300 hover:bg-gray-50"
                  data-testid="button-sign-out"
                >
                  Sign Out
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
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
                    <p className="text-2xl font-bold text-gray-900">{userStats.rating}/5</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Pending Tasks Section */}
          {taskApplications.filter((app: TaskActivity) => app.status === 'joined').length > 0 && (
            <Card className="bg-orange-50 border-orange-200 shadow-sm mb-6">
              <CardHeader>
                <CardTitle className="text-xl font-semibold flex items-center gap-2">
                  <Clock className="h-5 w-5 text-orange-600" />
                  Tasks Awaiting Completion ({taskApplications.filter((app: TaskActivity) => app.status === 'joined').length})
                </CardTitle>
                <p className="text-sm text-orange-700">
                  Complete these tasks to earn your rewards
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                {taskApplications
                  .filter((app: TaskActivity) => app.status === 'joined')
                  .map((task: TaskActivity) => (
                    <div key={task.id} className="bg-white border border-orange-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 mb-1">{task.title}</h3>
                          <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                            <span className="flex items-center gap-1">
                              <Coins className="h-4 w-4 text-green-600" />
                              ${task.payout}
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              {task.location}
                            </span>
                            <Badge variant="outline" className="bg-blue-50 text-blue-700">
                              {task.task_type}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-xs text-gray-500">
                              Applied {new Date(task.applied_at).toLocaleDateString()}
                            </p>
                            {task.deadline && (
                              <TaskDeadlineTimer 
                                deadline={task.deadline} 
                                isExtended={task.deadline_extended}
                                className="text-xs"
                              />
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {task.deadline && !task.deadline_extended && new Date(task.deadline) > new Date() && (
                            <Button 
                              size="sm"
                              variant="outline"
                              className="text-orange-600 border-orange-300 hover:bg-orange-50"
                              onClick={async () => {
                                try {
                                  const { supabase } = await import('@/lib/supabase')
                                  const { data: { session } } = await supabase.auth.getSession()
                                  
                                  const response = await fetch('/api/tasks/extend-deadline', {
                                    method: 'POST',
                                    headers: {
                                      'Content-Type': 'application/json',
                                      'Authorization': `Bearer ${session?.access_token}`
                                    },
                                    body: JSON.stringify({ taskId: task.id })
                                  })
                                  
                                  if (response.ok) {
                                    toast({
                                      title: "Deadline Extended",
                                      description: "You have 12 more hours to complete this task.",
                                    })
                                    window.location.reload()
                                  } else {
                                    const data = await response.json()
                                    toast({
                                      title: "Extension Failed",
                                      description: data.error || "Could not extend deadline.",
                                      variant: "destructive",
                                    })
                                  }
                                } catch (error) {
                                  toast({
                                    title: "Extension Failed",
                                    description: "Network error occurred.",
                                    variant: "destructive",
                                  })
                                }
                              }}
                              data-testid={`button-extend-${task.id}`}
                            >
                              +12h
                            </Button>
                          )}
                          <Button 
                            size="sm" 
                            className="bg-orange-600 hover:bg-orange-700 text-white"
                            onClick={() => {
                              // For solo tasks, open the task application modal to complete verification
                              if (task.task_type === 'solo') {
                                router.push(`/solo?complete=${task.id}`)
                              } else {
                                router.push(`/task/${task.id}`)
                              }
                            }}
                            data-testid={`button-complete-${task.id}`}
                          >
                            Complete Task
                          </Button>
                        </div>
                      </div>
                      <div className="bg-orange-100 border border-orange-300 rounded-md p-3">
                        <div className="flex items-start justify-between">
                          <p className="text-sm text-orange-800 flex-1">
                            📸 Ready to complete? Upload verification photos to receive your ${task.payout} payment!
                          </p>
                          {task.deadline && !task.deadline_extended && (
                            <p className="text-xs text-orange-600 ml-2 text-right">
                              ⏰ Auto-forfeit if not completed by deadline
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
              </CardContent>
            </Card>
          )}

          {/* Recent Applications */}
          <Card className="bg-white shadow-sm mb-6">
            <CardHeader>
              <CardTitle className="text-xl font-semibold">Recent Task Applications</CardTitle>
            </CardHeader>
            <CardContent>
              {applicationsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
                  <span className="ml-2 text-gray-600">Loading your applications...</span>
                </div>
              ) : applicationsError ? (
                <div className="text-center py-8">
                  <AlertCircle className="w-12 h-12 mx-auto text-red-500 mb-4" />
                  <p className="text-gray-600 mb-4">Unable to load applications</p>
                  <Button 
                    onClick={() => window.location.reload()}
                    variant="outline"
                  >
                    Try Again
                  </Button>
                </div>
              ) : taskApplications.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-gray-400 mb-4">
                    <Calendar className="w-16 h-16 mx-auto" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Applications Yet</h3>
                  <p className="text-gray-500 mb-6">
                    Start by applying to your first task to see your activity here.
                  </p>
                  <div className="flex gap-3 justify-center">
                    <Button 
                      onClick={() => router.push('/solo')}
                      className="bg-teal-600 hover:bg-teal-700 text-white"
                    >
                      Browse Solo Tasks
                    </Button>
                    <Button 
                      onClick={() => router.push('/community')}
                      variant="outline"
                      className="border-blue-600 text-blue-600 hover:bg-blue-50"
                    >
                      Community Tasks
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {taskApplications.slice(0, 5).map((application: TaskActivity) => (
                    <div key={application.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className={`w-3 h-3 rounded-full ${
                          application.status === 'verified' ? 'bg-green-500' :
                          application.status === 'completed' ? 'bg-blue-500' :
                          application.status === 'accepted' ? 'bg-orange-500' :
                          'bg-gray-400'
                        }`}></div>
                        <div>
                          <h4 className="font-medium text-gray-900">{application.title}</h4>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span className="capitalize">{application.status.replace('_', ' ')}</span>
                            <span>•</span>
                            <span>${application.payout}</span>
                            <span>•</span>
                            <span>{application.location}</span>
                          </div>
                        </div>
                      </div>
                      <Badge 
                        className={
                          application.status === 'verified' ? 'bg-green-100 text-green-800' :
                          application.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                          application.status === 'accepted' ? 'bg-orange-100 text-orange-800' :
                          'bg-gray-100 text-gray-800'
                        }
                      >
                        {application.status}
                      </Badge>
                    </div>
                  ))}
                  
                  {taskApplications.length > 5 && (
                    <div className="text-center pt-4">
                      <Button variant="outline" onClick={() => router.push('/earnings')}>
                        View All Applications ({taskApplications.length})
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </CleanLayout>
  )
}