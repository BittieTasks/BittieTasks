'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { DollarSign, TrendingUp, Clock, Award, Plus, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import PlatformNavigation from '@/components/platform/PlatformNavigation'
import Link from 'next/link'
import { useAuth } from '@/components/auth/AuthProvider'

export default function PlatformPage() {
  const [mounted, setMounted] = useState(false)
  const { user } = useAuth()

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-blue-50 to-purple-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full" />
      </div>
    )
  }

  const earnings = {
    today: 45,
    thisWeek: 180,
    thisMonth: 725,
    allTime: 2340
  }

  const recentTasks = [
    {
      id: 1,
      title: 'Playground Meetup at Central Park',
      payout: 35,
      status: 'completed',
      completedAt: '2 hours ago'
    },
    {
      id: 2,
      title: 'Grocery Shopping Assistant',
      payout: 25,
      status: 'in-progress',
      startedAt: '30 mins ago'
    },
    {
      id: 3,
      title: 'School Pickup Carpool',
      payout: 30,
      status: 'pending',
      scheduledFor: 'Tomorrow 3:00 PM'
    }
  ]

  const achievements = [
    { id: 1, title: 'First Task Completed', icon: '🎉', earned: true },
    { id: 2, title: 'Community Helper', icon: '🤝', earned: true },
    { id: 3, title: 'Weekly Goal Achieved', icon: '⭐', earned: true },
    { id: 4, title: 'Top Earner', icon: '👑', earned: false },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-blue-50 to-purple-50">
      <PlatformNavigation />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 lg:pb-8">
        {/* Welcome Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.user_metadata?.first_name || 'Demo User'}! 👋
          </h1>
          <p className="text-xl text-gray-600">
            Ready to earn more today? Here's your dashboard overview.
          </p>
        </motion.div>

        {/* Earnings Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
        >
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader className="pb-2">
              <CardDescription>Today</CardDescription>
              <CardTitle className="text-2xl font-bold text-emerald-600">
                ${earnings.today}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center text-sm text-green-600">
                <TrendingUp className="w-4 h-4 mr-1" />
                +12% from yesterday
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader className="pb-2">
              <CardDescription>This Week</CardDescription>
              <CardTitle className="text-2xl font-bold text-blue-600">
                ${earnings.thisWeek}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center text-sm text-green-600">
                <TrendingUp className="w-4 h-4 mr-1" />
                +8% from last week
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader className="pb-2">
              <CardDescription>This Month</CardDescription>
              <CardTitle className="text-2xl font-bold text-purple-600">
                ${earnings.thisMonth}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center text-sm text-green-600">
                <TrendingUp className="w-4 h-4 mr-1" />
                +15% from last month
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader className="pb-2">
              <CardDescription>All Time</CardDescription>
              <CardTitle className="text-2xl font-bold text-gray-900">
                ${earnings.allTime}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center text-sm text-gray-600">
                <Award className="w-4 h-4 mr-1" />
                Level 3 Earner
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Recent Tasks */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2"
          >
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Recent Tasks</CardTitle>
                  <CardDescription>Your latest task activity</CardDescription>
                </div>
                <Link href="/marketplace">
                  <Button className="bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600 text-white">
                    <Plus className="w-4 h-4 mr-2" />
                    Browse Tasks
                  </Button>
                </Link>
              </CardHeader>
              <CardContent className="space-y-4">
                {recentTasks.map((task) => (
                  <div key={task.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">{task.title}</h4>
                      <p className="text-sm text-gray-600">
                        {task.status === 'completed' && `Completed ${task.completedAt}`}
                        {task.status === 'in-progress' && `Started ${task.startedAt}`}
                        {task.status === 'pending' && `Scheduled for ${task.scheduledFor}`}
                      </p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Badge className={`${
                        task.status === 'completed' ? 'bg-green-100 text-green-800' :
                        task.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {task.status.replace('-', ' ')}
                      </Badge>
                      <div className="text-lg font-bold text-emerald-600">
                        ${task.payout}
                      </div>
                    </div>
                  </div>
                ))}
                
                <Link href="/marketplace">
                  <Button variant="outline" className="w-full mt-4">
                    View All Tasks
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </motion.div>

          {/* Quick Actions & Achievements */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-6"
          >
            {/* Quick Actions */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common tasks to get you started</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href="/marketplace">
                  <Button className="w-full justify-start bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600 text-white">
                    <DollarSign className="w-4 h-4 mr-2" />
                    Browse Marketplace
                  </Button>
                </Link>
                <Link href="/create-task">
                  <Button variant="outline" className="w-full justify-start">
                    <Plus className="w-4 h-4 mr-2" />
                    Create New Task
                  </Button>
                </Link>
                <Link href="/earnings">
                  <Button variant="outline" className="w-full justify-start">
                    <TrendingUp className="w-4 h-4 mr-2" />
                    View Earnings
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Achievements */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Achievements</CardTitle>
                <CardDescription>Your recent accomplishments</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {achievements.map((achievement) => (
                  <div key={achievement.id} className={`flex items-center p-3 rounded-lg ${
                    achievement.earned ? 'bg-emerald-50 border border-emerald-200' : 'bg-gray-50'
                  }`}>
                    <div className="text-2xl mr-3">
                      {achievement.icon}
                    </div>
                    <div className="flex-1">
                      <h4 className={`font-medium ${
                        achievement.earned ? 'text-emerald-900' : 'text-gray-600'
                      }`}>
                        {achievement.title}
                      </h4>
                    </div>
                    {achievement.earned && (
                      <Badge className="bg-emerald-100 text-emerald-800">
                        Earned
                      </Badge>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>
    </div>
  )
}