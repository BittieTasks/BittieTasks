'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Search, Filter, MapPin, Clock, Users, DollarSign, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import PlatformNavigation from '@/components/platform/PlatformNavigation'
import Link from 'next/link'

export default function MarketplacePage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedFilter, setSelectedFilter] = useState('all')
  const [mounted, setMounted] = useState(false)

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

  const allTasks = [
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
      description: 'Join us for a fun playground meetup! Great for kids ages 3-8. Bring snacks to share and enjoy quality time with other families.',
      requirements: ['Must supervise children', 'Bring snacks to share'],
      status: 'active',
      rating: 4.9,
      distance: '0.8 miles'
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
      description: 'Help with grocery shopping for a busy family. Perfect for someone who enjoys shopping and wants to help neighbors.',
      requirements: ['Own transportation', 'Available weekday mornings'],
      status: 'active',
      rating: 4.7,
      distance: '1.2 miles'
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
      description: 'Coordinate after-school pickup for multiple families. Great way to help working parents and build community.',
      requirements: ['Valid driver license', 'Child-safe vehicle'],
      status: 'active',
      rating: 4.8,
      distance: '2.1 miles'
    },
    {
      id: '4',
      title: 'Weekend Soccer Practice Drive',
      type: 'Community',
      payout: 40,
      time: '3 hours',
      participants: '1/3',
      location: 'Riverside Sports Complex',
      isSponsored: true,
      sponsorName: 'HealthTech Solutions',
      description: 'Drive kids to weekend soccer practice and stay to supervise. Great for sports-loving parents!',
      requirements: ['Sports experience preferred', 'Weekend availability'],
      status: 'active',
      rating: 4.9,
      distance: '3.5 miles'
    },
    {
      id: '5',
      title: 'Library Story Time Helper',
      type: 'Solo',
      payout: 20,
      time: '1.5 hours',
      participants: '1/1',
      location: 'Downtown Public Library',
      isSponsored: false,
      description: 'Assist with children\'s story time at the local library. Perfect for those who love reading with kids.',
      requirements: ['Good with children', 'Tuesday mornings'],
      status: 'active',
      rating: 4.6,
      distance: '1.8 miles'
    },
    {
      id: '6',
      title: 'Art Class Setup Assistant',
      type: 'Solo',
      payout: 28,
      time: '2 hours',
      participants: '1/1',
      location: 'Community Center',
      isSponsored: true,
      sponsorName: 'EcoFriendly Living',
      description: 'Help set up and clean up after children\'s art classes. Great for creative types!',
      requirements: ['Art experience helpful', 'Thursday afternoons'],
      status: 'active',
      rating: 4.5,
      distance: '2.8 miles'
    }
  ]

  const filters = [
    { id: 'all', name: 'All Tasks', count: allTasks.length },
    { id: 'community', name: 'Community', count: allTasks.filter(t => t.type === 'Community').length },
    { id: 'solo', name: 'Solo', count: allTasks.filter(t => t.type === 'Solo').length },
    { id: 'sponsored', name: 'Sponsored', count: allTasks.filter(t => t.isSponsored).length },
  ]

  const filteredTasks = allTasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.location.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesFilter = selectedFilter === 'all' ||
                         (selectedFilter === 'community' && task.type === 'Community') ||
                         (selectedFilter === 'solo' && task.type === 'Solo') ||
                         (selectedFilter === 'sponsored' && task.isSponsored)
    
    return matchesSearch && matchesFilter
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-blue-50 to-purple-50">
      <PlatformNavigation />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 lg:pb-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Task Marketplace
          </h1>
          <p className="text-xl text-gray-600">
            Discover earning opportunities in your neighborhood. Join tasks or create your own.
          </p>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8 space-y-4"
        >
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search tasks by title, location, or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white/80 backdrop-blur-sm border-0 shadow-lg h-12"
            />
          </div>

          {/* Filter Tabs */}
          <div className="flex flex-wrap gap-2">
            {filters.map((filter) => (
              <Button
                key={filter.id}
                variant={selectedFilter === filter.id ? "default" : "outline"}
                onClick={() => setSelectedFilter(filter.id)}
                className={`${
                  selectedFilter === filter.id
                    ? 'bg-gradient-to-r from-emerald-500 to-blue-500 text-white'
                    : 'bg-white/80 backdrop-blur-sm border-emerald-300 text-gray-700 hover:bg-emerald-50'
                }`}
              >
                <Filter className="w-4 h-4 mr-2" />
                {filter.name} ({filter.count})
              </Button>
            ))}
          </div>
        </motion.div>

        {/* Results Count */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <p className="text-gray-600">
            Showing {filteredTasks.length} {filteredTasks.length === 1 ? 'task' : 'tasks'}
            {searchTerm && ` for "${searchTerm}"`}
          </p>
        </motion.div>

        {/* Task Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredTasks.map((task, index) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
            >
              <Card className="h-full bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <Badge className={`mb-2 ${task.isSponsored ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'}`}>
                        {task.isSponsored ? `Sponsored • ${task.sponsorName}` : task.type}
                      </Badge>
                      {task.isSponsored && (
                        <Badge className="ml-2 bg-green-100 text-green-800">
                          +25% Bonus
                        </Badge>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-emerald-600">
                        ${task.payout}
                      </div>
                    </div>
                  </div>
                  <CardTitle className="text-lg font-bold text-gray-900 leading-tight mb-2">
                    {task.title}
                  </CardTitle>
                  <CardDescription className="text-gray-600 text-sm">
                    {task.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Task Details */}
                  <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-2" />
                      {task.time}
                    </div>
                    <div className="flex items-center">
                      <Users className="w-4 h-4 mr-2" />
                      {task.participants}
                    </div>
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-2" />
                      {task.distance}
                    </div>
                    <div className="flex items-center">
                      <Star className="w-4 h-4 mr-2 text-yellow-500" />
                      {task.rating}
                    </div>
                  </div>

                  {/* Location */}
                  <div className="text-sm text-gray-600">
                    📍 {task.location}
                  </div>

                  {/* Requirements */}
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-700">Requirements:</p>
                    <ul className="text-xs text-gray-600 space-y-1">
                      {task.requirements.map((req, idx) => (
                        <li key={idx} className="flex items-start">
                          <span className="w-1 h-1 bg-gray-400 rounded-full mt-2 mr-2 flex-shrink-0" />
                          {req}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Apply Button */}
                  <Link href={`/task/${task.id}`}>
                    <Button className="w-full bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600 text-white">
                      Apply Now
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Empty State */}
        {filteredTasks.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-center py-12"
          >
            <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No tasks found</h3>
            <p className="text-gray-600 mb-6">
              Try adjusting your search terms or filters to find more opportunities.
            </p>
            <Link href="/create-task">
              <Button className="bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600 text-white">
                Create Your Own Task
              </Button>
            </Link>
          </motion.div>
        )}
      </main>
    </div>
  )
}