'use client'

import { useState, useEffect } from 'react'
import { Search, Filter, Coins, Clock, MapPin, Star, Users, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/components/auth/AuthProvider'
import { useRouter } from 'next/navigation'
import { everydayTasks as soloTasks } from '@/lib/everydayTasks'

interface SoloTask {
  id: string
  title: string
  description: string
  category: string
  payout: number
  difficulty: 'easy' | 'medium' | 'hard'
  time_estimate: string
  location_type: 'home' | 'local' | 'online'
  is_sponsored: boolean
  sponsor_name: string | null
  materials_needed?: string[]
  age_group?: string
}

export default function SoloTasksPage() {
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()
  const [tasks, setTasks] = useState<SoloTask[]>([])
  const [filteredTasks, setFilteredTasks] = useState<SoloTask[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedDifficulty, setSelectedDifficulty] = useState('all')
  const [loading, setLoading] = useState(true)

  // Get unique categories from tasks
  const categories = Array.from(new Set(soloTasks.map(task => task.category)))

  useEffect(() => {
    // Load solo tasks from data file
    setTasks(soloTasks)
    setFilteredTasks(soloTasks)
    setLoading(false)
  }, [])

  useEffect(() => {
    // Filter tasks based on search and filters
    let filtered = tasks

    if (searchTerm) {
      filtered = filtered.filter(task => 
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.category.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(task => task.category === selectedCategory)
    }

    if (selectedDifficulty !== 'all') {
      filtered = filtered.filter(task => task.difficulty === selectedDifficulty)
    }

    setFilteredTasks(filtered)
  }, [searchTerm, selectedCategory, selectedDifficulty, tasks])

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800 border-green-200'
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'hard': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getLocationIcon = (type: string) => {
    switch (type) {
      case 'home': return '🏠'
      case 'local': return '📍'
      case 'online': return '💻'
      default: return '📍'
    }
  }

  const handleTaskClick = (taskId: string) => {
    if (!isAuthenticated) {
      router.push('/auth?redirect=/solo-tasks')
      return
    }
    router.push(`/task/${taskId}`)
  }

  const calculateNetPayout = (grossPayout: number) => {
    const fee = grossPayout * 0.03 // 3% platform fee for solo tasks
    return grossPayout - fee
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Solo Tasks</h1>
            <p className="text-lg text-gray-600 mb-6">
              Individual earning opportunities you can complete on your own schedule
            </p>
            
            {/* Key Stats */}
            <div className="flex justify-center gap-8 text-sm">
              <div className="flex items-center gap-2">
                <Coins className="h-4 w-4 text-green-600" />
                <span className="text-gray-600">3% Platform Fee</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-blue-600" />
                <span className="text-gray-600">{tasks.length} Active Tasks</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-yellow-500" />
                <span className="text-gray-600">Average $22/hour</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search tasks..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>

            {/* Difficulty Filter */}
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Levels</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
        </div>

        {/* Task Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTasks.map((task) => (
            <Card 
              key={task.id} 
              className="hover:shadow-lg transition-shadow cursor-pointer group"
              onClick={() => handleTaskClick(task.id)}
            >
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start mb-2">
                  <Badge variant="outline" className={getDifficultyColor(task.difficulty)}>
                    {task.difficulty}
                  </Badge>
                  {task.is_sponsored && (
                    <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                      Sponsored
                    </Badge>
                  )}
                </div>
                <CardTitle className="text-lg group-hover:text-blue-600 transition-colors">
                  {task.title}
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-4">
                <p className="text-gray-600 text-sm line-clamp-3">
                  {task.description}
                </p>

                {/* Task Details */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-lg">{getLocationIcon(task.location_type)}</span>
                    <span className="text-gray-600 capitalize">{task.location_type}</span>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">{task.time_estimate}</span>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                      {task.category}
                    </span>
                  </div>
                </div>

                {/* Payout */}
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-2xl font-bold text-green-600">
                        ${calculateNetPayout(task.payout).toFixed(0)}
                      </div>
                      <div className="text-xs text-gray-500">
                        ${task.payout} gross - 3% fee
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredTasks.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Search className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks found</h3>
            <p className="text-gray-600">Try adjusting your search or filters</p>
          </div>
        )}
      </div>
    </div>
  )
}