'use client'

import { useAuth } from '@/components/auth/AuthProvider'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { DollarSign, Plus, TrendingUp, Calendar, Star, ChevronRight, Users, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import PlatformNavigation from '@/components/platform/PlatformNavigation'

export default function PlatformPage() {
  const { user, loading, isAuthenticated } = useAuth()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted && !loading && !isAuthenticated) {
      router.push('/')
    }
  }, [mounted, loading, isAuthenticated, router])

  if (!mounted || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-blue-50 to-purple-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  const quickStats = [
    { label: 'Today\'s Earnings', value: '$0.00', icon: DollarSign, color: 'emerald' },
    { label: 'Active Tasks', value: '0', icon: Calendar, color: 'blue' },
    { label: 'This Month', value: '$0.00', icon: TrendingUp, color: 'purple' },
    { label: 'Rating', value: '5.0', icon: Star, color: 'yellow' },
  ]

  const featuredTasks = [
    {
      id: '1',
      title: 'Playground Meetup at Central Park',
      type: 'Community',
      payout: 35,
      time: '2 hours',
      participants: '3/5',
      location: 'Central Park',
      isSponsored: true,
      sponsorName: 'SafeKids Initiative',
    },
    {
      id: '2',
      title: 'Grocery Shopping Assistant',
      type: 'Solo',
      payout: 25,
      time: '1 hour',
      participants: '1/1',
      location: 'Whole Foods Market',
      isSponsored: false,
    },
    {
      id: '3',
      title: 'School Pickup Carpool',
      type: 'Community',
      payout: 30,
      time: '45 mins',
      participants: '2/4',
      location: 'Lincoln Elementary',
      isSponsored: false,
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-blue-50 to-purple-50">
      <PlatformNavigation />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="bg-gradient-to-r from-emerald-500 to-blue-500 rounded-2xl p-6 text-white">
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">
              Welcome back, {user?.email?.split('@')[0] || 'Parent'}! 👋
            </h1>
            <p className="text-emerald-100 text-lg">
              Ready to turn your daily tasks into income? Start with your first earning opportunity below.
            </p>
          </div>
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
        >
          {quickStats.map((stat, index) => (
            <Card key={stat.label} className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                    <p className="text-xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                  <div className={`w-10 h-10 bg-${stat.color}-100 rounded-lg flex items-center justify-center`}>
                    <stat.icon className={`w-5 h-5 text-${stat.color}-600`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8"
        >
          <Link href="/marketplace">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Browse Tasks</h3>
                    <p className="text-sm text-gray-600">Find earning opportunities</p>
                  </div>
                  <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-emerald-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/create-task">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Create Task</h3>
                    <p className="text-sm text-gray-600">Share your activities</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Plus className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/subscriptions">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Upgrade Plan</h3>
                    <p className="text-sm text-gray-600">Lower fees, more earnings</p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        </motion.div>

        {/* Featured Tasks */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Featured Earning Opportunities</h2>
            <Link href="/marketplace">
              <Button variant="outline" className="border-emerald-300 text-emerald-700 hover:bg-emerald-50">
                View All <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredTasks.map((task, index) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
              >
                <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <Badge className={`mb-2 ${task.isSponsored ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'}`}>
                          {task.isSponsored ? `Sponsored • ${task.sponsorName}` : task.type}
                        </Badge>
                        <CardTitle className="text-lg font-bold text-gray-900 leading-tight">
                          {task.title}
                        </CardTitle>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-emerald-600">
                          ${task.payout}
                        </div>
                        <div className="text-sm text-gray-500">
                          {task.isSponsored && '+25% bonus'}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {task.time}
                      </div>
                      <div className="flex items-center">
                        <Users className="w-4 h-4 mr-1" />
                        {task.participants}
                      </div>
                    </div>
                    <div className="text-sm text-gray-600">
                      📍 {task.location}
                    </div>
                    <Link href={`/task/${task.id}`}>
                      <Button className="w-full bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600 text-white">
                        Apply Now
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Free Plan Notice */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="bg-gradient-to-r from-emerald-500 to-blue-500 text-white border-0">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-xl font-bold mb-2">You're on the Free Plan</h3>
                  <p className="text-emerald-100">
                    Upgrade to Pro or Premium to reduce platform fees and increase your earnings by up to 50%
                  </p>
                </div>
                <Link href="/subscriptions">
                  <Button className="bg-white text-emerald-600 hover:bg-gray-100 font-semibold px-6">
                    Upgrade Now
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  )
}