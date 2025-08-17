'use client'

import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/components/auth/AuthProvider'
import { useToast } from '@/hooks/use-toast'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Plus, Users, MessageCircle, MapPin, Coins, Clock, 
  TrendingUp, Star, Shield, CheckCircle, Filter, Search
} from 'lucide-react'
import TaskMessaging from '@/components/messaging/TaskMessaging'
import { TaskApplicationButton } from '@/components/TaskApplicationButton'
import { TaskSubmissionButton } from '@/components/TaskSubmissionButton'

interface CommunityTask {
  id: string
  title: string
  description: string
  category: string
  type: string
  payout: number
  location: string
  city: string
  state: string
  zipCode: string
  coordinates?: { lat: number, lng: number }
  radius_miles: number
  time_commitment: string
  requirements: string[]
  organizer: string
  participants_needed: number
  current_participants: number
  deadline: string
  distance_from_user?: number
}

export default function CommunityTasksSection() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [locationFilter, setLocationFilter] = useState('25') // Default 25 mile radius
  const [cityFilter, setCityFilter] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    category: 'Household',
    payout: '',
    location: '',
    city: '',
    state: '',
    zipCode: '',
    radius_miles: '5',
    time_commitment: '',
    participants_needed: '',
    requirements: ''
  })

  // Load real tasks from database
  const { data: dbTasks = [], isLoading, refetch } = useQuery({
    queryKey: ['/api/tasks', 'shared'],
    queryFn: async () => {
      const response = await fetch('/api/tasks?type=shared')
      if (!response.ok) throw new Error('Failed to fetch tasks')
      return response.json()
    }
  })

  // Transform database tasks to match interface
  const transformDbTask = (task: any): CommunityTask => ({
    id: task.id,
    title: task.title,
    description: task.description,
    category: 'Community', // Map from categoryId if needed
    type: 'community',
    payout: parseFloat(task.earningPotential || '0'),
    location: task.location || 'Location TBD',
    city: 'San Francisco', // Extract from location if available
    state: 'CA',
    zipCode: '94102',
    coordinates: { lat: 37.7749, lng: -122.4194 },
    radius_miles: 25,
    time_commitment: task.duration || 'TBD',
    requirements: typeof task.requirements === 'string' ? [task.requirements] : (task.requirements || []),
    organizer: 'Community Member',
    participants_needed: task.maxParticipants || 1,
    current_participants: task.currentParticipants || 0,
    deadline: '7 days', // Calculate from createdAt if needed
    distance_from_user: Math.random() * 20 // Calculate real distance later
  })

  // Combine real tasks with sample data for demo
  const realTasks = dbTasks.map(transformDbTask)
  
  // Sample community tasks for demonstration
  const sampleTasks: CommunityTask[] = [
    {
      id: 'community-001',
      title: 'Neighborhood Spring Cleanup',
      description: 'Organize community volunteers to clean up local park and streets',
      category: 'Community Service',
      type: 'community',
      payout: 50,
      location: 'Pine Street Park',
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94102',
      coordinates: { lat: 37.7749, lng: -122.4194 },
      radius_miles: 5,
      time_commitment: '3-4 hours',
      requirements: ['Gloves', 'Cleanup bags', 'Group coordination'],
      organizer: 'Sarah M.',
      participants_needed: 8,
      current_participants: 3,
      deadline: '3 days',
      distance_from_user: 2.3
    },
    {
      id: 'community-002',
      title: 'Block Party Setup',
      description: 'Help organize and set up annual neighborhood block party',
      category: 'Event Planning',
      type: 'community',
      payout: 75,
      location: 'Maple Avenue',
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94103',
      coordinates: { lat: 37.7849, lng: -122.4094 },
      radius_miles: 3,
      time_commitment: '5-6 hours',
      requirements: ['Event setup', 'Coordination skills', 'Physical work'],
      organizer: 'Mike R.',
      participants_needed: 6,
      current_participants: 2,
      deadline: '1 week',
      distance_from_user: 4.1
    }
  ]

  const allCommunityTasks = [...realTasks, ...sampleTasks]

  // Filter tasks based on location and search criteria
  const filteredTasks = allCommunityTasks.filter(task => {
    const matchesRadius = task.distance_from_user! <= parseInt(locationFilter)
    const matchesCity = !cityFilter || task.city.toLowerCase().includes(cityFilter.toLowerCase())
    const matchesSearch = !searchTerm || 
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = categoryFilter === 'all' || task.category === categoryFilter
    
    return matchesRadius && matchesCity && matchesSearch && matchesCategory
  })

  const handleCreateTask = async () => {
    if (!newTask.title || !newTask.description || !newTask.payout) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      })
      return
    }

    if (!user?.id) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to create tasks.",
        variant: "destructive"
      })
      return
    }

    try {
      // Calculate actual location from city/state/zip for geocoding  
      const fullLocation = [newTask.location, newTask.city, newTask.state, newTask.zipCode]
        .filter(Boolean)
        .join(', ')

      // Save task to database via API
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: newTask.title,
          description: newTask.description,
          earningPotential: parseFloat(newTask.payout),
          location: fullLocation,
          maxParticipants: parseInt(newTask.participants_needed) || 1,
          duration: newTask.time_commitment,
          requirements: newTask.requirements,
          type: 'shared', // Community tasks are 'shared' type
          creatorId: user.id,
          categoryId: null, // Will be assigned based on category mapping
          status: 'open',
        })
      })

      if (!response.ok) {
        throw new Error('Failed to create task')
      }

      const savedTask = await response.json()

      toast({
        title: "Community Task Created & Saved!",
        description: `Task "${newTask.title}" is now live with ID: ${savedTask.id}. Neighbors can apply and earn!`,
      })

      // Reset form
      setNewTask({
        title: '',
        description: '',
        category: 'Household',
        payout: '',
        location: '',
        city: '',
        state: '',
        zipCode: '',
        radius_miles: '5',
        time_commitment: '',
        participants_needed: '',
        requirements: ''
      })
      setShowCreateForm(false)

      // Refresh tasks list to show new task
      refetch()
    } catch (error) {
      console.error('Error creating community task:', error)
      toast({
        title: "Save Failed",
        description: "Could not save your task. Please try again.",
        variant: "destructive"
      })
    }
  }

  const [selectedTaskForMessaging, setSelectedTaskForMessaging] = useState<CommunityTask | null>(null)
  const [showMessaging, setShowMessaging] = useState(false)

  const handleJoinTask = (task: CommunityTask) => {
    toast({
      title: "Joined Community Task!",
      description: `You've joined "${task.title}". Check messages for coordination details.`,
    })
  }

  const handleOpenMessaging = (task: CommunityTask) => {
    setSelectedTaskForMessaging(task)
    setShowMessaging(true)
  }

  const calculateNetPayout = (grossPayout: number) => {
    const fee = grossPayout * 0.07 // 7% community fee
    return grossPayout - fee
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Community Tasks</h1>
          <p className="text-gray-600">Collaborate with neighbors for bigger projects • 7% transparent fee</p>
        </div>
        <Button
          onClick={() => setShowCreateForm(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white"
          data-testid="button-create-community-task"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Task
        </Button>
      </div>

      {/* Location and Search Filters */}
      <Card className="bg-white shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="search-tasks" className="text-sm font-medium">Search Tasks</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  id="search-tasks"
                  placeholder="Search by title or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="w-full md:w-48">
              <Label htmlFor="location-radius" className="text-sm font-medium">Radius (miles)</Label>
              <Select value={locationFilter} onValueChange={setLocationFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Select radius" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">Within 5 miles</SelectItem>
                  <SelectItem value="10">Within 10 miles</SelectItem>
                  <SelectItem value="25">Within 25 miles</SelectItem>
                  <SelectItem value="50">Within 50 miles</SelectItem>
                  <SelectItem value="100">Within 100 miles</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="w-full md:w-48">
              <Label htmlFor="city-filter" className="text-sm font-medium">City</Label>
              <Input
                id="city-filter"
                placeholder="Filter by city..."
                value={cityFilter}
                onChange={(e) => setCityFilter(e.target.value)}
              />
            </div>

            <div className="w-full md:w-48">
              <Label htmlFor="category-filter" className="text-sm font-medium">Category</Label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="Community Service">Community Service</SelectItem>
                  <SelectItem value="Event Planning">Event Planning</SelectItem>
                  <SelectItem value="Outdoor Work">Outdoor Work</SelectItem>
                  <SelectItem value="Education">Education</SelectItem>
                  <SelectItem value="Household">Household</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="mt-3 flex items-center gap-2 text-sm text-gray-600">
            <Filter className="w-4 h-4" />
            <span>Showing {filteredTasks.length} tasks within {locationFilter} miles</span>
            {cityFilter && <span>• City: {cityFilter}</span>}
            {categoryFilter !== 'all' && <span>• Category: {categoryFilter}</span>}
          </div>
        </CardContent>
      </Card>

      {/* Live Platform Banner */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-blue-900">Community Coordination - LIVE Income Platform!</h3>
              <p className="text-blue-700 text-sm">
                7% transparent fee structure: Create tasks requiring multiple people, coordinate with neighbors, 
                split real money payouts fairly. Live transactions with built-in messaging system.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Create Task Form */}
      {showCreateForm && (
        <Card className="bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl text-gray-900">Create Community Task</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="task-title">Task Title *</Label>
                <Input
                  id="task-title"
                  value={newTask.title}
                  onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                  placeholder="Neighborhood cleanup, block party setup..."
                  data-testid="input-task-title"
                />
              </div>
              <div>
                <Label htmlFor="task-payout">Total Payout ($) *</Label>
                <Input
                  id="task-payout"
                  type="number"
                  value={newTask.payout}
                  onChange={(e) => setNewTask({...newTask, payout: e.target.value})}
                  placeholder="50"
                  data-testid="input-task-payout"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="task-description">Description *</Label>
              <Textarea
                id="task-description"
                value={newTask.description}
                onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                placeholder="Describe what needs to be done, coordination details..."
                rows={3}
                data-testid="textarea-task-description"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="task-location">Location</Label>
                <Input
                  id="task-location"
                  value={newTask.location}
                  onChange={(e) => setNewTask({...newTask, location: e.target.value})}
                  placeholder="Local park, Maple Ave..."
                  data-testid="input-task-location"
                />
              </div>
              <div>
                <Label htmlFor="task-time">Time Commitment</Label>
                <Input
                  id="task-time"
                  value={newTask.time_commitment}
                  onChange={(e) => setNewTask({...newTask, time_commitment: e.target.value})}
                  placeholder="3-4 hours"
                  data-testid="input-task-time"
                />
              </div>
              <div>
                <Label htmlFor="task-participants">Participants Needed</Label>
                <Input
                  id="task-participants"
                  type="number"
                  value={newTask.participants_needed}
                  onChange={(e) => setNewTask({...newTask, participants_needed: e.target.value})}
                  placeholder="5"
                  data-testid="input-task-participants"
                />
              </div>
            </div>

            <div className="flex gap-4">
              <Button
                onClick={handleCreateTask}
                className="bg-blue-600 hover:bg-blue-700 text-white"
                data-testid="button-submit-task"
              >
                Create Community Task
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowCreateForm(false)}
                data-testid="button-cancel-task"
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Available Tasks */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTasks.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <div className="text-gray-400 mb-4">
              <MapPin className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks found in your area</h3>
            <p className="text-gray-600 mb-4">
              Try expanding your search radius or be the first to create a task in your neighborhood!
            </p>
            <Button
              onClick={() => setShowCreateForm(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Create First Task
            </Button>
          </div>
        ) : (
          filteredTasks.map((task) => (
          <Card key={task.id} className="bg-white shadow-sm hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                  Community
                </Badge>
                <div className="text-right">
                  <div className="font-bold text-lg text-blue-600">${task.payout}</div>
                  <div className="text-xs text-gray-500">Net: ${calculateNetPayout(task.payout).toFixed(2)}</div>
                </div>
              </div>
              <CardTitle className="text-lg">{task.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600 text-sm">{task.description}</p>
              
              <div className="space-y-2 text-sm">
                <div className="flex items-center text-gray-600">
                  <Clock className="w-4 h-4 mr-2" />
                  <span>{task.time_commitment}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <MapPin className="w-4 h-4 mr-2" />
                  <span>{task.location}, {task.city}, {task.state}</span>
                </div>
                <div className="flex items-center text-sm text-blue-600">
                  <span className="font-medium">{task.distance_from_user} miles away</span>
                  <span className="mx-2">•</span>
                  <span>Up to {task.radius_miles} mile radius</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Users className="w-4 h-4 mr-2" />
                  <span>{task.current_participants}/{task.participants_needed} joined</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Organized by {task.organizer}</span>
                <Badge variant="outline" className="text-xs">
                  {task.deadline} left
                </Badge>
              </div>

              <div className="space-y-2">
                <TaskApplicationButton
                  taskId={task.id}
                  taskTitle={task.title}
                  taskType="shared"
                  payout={calculateNetPayout(task.payout)}
                />
                <TaskSubmissionButton
                  taskId={task.id}
                  taskTitle={task.title}
                  taskType="shared"
                  payout={task.payout}
                />
                <Button
                  variant="outline"
                  onClick={() => handleOpenMessaging(task)}
                  className="w-full text-blue-600 border-blue-200 hover:bg-blue-50"
                  data-testid={`button-message-${task.id}`}
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Message Group
                </Button>
              </div>
            </CardContent>
          </Card>
          ))
        )}
      </div>

      {/* Benefits Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <Card className="bg-white shadow-sm">
          <CardContent className="p-6 text-center">
            <div className="p-3 bg-blue-100 rounded-full w-fit mx-auto mb-3">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Bigger Projects</h3>
            <p className="text-sm text-gray-600">Tackle tasks that need multiple people working together</p>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm">
          <CardContent className="p-6 text-center">
            <div className="p-3 bg-green-100 rounded-full w-fit mx-auto mb-3">
              <MessageCircle className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Built-in Coordination</h3>
            <p className="text-sm text-gray-600">Group messaging and planning tools included</p>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm">
          <CardContent className="p-6 text-center">
            <div className="p-3 bg-purple-100 rounded-full w-fit mx-auto mb-3">
              <Shield className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Fair Split Payouts</h3>
            <p className="text-sm text-gray-600">Automatic payment distribution to all participants</p>
          </CardContent>
        </Card>
      </div>

      {/* Task Messaging Modal */}
      {showMessaging && selectedTaskForMessaging && user && (
        <TaskMessaging
          taskId={selectedTaskForMessaging.id}
          taskTitle={selectedTaskForMessaging.title}
          isOpen={showMessaging}
          onOpenChange={setShowMessaging}
        />
      )}
    </div>
  )
}