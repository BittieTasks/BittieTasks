'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/auth/AuthProvider'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CheckCircle, Clock, DollarSign, Calendar, ArrowRight, TrendingUp } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface TaskParticipant {
  id: string
  task_id: string
  status: string
  joined_at: string
  completed_at?: string
  deadline?: string
  task: {
    id: string
    title: string
    category: string
    payout: number
    time_estimate: string
    difficulty: string
  }
}

interface Transaction {
  id: string
  amount: number
  fee_amount: number
  gross_amount: number
  processed_at: string
  description: string
  status: string
}

export default function DashboardPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [activeTasks, setActiveTasks] = useState<TaskParticipant[]>([])
  const [completedTasks, setCompletedTasks] = useState<TaskParticipant[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [stats, setStats] = useState({
    totalEarnings: 0,
    tasksCompleted: 0,
    activeTasks: 0,
    avgEarning: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Wait for auth to load before redirecting
    if (!authLoading && !isAuthenticated && !user) {
      console.log('Dashboard: Redirecting unauthenticated user to auth page')
      router.push('/auth?redirect=/dashboard')
      return
    }
    
    // Only fetch data if we have a confirmed authenticated user
    if (!authLoading && isAuthenticated && user) {
      fetchDashboardData()
    }
  }, [isAuthenticated, user, authLoading, router])

  const fetchDashboardData = async () => {
    try {
      console.log('Dashboard: Fetching data for user:', user?.email)
      
      // Get authentication token from manual auth system
      const manualSession = JSON.parse(localStorage.getItem('bittie_manual_session') || 'null')
      console.log('Dashboard: Manual session check:', {
        hasSession: !!manualSession,
        hasAccessToken: !!manualSession?.access_token,
        tokenLength: manualSession?.access_token?.length || 0,
        userEmail: manualSession?.user?.email
      })
      
      if (!manualSession?.access_token) {
        throw new Error('No valid authentication - please sign in again')
      }
      
      console.log('Dashboard: Using manual authentication token:', manualSession.access_token.substring(0, 30) + '...')

      const response = await fetch('/api/dashboard', {
        headers: {
          'Authorization': `Bearer ${manualSession.access_token}`
        }
      })
      
      console.log('Dashboard: API response:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        headers: Object.fromEntries(response.headers.entries())
      })
      
      if (!response.ok) {
        const errorText = await response.text()
        console.log('Dashboard: API error details:', {
          status: response.status,
          statusText: response.statusText,
          errorText: errorText,
          url: response.url
        })
        throw new Error(`Dashboard API failed (${response.status}): ${errorText}`)
      }



      const data = await response.json()
      
      setActiveTasks(data.activeTasks || [])
      setCompletedTasks(data.completedTasks || [])
      setTransactions(data.transactions || [])
      setStats(data.stats || {
        totalEarnings: 0,
        tasksCompleted: 0,
        activeTasks: 0,
        avgEarning: 0
      })
    } catch (error) {
      console.error('Dashboard fetch error:', error)
      
      // Check if this is an authentication error
      if (error instanceof Error && error.message.includes('session')) {
        toast({
          title: "Session Expired",
          description: "Please sign in again to continue.",
          variant: "destructive",
        })
        router.push('/auth?redirect=/dashboard')
      } else {
        toast({
          title: "Error Loading Dashboard",
          description: "Failed to load your dashboard data. Please try again.",
          variant: "destructive",
        })
      }
    } finally {
      setLoading(false)
    }
  }

  const handleCompleteTask = (taskId: string) => {
    router.push(`/task/${taskId}/start`)
  }

  const calculateNetPayout = (grossPayout: number) => {
    const fee = Math.round(grossPayout * 0.03)
    return grossPayout - fee
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'auto_approved': return 'bg-green-100 text-green-800'
      case 'completed': return 'bg-blue-100 text-blue-800'
      case 'pending_verification': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'auto_approved': return 'Ready to Work'
      case 'completed': return 'Completed'
      case 'pending_verification': return 'Under Review'
      default: return status
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-gray-600">Track your tasks and earnings</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Earnings</p>
                  <p className="text-2xl font-bold text-green-600">
                    ${stats.totalEarnings.toFixed(2)}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Tasks Completed</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.tasksCompleted}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Tasks</p>
                  <p className="text-2xl font-bold text-orange-600">{stats.activeTasks}</p>
                </div>
                <Clock className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg per Task</p>
                  <p className="text-2xl font-bold text-purple-600">
                    ${stats.avgEarning.toFixed(2)}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="active" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="active">
              Active Tasks ({activeTasks.length})
            </TabsTrigger>
            <TabsTrigger value="completed">
              Completed ({completedTasks.length})
            </TabsTrigger>
            <TabsTrigger value="earnings">
              Earnings History
            </TabsTrigger>
          </TabsList>

          {/* Active Tasks */}
          <TabsContent value="active" className="space-y-6">
            {activeTasks.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Active Tasks</h3>
                  <p className="text-gray-600 mb-4">
                    You don't have any tasks in progress. Browse available tasks to start earning!
                  </p>
                  <Button onClick={() => router.push('/solo-tasks')}>
                    Browse Solo Tasks
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {activeTasks.map((participant) => (
                  <Card key={participant.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start mb-2">
                        <Badge className={getStatusColor(participant.status)}>
                          {getStatusText(participant.status)}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {participant.task.category}
                        </span>
                      </div>
                      <CardTitle className="text-lg">{participant.task.title}</CardTitle>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Clock className="h-4 w-4" />
                        <span>{participant.task.time_estimate}</span>
                      </div>

                      <div className="flex justify-between items-center">
                        <div>
                          <div className="text-lg font-bold text-green-600">
                            ${calculateNetPayout(participant.task.payout)}
                          </div>
                          <div className="text-xs text-gray-500">
                            ${participant.task.payout} - 3% fee
                          </div>
                        </div>
                        
                        {participant.status === 'auto_approved' && (
                          <Button 
                            size="sm"
                            onClick={() => handleCompleteTask(participant.task.id)}
                          >
                            Complete
                            <ArrowRight className="h-4 w-4 ml-1" />
                          </Button>
                        )}
                      </div>

                      <div className="text-xs text-gray-500 space-y-1">
                        <div>Started: {new Date(participant.joined_at).toLocaleDateString()}</div>
                        {participant.deadline && (
                          <div className="text-orange-600">
                            <Clock className="h-3 w-3 inline mr-1" />
                            Due: {new Date(participant.deadline).toLocaleString()}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Completed Tasks */}
          <TabsContent value="completed" className="space-y-6">
            {completedTasks.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <CheckCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Completed Tasks Yet</h3>
                  <p className="text-gray-600">
                    Complete your first task to see it here!
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {completedTasks.map((participant) => (
                  <Card key={participant.id}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-center">
                        <div className="flex-1">
                          <h3 className="font-medium">{participant.task.title}</h3>
                          <p className="text-sm text-gray-600">{participant.task.category}</p>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-green-600">
                            +${calculateNetPayout(participant.task.payout)}
                          </div>
                          <div className="text-xs text-gray-500">
                            {participant.completed_at && 
                              new Date(participant.completed_at).toLocaleDateString()
                            }
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Earnings History */}
          <TabsContent value="earnings" className="space-y-6">
            {transactions.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Earnings Yet</h3>
                  <p className="text-gray-600">
                    Complete tasks to start earning money!
                  </p>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Recent Earnings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {transactions.map((transaction) => (
                      <div key={transaction.id} className="flex justify-between items-center py-3 border-b last:border-0">
                        <div>
                          <p className="font-medium">{transaction.description}</p>
                          <p className="text-sm text-gray-600">
                            {new Date(transaction.processed_at).toLocaleDateString()} •{' '}
                            Fee: ${transaction.fee_amount.toFixed(2)}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-green-600">
                            +${transaction.amount.toFixed(2)}
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {transaction.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}