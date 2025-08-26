'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, MapPin, Clock, DollarSign, Users, ArrowRight } from "lucide-react"
import { useRouter } from 'next/navigation'

interface Task {
  id: string
  title: string
  description: string
  type: 'solo' | 'community' | 'barter'
  category: string
  createdBy: string
  createdByName: string
  status: string
  earningPotential?: number
  maxParticipants: number
  currentParticipants: number
  location: string
  duration: string
  difficulty: 'easy' | 'medium' | 'hard'
  offering?: string
  seeking?: string
  tradeType?: string
  createdAt: string
}

const difficultyColors = {
  easy: 'bg-green-100 text-green-800',
  medium: 'bg-yellow-100 text-yellow-800',
  hard: 'bg-red-100 text-red-800'
}

const typeColors = {
  solo: 'bg-blue-100 text-blue-800',
  community: 'bg-purple-100 text-purple-800',
  barter: 'bg-orange-100 text-orange-800'
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('all')
  const router = useRouter()

  useEffect(() => {
    fetchTasks()
  }, [activeTab])

  const fetchTasks = async () => {
    try {
      setLoading(true)
      const url = activeTab === 'all' 
        ? '/api/tasks' 
        : `/api/tasks?type=${activeTab}`
      
      const response = await fetch(url)
      const data = await response.json()
      setTasks(data)
    } catch (error) {
      console.error('Error fetching tasks:', error)
    } finally {
      setLoading(false)
    }
  }

  const getTaskTypeLabel = (type: string) => {
    switch (type) {
      case 'solo': return 'Solo Task'
      case 'community': return 'Community Task'
      case 'barter': return 'Barter Trade'
      default: return type
    }
  }

  const getTaskTypeFee = (type: string) => {
    switch (type) {
      case 'solo': return '3% platform fee'
      case 'community': return '7% platform fee'
      case 'barter': return 'No fees'
      default: return ''
    }
  }

  const TaskCard = ({ task }: { task: Task }) => (
    <Card key={task.id} className="h-full hover:shadow-lg transition-shadow" data-testid={`card-task-${task.id}`}>
      <CardHeader>
        <div className="flex justify-between items-start gap-2">
          <div className="flex-1">
            <CardTitle className="text-lg" data-testid={`text-task-title-${task.id}`}>{task.title}</CardTitle>
            <CardDescription data-testid={`text-task-description-${task.id}`}>{task.description}</CardDescription>
          </div>
          <div className="flex flex-col gap-1">
            <Badge className={typeColors[task.type]} data-testid={`badge-task-type-${task.id}`}>
              {getTaskTypeLabel(task.type)}
            </Badge>
            <Badge variant="secondary" className={difficultyColors[task.difficulty]} data-testid={`badge-task-difficulty-${task.id}`}>
              {task.difficulty}
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <MapPin className="h-4 w-4" />
          <span data-testid={`text-task-location-${task.id}`}>{task.location}</span>
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Clock className="h-4 w-4" />
          <span data-testid={`text-task-duration-${task.id}`}>{task.duration}</span>
        </div>

        {task.type === 'barter' ? (
          <div className="space-y-2">
            <div>
              <p className="text-sm font-medium text-green-700">Offering:</p>
              <p className="text-sm" data-testid={`text-task-offering-${task.id}`}>{task.offering}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-blue-700">Seeking:</p>
              <p className="text-sm" data-testid={`text-task-seeking-${task.id}`}>{task.seeking}</p>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-green-600" />
            <span className="font-semibold text-green-600" data-testid={`text-task-earning-${task.id}`}>
              ${task.earningPotential?.toFixed(2)}
            </span>
            <span className="text-xs text-gray-500">({getTaskTypeFee(task.type)})</span>
          </div>
        )}

        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Users className="h-4 w-4" />
          <span data-testid={`text-task-participants-${task.id}`}>
            {task.currentParticipants}/{task.maxParticipants} participants
          </span>
        </div>

        <div className="text-xs text-gray-500">
          By {task.createdByName} • {new Date(task.createdAt).toLocaleDateString()}
        </div>
      </CardContent>

      <CardFooter>
        <Button 
          className="w-full" 
          onClick={() => router.push(`/tasks/${task.id}`)}
          data-testid={`button-view-task-${task.id}`}
        >
          View Details <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  )

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-page-title">Neighborhood Tasks</h1>
          <p className="text-gray-600 mt-1" data-testid="text-page-description">
            Find tasks in your area or create your own
          </p>
        </div>
        <Button 
          onClick={() => router.push('/tasks/create')}
          className="flex items-center gap-2"
          data-testid="button-create-task"
        >
          <Plus className="h-4 w-4" /> Create Task
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4" data-testid="tabs-task-types">
          <TabsTrigger value="all" data-testid="tab-all-tasks">All Tasks</TabsTrigger>
          <TabsTrigger value="solo" data-testid="tab-solo-tasks">Solo (3% fee)</TabsTrigger>
          <TabsTrigger value="community" data-testid="tab-community-tasks">Community (7% fee)</TabsTrigger>
          <TabsTrigger value="barter" data-testid="tab-barter-tasks">Barter (No fees)</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <Card key={i} className="h-64 animate-pulse" data-testid={`skeleton-task-${i}`}>
                  <CardHeader>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-full"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : tasks.length === 0 ? (
            <div className="text-center py-12" data-testid="empty-state">
              <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks found</h3>
              <p className="text-gray-600 mb-4">
                {activeTab === 'all' 
                  ? 'Be the first to create a task in your neighborhood!'
                  : `No ${activeTab} tasks available right now.`
                }
              </p>
              <Button 
                onClick={() => router.push('/tasks/create')}
                data-testid="button-create-first-task"
              >
                Create the First Task
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="tasks-grid">
              {tasks.map(task => <TaskCard key={task.id} task={task} />)}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}