'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '../../components/auth/AuthProvider'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Navigation from '@/components/Navigation'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useRouter } from 'next/navigation'
import { Search, MapPin, Clock, Users, DollarSign, Filter, Star, Briefcase, Award, Target } from 'lucide-react'
import { allTasks, getTasksByType, getAvailableTasks, calculatePlatformFee, getNetEarnings, type TaskData } from '../../lib/taskData'

// Get comprehensive categories from real task data
const categories = ['All', 'Home Organization', 'Education', 'Meal Planning', 'Health & Fitness', 'Transportation', 'Event Planning', 'Safety & Preparedness', 'Child Development', 'Digital Organization', 'Financial Education', 'Family Traditions', 'Nutrition', 'Skill Exchange', 'Community Support', 'Physical Wellness', 'Mental Wellness', 'Personal Development']

export default function MarketplacePage() {
  const { user, isAuthenticated, isVerified } = useAuth()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [selectedType, setSelectedType] = useState('all')
  const [sortBy, setSortBy] = useState('payout')

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  if (!isAuthenticated) {
    router.push('/auth')
    return null
  }

  // Filter and sort real tasks
  const filteredTasks = allTasks
    .filter(task => 
      selectedCategory === 'All' || task.category === selectedCategory
    )
    .filter(task =>
      selectedType === 'all' || task.type === selectedType
    )
    .filter(task =>
      searchTerm === '' || 
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.category.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'payout') return b.payout - a.payout
      if (sortBy === 'deadline') {
        if (!a.deadline && !b.deadline) return 0
        if (!a.deadline) return 1
        if (!b.deadline) return -1
        return new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
      }
      if (sortBy === 'participants') return (a.max_participants - a.current_participants) - (b.max_participants - b.current_participants)
      return 0
    })
    .slice(0, 24) // Show first 24 tasks for performance

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'solo': return 'bg-blue-500/20 text-blue-400 border-blue-500/20'
      case 'shared': return 'bg-green-500/20 text-green-400 border-green-500/20'
      case 'self_care': return 'bg-purple-500/20 text-purple-400 border-purple-500/20'
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/20'
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-500/20 text-green-400'
      case 'medium': return 'bg-yellow-500/20 text-yellow-400'
      case 'hard': return 'bg-red-500/20 text-red-400'
      default: return 'bg-gray-500/20 text-gray-400'
    }
  }

  // Mock user subscription tier for platform fee calculation
  const userSubscriptionTier = 'free' // This would come from actual user data

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-green-100">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-4">
            Task Marketplace
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover over 110 real earning opportunities. Transform daily tasks into income while building community connections.
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-white/70 backdrop-blur-sm border-green-200">
            <CardContent className="p-4 text-center">
              <Target className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-green-600">{allTasks.length}</div>
              <div className="text-sm text-gray-600">Total Opportunities</div>
            </CardContent>
          </Card>
          <Card className="bg-white/70 backdrop-blur-sm border-blue-200">
            <CardContent className="p-4 text-center">
              <DollarSign className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-blue-600">
                ${Math.round(allTasks.reduce((sum, task) => sum + task.payout, 0))}
              </div>
              <div className="text-sm text-gray-600">Total Earning Potential</div>
            </CardContent>
          </Card>
          <Card className="bg-white/70 backdrop-blur-sm border-green-200">
            <CardContent className="p-4 text-center">
              <Users className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-green-600">
                {allTasks.filter(task => task.current_participants < task.max_participants).length}
              </div>
              <div className="text-sm text-gray-600">Available Now</div>
            </CardContent>
          </Card>
          <Card className="bg-white/70 backdrop-blur-sm border-blue-200">
            <CardContent className="p-4 text-center">
              <Award className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-blue-600">
                {allTasks.filter(task => task.is_sponsored).length}
              </div>
              <div className="text-sm text-gray-600">Sponsored Tasks</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="bg-white/70 backdrop-blur-sm border-green-200 mb-8">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search tasks..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-green-200 focus:border-green-400"
                />
              </div>
              
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="border-green-200 focus:border-green-400">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="border-green-200 focus:border-green-400">
                  <SelectValue placeholder="Task Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="solo">Solo Tasks</SelectItem>
                  <SelectItem value="shared">Community Tasks</SelectItem>
                  <SelectItem value="self_care">Self-Care Tasks</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="border-green-200 focus:border-green-400">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="payout">Highest Payout</SelectItem>
                  <SelectItem value="deadline">Deadline</SelectItem>
                  <SelectItem value="participants">Available Spots</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Task Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTasks.map((task) => {
            const platformFee = calculatePlatformFee(task.payout, userSubscriptionTier)
            const netEarnings = getNetEarnings(task.payout, userSubscriptionTier)
            
            return (
              <Card 
                key={task.id} 
                className="bg-white/80 backdrop-blur-sm border-green-200 hover:border-green-300 transition-all duration-200 hover:shadow-lg group"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between mb-2">
                    <Badge className={getTypeColor(task.type)} variant="outline">
                      {task.type === 'solo' ? 'Solo' : task.type === 'shared' ? 'Community' : 'Self-Care'}
                    </Badge>
                    {task.is_sponsored && (
                      <Badge className="bg-yellow-500/20 text-yellow-600 border-yellow-500/20" variant="outline">
                        <Star className="w-3 h-3 mr-1" />
                        Sponsored
                      </Badge>
                    )}
                  </div>
                  
                  <CardTitle className="text-lg text-gray-800 group-hover:text-green-700 transition-colors">
                    {task.title}
                  </CardTitle>
                  
                  <CardDescription className="text-sm text-gray-600 line-clamp-2">
                    {task.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="pt-0">
                  <div className="space-y-3">
                    {/* Earnings */}
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex items-center space-x-2">
                        <DollarSign className="w-4 h-4 text-green-600" />
                        <span className="font-semibold text-green-700">${netEarnings.toFixed(2)}</span>
                        <span className="text-xs text-gray-500">net</span>
                      </div>
                      <div className="text-xs text-gray-500">
                        ${task.payout} - ${platformFee.toFixed(2)} fee
                      </div>
                    </div>

                    {/* Task Details */}
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600">{task.time_estimate}</span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Users className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600">
                          {task.current_participants}/{task.max_participants}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600 capitalize">{task.location_type}</span>
                      </div>
                      
                      <Badge className={getDifficultyColor(task.difficulty)} variant="outline">
                        {task.difficulty}
                      </Badge>
                    </div>

                    {/* Category and Sponsor */}
                    <div className="flex items-center justify-between">
                      <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                        {task.category}
                      </span>
                      {task.sponsor_name && (
                        <span className="text-xs text-yellow-600 font-medium">
                          by {task.sponsor_name}
                        </span>
                      )}
                    </div>

                    {/* Action Button */}
                    <Button 
                      className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white"
                      disabled={task.current_participants >= task.max_participants}
                    >
                      {task.current_participants >= task.max_participants ? 'Full' : 'Join Task'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {filteredTasks.length === 0 && (
          <Card className="bg-white/70 backdrop-blur-sm border-green-200 text-center py-12">
            <CardContent>
              <Filter className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">No tasks found</h3>
              <p className="text-gray-500">Try adjusting your filters to see more opportunities.</p>
            </CardContent>
          </Card>
        )}

        {/* Load More */}
        {filteredTasks.length === 24 && (
          <div className="text-center mt-8">
            <Button 
              variant="outline" 
              className="border-green-300 text-green-700 hover:bg-green-50"
            >
              Load More Tasks
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}