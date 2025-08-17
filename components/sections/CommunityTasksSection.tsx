'use client'

import { useState } from 'react'
import { useAuth } from '@/components/auth/AuthProvider'
import { useToast } from '@/hooks/use-toast'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { 
  Plus, Users, MessageCircle, MapPin, Coins, Clock, 
  TrendingUp, Star, Shield, CheckCircle
} from 'lucide-react'

interface CommunityTask {
  id: string
  title: string
  description: string
  category: string
  type: string
  payout: number
  location: string
  time_commitment: string
  requirements: string[]
  organizer: string
  participants_needed: number
  current_participants: number
  deadline: string
}

export default function CommunityTasksSection() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    category: 'Household',
    payout: '',
    location: '',
    time_commitment: '',
    participants_needed: '',
    requirements: ''
  })

  // Sample community tasks
  const sampleTasks: CommunityTask[] = [
    {
      id: 'community-001',
      title: 'Neighborhood Spring Cleanup',
      description: 'Organize community volunteers to clean up local park and streets',
      category: 'Community Service',
      type: 'community',
      payout: 50,
      location: 'Pine Street Park',
      time_commitment: '3-4 hours',
      requirements: ['Gloves', 'Cleanup bags', 'Group coordination'],
      organizer: 'Sarah M.',
      participants_needed: 8,
      current_participants: 3,
      deadline: '3 days'
    },
    {
      id: 'community-002',
      title: 'Block Party Setup',
      description: 'Help organize and set up annual neighborhood block party',
      category: 'Event Planning',
      type: 'community',
      payout: 75,
      location: 'Maple Avenue',
      time_commitment: '5-6 hours',
      requirements: ['Event setup', 'Coordination skills', 'Physical work'],
      organizer: 'Mike R.',
      participants_needed: 6,
      current_participants: 2,
      deadline: '1 week'
    }
  ]

  const handleCreateTask = () => {
    if (!newTask.title || !newTask.description || !newTask.payout) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      })
      return
    }

    toast({
      title: "Community Task Created!",
      description: "Your task has been posted and neighbors can now join.",
    })

    setNewTask({
      title: '',
      description: '',
      category: 'Household',
      payout: '',
      location: '',
      time_commitment: '',
      participants_needed: '',
      requirements: ''
    })
    setShowCreateForm(false)
  }

  const handleJoinTask = (task: CommunityTask) => {
    toast({
      title: "Joined Community Task!",
      description: `You've joined "${task.title}". Check messages for coordination details.`,
    })
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

      {/* Live Platform Banner */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-blue-900">Community Coordination - LIVE Platform!</h3>
              <p className="text-blue-700 text-sm">
                7% transparent fee structure: Create tasks that need multiple people, coordinate with neighbors, 
                split payouts fairly. Real money transactions with built-in messaging.
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
        {sampleTasks.map((task) => (
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
                  <span>{task.location}</span>
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
                <Button
                  onClick={() => handleJoinTask(task)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  data-testid={`button-join-${task.id}`}
                >
                  <Users className="w-4 h-4 mr-2" />
                  Join Task
                </Button>
                <Button
                  variant="outline"
                  className="w-full text-blue-600 border-blue-200 hover:bg-blue-50"
                  data-testid={`button-message-${task.id}`}
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Message Group
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
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
    </div>
  )
}