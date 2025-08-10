'use client'

import { useState } from 'react'
import { useAuth } from '../../components/auth/AuthProvider'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Navigation from '@/components/Navigation'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useRouter } from 'next/navigation'
import { 
  DollarSign, 
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

// Mock data - this will be replaced with real API data
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
    amount: 42.30,
    fee: 4.70,
    netAmount: 37.60,
    status: 'completed',
    date: '2025-01-08',
    participants: 3
  },
  {
    id: '2',
    taskTitle: 'Grocery Shopping Partnership',
    amount: 28.00,
    fee: 2.80,
    netAmount: 25.20,
    status: 'completed',
    date: '2025-01-06',
    participants: 2
  },
  {
    id: '3',
    taskTitle: 'After-School Carpool',
    amount: 35.00,
    fee: 3.50,
    netAmount: 31.50,
    status: 'pending',
    date: '2025-01-05',
    participants: 4
  },
  {
    id: '4',
    taskTitle: 'Weekend Farmers Market Run',
    amount: 22.50,
    fee: 2.25,
    netAmount: 20.25,
    status: 'completed',
    date: '2025-01-03',
    participants: 2
  }
]

const mockAchievements = [
  {
    id: '1',
    title: 'First Task Completed',
    description: 'Complete your first task',
    reward: 5.00,
    earned: true,
    earnedDate: '2024-12-15'
  },
  {
    id: '2',
    title: 'Community Builder',
    description: 'Help 10 neighbors with tasks',
    reward: 25.00,
    earned: true,
    earnedDate: '2024-12-28'
  },
  {
    id: '3',
    title: 'Monthly Goal Achiever',
    description: 'Reach your monthly earning goal',
    reward: 50.00,
    earned: false,
    progress: 234.75,
    target: 500.00
  }
]

export default function EarningsPage() {
  const { user, isAuthenticated, isVerified } = useAuth()
  const router = useRouter()
  const [timeFilter, setTimeFilter] = useState('this-month')

  if (!isAuthenticated) {
    router.push('/auth')
    return null
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500/20 text-green-400 border-green-500/20'
      case 'pending': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/20'
      case 'processing': return 'bg-blue-500/20 text-blue-400 border-blue-500/20'
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/20'
    }
  }

  const calculateGoalProgress = () => {
    return (mockEarnings.thisMonth / mockEarnings.monthlyGoal) * 100
  }

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <div className="px-6 pt-8 pb-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">Earnings Dashboard</h1>
                <p className="text-gray-400">Track your income and progress</p>
              </div>
              <Select value={timeFilter} onValueChange={setTimeFilter}>
                <SelectTrigger className="w-48 bg-gray-700 border-gray-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-700 border-gray-600">
                  <SelectItem value="this-month" className="text-white hover:bg-gray-600">This Month</SelectItem>
                  <SelectItem value="last-month" className="text-white hover:bg-gray-600">Last Month</SelectItem>
                  <SelectItem value="this-year" className="text-white hover:bg-gray-600">This Year</SelectItem>
                  <SelectItem value="all-time" className="text-white hover:bg-gray-600">All Time</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Key Metrics */}
            <div className="grid md:grid-cols-4 gap-6">
              <div className="bg-gray-700/30 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-green-500/20 rounded-xl flex items-center justify-center">
                    <DollarSign className="h-5 w-5 text-green-400" />
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Total Earnings</p>
                    <p className="text-2xl font-bold text-white">${mockEarnings.totalEarnings.toFixed(2)}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-700/30 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center">
                    <Calendar className="h-5 w-5 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">This Month</p>
                    <p className="text-2xl font-bold text-white">${mockEarnings.thisMonth.toFixed(2)}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-700/30 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center">
                    <CheckCircle className="h-5 w-5 text-purple-400" />
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Tasks Completed</p>
                    <p className="text-2xl font-bold text-white">{mockEarnings.tasksCompleted}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-700/30 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-yellow-500/20 rounded-xl flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-yellow-400" />
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Avg per Task</p>
                    <p className="text-2xl font-bold text-white">${mockEarnings.averagePerTask.toFixed(2)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 pb-12">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Monthly Goal Progress */}
          <Card className="bg-gray-800/50 backdrop-blur-sm border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Target className="h-5 w-5" />
                Monthly Goal Progress
              </CardTitle>
              <CardDescription className="text-gray-400">
                Track your progress toward your ${mockEarnings.monthlyGoal.toFixed(2)} monthly goal
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Current: ${mockEarnings.thisMonth.toFixed(2)}</span>
                  <span className="text-gray-400">Goal: ${mockEarnings.monthlyGoal.toFixed(2)}</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(calculateGoalProgress(), 100)}%` }}
                  />
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">
                    {calculateGoalProgress().toFixed(1)}% complete
                  </span>
                  <span className="text-sm text-gray-300">
                    ${(mockEarnings.monthlyGoal - mockEarnings.thisMonth).toFixed(2)} remaining
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Recent Transactions */}
            <Card className="bg-gray-800/50 backdrop-blur-sm border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Recent Transactions</CardTitle>
                <CardDescription className="text-gray-400">
                  Your latest earning activities
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {mockTransactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                    <div className="flex-1">
                      <h4 className="text-white font-semibold text-sm">{transaction.taskTitle}</h4>
                      <div className="flex items-center gap-4 text-xs text-gray-400 mt-1">
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {transaction.participants} participants
                        </span>
                        <span>{new Date(transaction.date).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-green-400 font-semibold">${transaction.netAmount.toFixed(2)}</span>
                        <Badge className={getStatusColor(transaction.status)}>
                          {transaction.status}
                        </Badge>
                      </div>
                      <div className="text-xs text-gray-400">
                        Fee: ${transaction.fee.toFixed(2)}
                      </div>
                    </div>
                  </div>
                ))}
                
                <Button 
                  variant="outline" 
                  className="w-full mt-4 border-gray-600 bg-gray-700 text-gray-300 hover:bg-gray-600"
                  onClick={() => router.push('/transactions')}
                >
                  View All Transactions
                </Button>
              </CardContent>
            </Card>

            {/* Achievements */}
            <Card className="bg-gray-800/50 backdrop-blur-sm border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Achievements
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Unlock rewards by reaching milestones
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {mockAchievements.map((achievement) => (
                  <div key={achievement.id} className="flex items-center gap-3 p-3 bg-gray-700/30 rounded-lg">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      achievement.earned 
                        ? 'bg-green-500/20 text-green-400' 
                        : 'bg-gray-600/20 text-gray-400'
                    }`}>
                      {achievement.earned ? (
                        <CheckCircle className="w-5 h-5" />
                      ) : (
                        <Clock className="w-5 h-5" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="text-white font-semibold text-sm">{achievement.title}</h4>
                      <p className="text-gray-400 text-xs">{achievement.description}</p>
                      {!achievement.earned && achievement.progress && achievement.target && (
                        <div className="mt-2">
                          <div className="flex justify-between text-xs text-gray-400 mb-1">
                            <span>${achievement.progress.toFixed(2)}</span>
                            <span>${achievement.target.toFixed(2)}</span>
                          </div>
                          <div className="w-full bg-gray-600 rounded-full h-1">
                            <div 
                              className="bg-blue-500 h-1 rounded-full"
                              style={{ width: `${(achievement.progress / achievement.target) * 100}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <span className="text-green-400 font-semibold text-sm">
                        +${achievement.reward.toFixed(2)}
                      </span>
                      {achievement.earned && achievement.earnedDate && (
                        <div className="text-xs text-gray-400">
                          {new Date(achievement.earnedDate).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Growth Insights */}
          <Card className="bg-gray-800/50 backdrop-blur-sm border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Growth Insights</CardTitle>
              <CardDescription className="text-gray-400">
                Understanding your earning patterns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-gray-700/30 rounded-lg">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <ArrowUpRight className="w-5 h-5 text-green-400" />
                    <span className="text-green-400 font-semibold">+{mockEarnings.weeklyGrowth}%</span>
                  </div>
                  <p className="text-gray-400 text-sm">Weekly Growth</p>
                  <p className="text-white text-lg font-semibold">${(mockEarnings.thisMonth * 0.25).toFixed(2)}</p>
                  <p className="text-gray-400 text-xs">This week vs last week</p>
                </div>

                <div className="text-center p-4 bg-gray-700/30 rounded-lg">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Users className="w-5 h-5 text-blue-400" />
                    <span className="text-white font-semibold">2.8</span>
                  </div>
                  <p className="text-gray-400 text-sm">Avg Participants</p>
                  <p className="text-white text-lg font-semibold">Per Task</p>
                  <p className="text-gray-400 text-xs">Community engagement</p>
                </div>

                <div className="text-center p-4 bg-gray-700/30 rounded-lg">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Clock className="w-5 h-5 text-purple-400" />
                    <span className="text-white font-semibold">3.2</span>
                  </div>
                  <p className="text-gray-400 text-sm">Tasks per Week</p>
                  <p className="text-white text-lg font-semibold">Average</p>
                  <p className="text-gray-400 text-xs">Current pace</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Items */}
          <Card className="bg-gray-800/50 backdrop-blur-sm border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Boost Your Earnings</CardTitle>
              <CardDescription className="text-gray-400">
                Recommended actions to increase your income
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <Button 
                  className="h-16 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 border-blue-500/20"
                  onClick={() => router.push('/create-task')}
                >
                  <div className="text-center">
                    <div className="text-xl mb-1">➕</div>
                    <div>Create More Tasks</div>
                    <div className="text-xs text-gray-400">Avg +$35 per task</div>
                  </div>
                </Button>
                
                <Button 
                  className="h-16 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 border-purple-500/20"
                  onClick={() => router.push('/subscriptions')}
                >
                  <div className="text-center">
                    <div className="text-xl mb-1">👑</div>
                    <div>Upgrade Plan</div>
                    <div className="text-xs text-gray-400">Save 30% on fees</div>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
    </>
  )
}