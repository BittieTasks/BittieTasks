'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '../../components/auth/AuthProvider'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import CleanNavigation from '@/components/CleanNavigation'
import CleanLayout from '@/components/CleanLayout'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useRouter } from 'next/navigation'
import { 
  Coins, 
  TrendingUp, 
  Calendar, 
  Target, 
  Award, 
  Clock, 
  Users, 
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle
} from 'lucide-react'

// Mock data - in a real app, this would come from your API
const mockEarnings = {
  totalEarnings: 847.50,
  thisMonth: 234.75,
  lastMonth: 189.25,
  monthlyGoal: 500.00,
  tasksCompleted: 23,
  averagePerTask: 36.85,
  weeklyGrowth: 12.5
}

const mockTransactions = [
  {
    id: '1',
    taskTitle: 'School Pickup Share',
    amount: 45.00,
    fee: 4.50,
    netAmount: 40.50,
    status: 'completed',
    date: '2025-01-08',
    participants: 3
  },
  {
    id: '2',
    taskTitle: 'Meal Prep Sunday',
    amount: 35.00,
    fee: 3.50,
    netAmount: 31.50,
    status: 'completed',
    date: '2025-01-06',
    participants: 2
  },
  {
    id: '3',
    taskTitle: 'Home Organization Challenge',
    amount: 85.00,
    fee: 8.50,
    netAmount: 76.50,
    status: 'pending',
    date: '2025-01-05',
    participants: 1
  },
  {
    id: '4',
    taskTitle: 'Weekend Farmers Market Run',
    amount: 55.00,
    fee: 5.50,
    netAmount: 49.50,
    status: 'completed',
    date: '2025-01-03',
    participants: 2
  }
]

export default function EarningsPage() {
  const { user, isAuthenticated, isVerified } = useAuth()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [timeRange, setTimeRange] = useState('thisMonth')

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted && !isAuthenticated) {
      router.push('/auth')
    }
  }, [mounted, isAuthenticated, router])

  if (!mounted) {
    return null
  }

  if (!isAuthenticated) {
    return null
  }

  const monthProgress = (mockEarnings.thisMonth / mockEarnings.monthlyGoal) * 100

  return (
    <CleanLayout>
      <CleanNavigation />
      
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2 text-gray-900">
            Earnings Dashboard
          </h1>
          <p className="text-lg text-gray-600">
            Track your income and financial goals
          </p>
        </div>

        {/* Verification Notice */}
        {!isVerified && (
          <Card className="mb-6 border-yellow-200 bg-yellow-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Award className="h-5 w-5 text-yellow-600" />
                <p className="text-yellow-800">
                  <strong>Email verification required</strong> to receive payments and track earnings.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="card-clean hover-lift scale-in">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <Coins className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-small text-muted-foreground">Total Earnings</p>
                  <p className="text-2xl font-bold text-gradient">${mockEarnings.totalEarnings.toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-clean">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-small text-muted-foreground">This Month</p>
                  <p className="text-2xl font-bold">${mockEarnings.thisMonth.toFixed(2)}</p>
                  <div className="flex items-center gap-1">
                    <ArrowUpRight className="h-4 w-4 text-green-600" />
                    <span className="text-small text-green-600">+{mockEarnings.weeklyGrowth}%</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-clean">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <Target className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-small text-muted-foreground">Tasks Completed</p>
                  <p className="text-2xl font-bold">{mockEarnings.tasksCompleted}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-clean">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-small text-muted-foreground">Avg per Task</p>
                  <p className="text-2xl font-bold">${mockEarnings.averagePerTask.toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Monthly Goal Progress */}
        <Card className="card-clean mb-8">
          <CardHeader>
            <CardTitle className="text-subheading">Monthly Goal Progress</CardTitle>
            <CardDescription>Track your progress towards your monthly earning goal</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-body font-medium">Goal: ${mockEarnings.monthlyGoal.toFixed(2)}</span>
                <span className="text-body font-medium">
                  ${mockEarnings.thisMonth.toFixed(2)} ({monthProgress.toFixed(1)}%)
                </span>
              </div>
              
              <div className="w-full bg-muted rounded-full h-3">
                <div 
                  className="bg-primary h-3 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(monthProgress, 100)}%` }}
                />
              </div>
              
              <div className="flex justify-between text-small text-muted-foreground">
                <span>${(mockEarnings.monthlyGoal - mockEarnings.thisMonth).toFixed(2)} to go</span>
                <span>{Math.max(0, Math.ceil((mockEarnings.monthlyGoal - mockEarnings.thisMonth) / mockEarnings.averagePerTask))} more tasks</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Transactions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="card-clean">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-subheading">Recent Transactions</CardTitle>
                <Select value={timeRange} onValueChange={setTimeRange}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="thisWeek">This Week</SelectItem>
                    <SelectItem value="thisMonth">This Month</SelectItem>
                    <SelectItem value="lastMonth">Last Month</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockTransactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${
                        transaction.status === 'completed' ? 'bg-green-500' : 'bg-yellow-500'
                      }`} />
                      <div>
                        <div className="font-medium">{transaction.taskTitle}</div>
                        <div className="text-small text-muted-foreground">
                          {new Date(transaction.date).toLocaleDateString()} • {transaction.participants} participant{transaction.participants !== 1 ? 's' : ''}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-green-600">
                        +${transaction.netAmount.toFixed(2)}
                      </div>
                      <div className="text-small text-muted-foreground">
                        ${transaction.amount.toFixed(2)} - ${transaction.fee.toFixed(2)} fee
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Earnings Breakdown */}
          <Card className="card-clean">
            <CardHeader>
              <CardTitle className="text-subheading">Earnings Breakdown</CardTitle>
              <CardDescription>Understanding your revenue streams</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full" />
                    <span>Solo Tasks</span>
                  </div>
                  <div className="font-medium">$425.50</div>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-blue-500 rounded-full" />
                    <span>Shared Tasks</span>
                  </div>
                  <div className="font-medium">$321.75</div>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-purple-500 rounded-full" />
                    <span>Self-Care Tasks</span>
                  </div>
                  <div className="font-medium">$100.25</div>
                </div>
                
                <div className="pt-4 border-t border-border">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Total Platform Fees</span>
                    <span className="font-medium text-red-600">-$84.75</span>
                  </div>
                  <p className="text-small text-muted-foreground mt-1">
                    10% fee on Free plan • <span className="text-primary cursor-pointer" onClick={() => router.push('/subscribe')}>Upgrade to reduce fees</span>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mt-8">
          <Button 
            onClick={() => router.push('/marketplace')}
            className="button-clean"
          >
            Browse More Tasks
          </Button>
          <Button 
            onClick={() => router.push('/subscribe')}
            variant="outline"
            className="button-outline"
          >
            Upgrade Plan to Reduce Fees
          </Button>
          <Button 
            variant="outline"
            className="button-outline"
          >
            Export Earnings Report
          </Button>
        </div>
      </main>
    </CleanLayout>
  )
}