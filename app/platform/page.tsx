'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '../../components/auth/AuthProvider'
import { supabase } from '../../lib/supabase'
import CleanLayout from '../../components/CleanLayout'
import { Button } from '../../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Badge } from '../../components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs'
import { useToast } from '../../hooks/use-toast'
import { Coins, MapPin, Clock, Users, Plus, Filter, Search } from 'lucide-react'
import { Input } from '../../components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select'
import { Link } from 'wouter'

interface Task {
  id: string
  title: string
  description: string
  payout: number
  location: string
  time_commitment: string
  max_participants: number
  current_participants: number
  deadline: string
  task_type: 'shared' | 'solo' | 'sponsored'
  is_sponsored: boolean
  sponsor_name?: string
  category: {
    name: string
    color: string
    icon: string
  }
  creator: {
    first_name: string
    last_name: string
  }
}

interface Category {
  id: string
  name: string
  description: string
  icon: string
  color: string
}

export default function Platform() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [tasks, setTasks] = useState<Task[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [taskType, setTaskType] = useState('all')

  useEffect(() => {
    loadTasks()
    loadCategories()
  }, [selectedCategory, taskType, searchTerm])

  const loadTasks = async () => {
    try {
      const params = new URLSearchParams()
      if (selectedCategory !== 'all') params.append('category', selectedCategory)
      if (taskType !== 'all') params.append('taskType', taskType)  
      if (searchTerm) params.append('search', searchTerm)

      const response = await fetch(`/api/tasks?${params}`)
      if (!response.ok) throw new Error('Failed to fetch tasks')
      
      const { tasks: fetchedTasks } = await response.json()
      
      // Transform data to match our interface
      const transformedTasks: Task[] = fetchedTasks.map((task: any) => {
        // Map category ID to category details
        const categoryMap: { [key: number]: any } = {
          1: { name: 'School & Education', color: 'bg-blue-100 text-blue-700', icon: 'GraduationCap' },
          2: { name: 'Meal Planning', color: 'bg-green-100 text-green-700', icon: 'ChefHat' },
          3: { name: 'Shopping & Errands', color: 'bg-purple-100 text-purple-700', icon: 'ShoppingBag' },
          4: { name: 'Transportation', color: 'bg-orange-100 text-orange-700', icon: 'Car' },
          5: { name: 'Childcare Support', color: 'bg-pink-100 text-pink-700', icon: 'Heart' },
          6: { name: 'Home & Garden', color: 'bg-emerald-100 text-emerald-700', icon: 'Home' },
          7: { name: 'Health & Wellness', color: 'bg-teal-100 text-teal-700', icon: 'Activity' },
          8: { name: 'Social Events', color: 'bg-indigo-100 text-indigo-700', icon: 'Users' }
        }
        
        const categoryInfo = categoryMap[task.category_id] || categoryMap[1]
        
        return {
          id: task.id,
          title: task.title,
          description: task.description,
          payout: parseFloat(task.payout),
          location: task.location,
          time_commitment: task.time_commitment || 'Not specified',
          max_participants: task.max_participants,
          current_participants: task.current_participants,
          deadline: task.deadline,
          task_type: task.task_type,
          is_sponsored: task.is_sponsored,
          sponsor_name: task.sponsor_name,
          category: {
            name: categoryInfo.name,
            color: categoryInfo.color,
            icon: categoryInfo.icon
          },
          creator: {
            first_name: 'Sarah',
            last_name: 'M.'
          }
        }
      })
      
      setTasks(transformedTasks)
    } catch (error) {
      toast({
        title: 'Error Loading Tasks',
        description: 'Could not load available tasks. Please try again.',
        variant: 'destructive'
      })
      console.error('Error loading tasks:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadCategories = async () => {
    try {
      const response = await fetch('/api/categories')
      if (!response.ok) throw new Error('Failed to fetch categories')
      
      const { categories } = await response.json()
      setCategories(categories)
    } catch (error) {
      console.error('Error loading categories:', error)
      // Fallback to empty array - categories not critical for functionality
      setCategories([])
    }
  }

  const handleApplyToTask = async (taskId: string) => {
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'Please sign in to apply to tasks.',
        variant: 'destructive'
      })
      return
    }

    try {
      // Get session for API authentication
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        throw new Error('Please sign in again to apply to tasks')
      }

      const response = await fetch(`/api/tasks/${taskId}/apply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ message: 'I would like to join this task!' })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Application failed')
      }

      toast({
        title: 'Application Submitted!',
        description: 'The task creator will review your application and contact you soon.',
      })

      // Reload tasks to update participant count
      loadTasks()
    } catch (error: any) {
      toast({
        title: 'Application Failed',
        description: error.message || 'Could not submit your application. Please try again.',
        variant: 'destructive'
      })
    }
  }

  // Remove client-side filtering since we're now filtering on the server
  const filteredTasks = tasks

  if (loading) {
    return (
      <CleanLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading marketplace...</p>
          </div>
        </div>
      </CleanLayout>
    )
  }

  return (
    <CleanLayout>
      <div className="min-h-screen bg-gray-50 pb-20">
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                  Task Marketplace
                </h1>
                <p className="text-gray-600 mt-1">
                  Find opportunities to earn while helping your community
                </p>
              </div>
              <Button asChild className="bg-teal-600 hover:bg-teal-700 text-white">
                <Link to="/platform/create">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Task
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search tasks..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category.id} value={category.name}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={taskType} onValueChange={setTaskType}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="shared">Shared</SelectItem>
                <SelectItem value="solo">Solo</SelectItem>
                <SelectItem value="sponsored">Sponsored</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Task Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTasks.map((task) => (
              <Card key={task.id} className="bg-white shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg font-semibold text-gray-900 mb-2">
                        {task.title}
                      </CardTitle>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge 
                          variant="secondary" 
                          className="text-xs"
                          style={{ backgroundColor: `${task.category.color}20`, color: task.category.color }}
                        >
                          {task.category.name}
                        </Badge>
                        {task.is_sponsored && (
                          <Badge variant="secondary" className="text-xs bg-yellow-100 text-yellow-800">
                            Sponsored
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center text-teal-600 font-bold text-lg">
                        <Coins className="w-4 h-4 mr-1" />
                        ${task.payout.toFixed(2)}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {task.description}
                  </p>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-500">
                      <MapPin className="w-4 h-4 mr-2" />
                      {task.location}
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <Clock className="w-4 h-4 mr-2" />
                      {task.time_commitment}
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <Users className="w-4 h-4 mr-2" />
                      {task.current_participants}/{task.max_participants} joined
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-500">
                      by {task.creator.first_name} {task.creator.last_name}
                    </div>
                    <Button 
                      size="sm"
                      onClick={() => handleApplyToTask(task.id)}
                      className="bg-teal-600 hover:bg-teal-700 text-white"
                      disabled={task.current_participants >= task.max_participants}
                    >
                      {task.current_participants >= task.max_participants ? 'Full' : 'Apply'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredTasks.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <Search className="w-12 h-12 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks found</h3>
              <p className="text-gray-500">
                Try adjusting your filters or check back later for new opportunities.
              </p>
            </div>
          )}
        </div>
      </div>
    </CleanLayout>
  )
}