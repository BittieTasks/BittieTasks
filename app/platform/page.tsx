'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '../../components/auth/AuthProvider'
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
  }, [])

  const loadTasks = async () => {
    try {
      // Mock data for now - will connect to API
      const mockTasks: Task[] = [
        {
          id: '1',
          title: 'School Pickup Carpool',
          description: 'Looking for 2 parents to join a weekly carpool for Lincoln Elementary pickup. Tuesdays and Thursdays, 3:30 PM.',
          payout: 25.00,
          location: 'Lincoln Elementary, Downtown',
          time_commitment: '2 hours/week',
          max_participants: 2,
          current_participants: 0,
          deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          task_type: 'shared',
          is_sponsored: false,
          category: {
            name: 'Transportation',
            color: '#3b82f6',
            icon: 'car'
          },
          creator: {
            first_name: 'Sarah',
            last_name: 'M.'
          }
        },
        {
          id: '2', 
          title: 'Grocery Shopping for Elderly Neighbor',
          description: 'Weekly grocery shopping for my elderly neighbor Mrs. Johnson. She provides the list and payment, just need someone reliable.',
          payout: 35.00,
          location: 'Safeway, Maple Street',
          time_commitment: '1.5 hours/week',
          max_participants: 1,
          current_participants: 0,
          deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
          task_type: 'solo',
          is_sponsored: true,
          sponsor_name: 'CommunityFirst Bank',
          category: {
            name: 'Errands & Shopping',
            color: '#10b981',
            icon: 'shopping-cart'
          },
          creator: {
            first_name: 'Michael',
            last_name: 'K.'
          }
        },
        {
          id: '3',
          title: 'After-School Activity Coordination',
          description: 'Help organize and supervise after-school activities for a group of 6 kids. Fun activities like arts & crafts, outdoor games.',
          payout: 45.00,
          location: 'Community Center',
          time_commitment: '3 hours, twice weekly',
          max_participants: 2,
          current_participants: 1,
          deadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
          task_type: 'shared',
          is_sponsored: false,
          category: {
            name: 'Activity Coordination',
            color: '#8b5cf6',
            icon: 'calendar'
          },
          creator: {
            first_name: 'Jennifer',
            last_name: 'L.'
          }
        }
      ]
      setTasks(mockTasks)
    } catch (error) {
      toast({
        title: 'Error Loading Tasks',
        description: 'Could not load available tasks. Please try again.',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const loadCategories = async () => {
    const mockCategories: Category[] = [
      { id: '1', name: 'Errands & Shopping', description: 'Grocery runs, pharmacy pickups', icon: 'shopping-cart', color: '#10b981' },
      { id: '2', name: 'Transportation', description: 'School pickups, carpooling', icon: 'car', color: '#3b82f6' },
      { id: '3', name: 'Meal Planning & Prep', description: 'Meal planning, batch cooking', icon: 'chef-hat', color: '#f59e0b' },
      { id: '4', name: 'Activity Coordination', description: 'Organizing playdates, events', icon: 'calendar', color: '#8b5cf6' },
      { id: '5', name: 'Self-Care & Wellness', description: 'Walking groups, meditation', icon: 'heart', color: '#ec4899' },
      { id: '6', name: 'Skill Sharing', description: 'Tutoring, lessons, teaching', icon: 'book-open', color: '#06b6d4' },
      { id: '7', name: 'Household Tasks', description: 'Cleaning, organization', icon: 'home', color: '#84cc16' },
      { id: '8', name: 'Pet Care', description: 'Dog walking, pet sitting', icon: 'heart', color: '#f97316' }
    ]
    setCategories(mockCategories)
  }

  const handleApplyToTask = async (taskId: string) => {
    try {
      toast({
        title: 'Application Submitted!',
        description: 'The task creator will review your application and contact you soon.',
      })
    } catch (error) {
      toast({
        title: 'Application Failed',
        description: 'Could not submit your application. Please try again.',
        variant: 'destructive'
      })
    }
  }

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || task.category.name === selectedCategory
    const matchesType = taskType === 'all' || task.task_type === taskType
    return matchesSearch && matchesCategory && matchesType
  })

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