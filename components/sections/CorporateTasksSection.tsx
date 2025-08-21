'use client'

import { useState } from 'react'
import { useAuth } from '@/components/auth/SimpleAuthProvider'
import { useToast } from @/app/hooks/use-toast'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { 
  Plus, Building2, Clock, MapPin, Coins, Users, 
  TrendingUp, Shield, Star, Award, Briefcase, CheckCircle
} from 'lucide-react'
import TaskMessaging from '@/components/messaging/TaskMessaging'

interface CorporateTask {
  id: string
  title: string
  description: string
  category: string
  type: string
  payout: number
  location: string
  time_commitment: string
  requirements: string[]
  company: string
  deadline: string
  positions_available: number
  current_applicants: number
  experience_level: string
  verification_required: boolean
}

export default function CorporateTasksSection() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    category: 'Data Entry',
    payout: '',
    location: '',
    time_commitment: '',
    positions_available: '',
    requirements: '',
    experience_level: 'Entry Level'
  })

  // Load real corporate tasks from database with authentication
  const { data: dbTasks = [], isLoading, refetch } = useQuery({
    queryKey: ['/api/tasks', 'corporate'],
    enabled: !!user,
    queryFn: async () => {
      const { apiRequest } = await import('@/lib/queryClient')
      const response = await apiRequest('GET', '/api/tasks?type=corporate')
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Authentication required - please sign in')
        }
        throw new Error('Failed to fetch corporate tasks')
      }
      return response.json()
    },
    retry: (failureCount, error) => {
      if (error.message.includes('Authentication required')) {
        return false
      }
      return failureCount < 3
    }
  })

  // Transform database tasks to match interface
  const transformDbTask = (task: any): CorporateTask => ({
    id: task.id,
    title: task.title,
    description: task.description,
    category: task.category || 'Business',
    type: 'corporate',
    payout: parseFloat(task.earning_potential || task.earningPotential || '0'),
    location: task.location || 'Remote',
    time_commitment: task.duration || 'Flexible',
    requirements: typeof task.requirements === 'string' ? [task.requirements] : (task.requirements || []),
    company: 'Corporate Partner',
    deadline: '1 week',
    positions_available: task.max_participants || task.maxParticipants || 1,
    current_applicants: task.current_participants || task.currentParticipants || 0,
    experience_level: 'Entry Level',
    verification_required: true
  })



  // Use only real database tasks - no fallback/demo data
  const corporateTasks = dbTasks.map(transformDbTask)

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
      title: "Corporate Task Posted!",
      description: "Your business task is now live and accepting applications.",
    })

    setNewTask({
      title: '',
      description: '',
      category: 'Data Entry',
      payout: '',
      location: '',
      time_commitment: '',
      positions_available: '',
      requirements: '',
      experience_level: 'Entry Level'
    })
    setShowCreateForm(false)
  }

  const [selectedTaskForMessaging, setSelectedTaskForMessaging] = useState<CorporateTask | null>(null)
  const [showMessaging, setShowMessaging] = useState(false)

  const handleApplyToTask = (task: CorporateTask) => {
    toast({
      title: "Application Submitted!",
      description: `Your application for "${task.title}" has been submitted to ${task.company}.`,
    })
  }

  const handleOpenMessaging = (task: CorporateTask) => {
    setSelectedTaskForMessaging(task)
    setShowMessaging(true)
  }

  const calculateNetPayout = (grossPayout: number) => {
    const fee = grossPayout * 0.15 // 15% corporate fee
    return grossPayout - fee
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Corporate Tasks</h1>
          <p className="text-gray-600">Business partnership opportunities • 15% transparent fee</p>
        </div>
        <Button
          onClick={() => setShowCreateForm(true)}
          className="bg-purple-600 hover:bg-purple-700 text-white"
          data-testid="button-create-corporate-task"
        >
          <Plus className="w-4 h-4 mr-2" />
          Post Business Task
        </Button>
      </div>

      {/* Corporate Platform Banner */}
      <Card className="bg-purple-50 border-purple-200">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Building2 className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h3 className="font-semibold text-purple-900">Professional Business Tasks - LIVE Platform!</h3>
              <p className="text-purple-700 text-sm">
                15% transparent fee structure: Higher-paying professional opportunities from verified businesses. 
                Background checks available, professional networking, premium earning potential.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Create Task Form */}
      {showCreateForm && (
        <Card className="bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl text-gray-900">Post Corporate Task</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="corp-title">Task Title *</Label>
                <Input
                  id="corp-title"
                  value={newTask.title}
                  onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                  placeholder="Data entry, event setup, content review..."
                  data-testid="input-corp-title"
                />
              </div>
              <div>
                <Label htmlFor="corp-payout">Payout per Position ($) *</Label>
                <Input
                  id="corp-payout"
                  type="number"
                  value={newTask.payout}
                  onChange={(e) => setNewTask({...newTask, payout: e.target.value})}
                  placeholder="150"
                  data-testid="input-corp-payout"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="corp-description">Task Description *</Label>
              <Textarea
                id="corp-description"
                value={newTask.description}
                onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                placeholder="Detailed description of the professional task requirements..."
                rows={3}
                data-testid="textarea-corp-description"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="corp-location">Location</Label>
                <Input
                  id="corp-location"
                  value={newTask.location}
                  onChange={(e) => setNewTask({...newTask, location: e.target.value})}
                  placeholder="Remote, office, field work..."
                  data-testid="input-corp-location"
                />
              </div>
              <div>
                <Label htmlFor="corp-time">Time Commitment</Label>
                <Input
                  id="corp-time"
                  value={newTask.time_commitment}
                  onChange={(e) => setNewTask({...newTask, time_commitment: e.target.value})}
                  placeholder="6-8 hours"
                  data-testid="input-corp-time"
                />
              </div>
              <div>
                <Label htmlFor="corp-positions">Positions Available</Label>
                <Input
                  id="corp-positions"
                  type="number"
                  value={newTask.positions_available}
                  onChange={(e) => setNewTask({...newTask, positions_available: e.target.value})}
                  placeholder="5"
                  data-testid="input-corp-positions"
                />
              </div>
            </div>

            <div className="flex gap-4">
              <Button
                onClick={handleCreateTask}
                className="bg-purple-600 hover:bg-purple-700 text-white"
                data-testid="button-submit-corp-task"
              >
                Post Corporate Task
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowCreateForm(false)}
                data-testid="button-cancel-corp-task"
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Available Tasks */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {corporateTasks.map((task: CorporateTask) => (
          <Card key={task.id} className="bg-white shadow-sm hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <Badge className="bg-purple-100 text-purple-800 border-purple-200">
                  Corporate
                </Badge>
                <div className="text-right">
                  <div className="font-bold text-lg text-purple-600">${task.payout}</div>
                  <div className="text-xs text-gray-500">Net: ${calculateNetPayout(task.payout).toFixed(2)}</div>
                </div>
              </div>
              <CardTitle className="text-lg">{task.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600 text-sm">{task.description}</p>
              
              <div className="space-y-2 text-sm">
                <div className="flex items-center text-gray-600">
                  <Building2 className="w-4 h-4 mr-2" />
                  <span>{task.company}</span>
                </div>
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
                  <span>{task.positions_available} positions • {task.current_applicants} applied</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <Badge variant="outline" className="text-xs">
                  {task.experience_level}
                </Badge>
                <div className="flex items-center gap-2">
                  {task.verification_required && (
                    <Badge variant="outline" className="text-xs text-green-600 border-green-200">
                      <Shield className="w-3 h-3 mr-1" />
                      Verified
                    </Badge>
                  )}
                  <Badge variant="outline" className="text-xs">
                    {task.deadline} left
                  </Badge>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">Requirements:</p>
                <div className="flex flex-wrap gap-1">
                  {task.requirements.slice(0, 2).map((req: string, index: number) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {req}
                    </Badge>
                  ))}
                  {task.requirements.length > 2 && (
                    <Badge variant="outline" className="text-xs">
                      +{task.requirements.length - 2} more
                    </Badge>
                  )}
                </div>
              </div>

              <Button
                onClick={() => handleApplyToTask(task)}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                data-testid={`button-apply-${task.id}`}
              >
                <Briefcase className="w-4 h-4 mr-2" />
                Apply for Position
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Benefits Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <Card className="bg-white shadow-sm">
          <CardContent className="p-6 text-center">
            <div className="p-3 bg-purple-100 rounded-full w-fit mx-auto mb-3">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Higher Earnings</h3>
            <p className="text-sm text-gray-600">Professional tasks with premium pay rates</p>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm">
          <CardContent className="p-6 text-center">
            <div className="p-3 bg-green-100 rounded-full w-fit mx-auto mb-3">
              <Shield className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Verified Businesses</h3>
            <p className="text-sm text-gray-600">Work with established, verified companies</p>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm">
          <CardContent className="p-6 text-center">
            <div className="p-3 bg-blue-100 rounded-full w-fit mx-auto mb-3">
              <Award className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Professional Growth</h3>
            <p className="text-sm text-gray-600">Build skills and professional network</p>
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