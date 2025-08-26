'use client'

import { useState, useEffect, Suspense } from 'react'
import { useAuth } from '../../../components/auth/SimpleAuthProvider'
import { useParams, useRouter } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiRequest } from '@/lib/queryClient'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import CleanNavigation from '@/components/CleanNavigation'
import CleanLayout from '@/components/CleanLayout'
import TaskMessaging from '@/components/messaging/TaskMessaging'
import { 
  Clock, Users, MapPin, Coins, Star, Upload, 
  CheckCircle, ArrowLeft, AlertCircle, Camera, MessageSquare 
} from 'lucide-react'

// Types for task data
interface Task {
  id: string
  title: string
  description: string
  category: string
  type: string
  earning_potential: number
  max_participants: number
  current_participants: number
  location: string
  duration: string
  difficulty: string
  requirements: string
  created_by: string
  status: string
  created_at: string
  creator?: {
    id: string
    first_name: string
    last_name: string
    phone_number: string
    location: string
  }
}

interface TaskParticipant {
  id: string
  status: string
  joined_at: string
  accepted_at?: string
  application_responses?: any[]
  user: {
    id: string
    first_name: string
    last_name: string
    email: string
  }
}

function TaskDetailContent() {
  const { id } = useParams()
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const queryClient = useQueryClient()
  
  const [mounted, setMounted] = useState(false)
  const [currentStep, setCurrentStep] = useState<'view' | 'apply' | 'questions' | 'submitted'>('view')
  const [responses, setResponses] = useState<string[]>(['', '', ''])
  const [isMessagingOpen, setIsMessagingOpen] = useState(false)

  // Fetch task details
  const { data: task, isLoading: taskLoading, error: taskError } = useQuery<Task>({
    queryKey: ['/api/tasks', id],
    enabled: !!id && isAuthenticated,
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/tasks/${id}`)
      return response.json()
    }
  })

  // Fetch user's participation status for this task
  const { data: userParticipation, isLoading: participationLoading } = useQuery<TaskParticipant | null>({
    queryKey: ['/api/tasks', id, 'participation'],
    enabled: !!id && !!user && isAuthenticated,
    queryFn: async () => {
      try {
        const response = await apiRequest('GET', `/api/tasks/${id}/my-participation`)
        return response.json()
      } catch (error: any) {
        if (error.message.includes('404')) {
          return null // User hasn't applied
        }
        throw error
      }
    }
  })

  // Application submission mutation
  const applyMutation = useMutation({
    mutationFn: async (applicationData: { applicationResponses: string[] }) => {
      const response = await apiRequest('POST', `/api/tasks/${id}/apply`, applicationData)
      return response.json()
    },
    onSuccess: (data) => {
      toast({
        title: "Application Submitted!",
        description: data.message || "Your application has been submitted successfully."
      })
      setCurrentStep('submitted')
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/tasks', id] })
      queryClient.invalidateQueries({ queryKey: ['/api/tasks', id, 'participation'] })
    },
    onError: (error: any) => {
      toast({
        title: "Application Failed",
        description: error.message || "Failed to submit application. Please try again.",
        variant: "destructive"
      })
    }
  })

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted && !isAuthenticated) {
      router.push('/auth')
    }
  }, [mounted, isAuthenticated, router])

  if (!mounted) {
    return null
  }

  if (!isAuthenticated) {
    return null
  }

  // Loading states
  if (taskLoading || participationLoading) {
    return (
      <CleanLayout>
        <CleanNavigation />
        <main style={{ maxWidth: '1200px', margin: '0 auto', padding: 'clamp(24px, 6vw, 48px) clamp(16px, 4vw, 24px)' }}>
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-48 bg-gray-200 rounded mb-6"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <div className="h-64 bg-gray-200 rounded"></div>
              </div>
              <div className="space-y-4">
                <div className="h-32 bg-gray-200 rounded"></div>
                <div className="h-24 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </main>
      </CleanLayout>
    )
  }

  // Error states
  if (taskError || !task) {
    return (
      <CleanLayout>
        <CleanNavigation />
        <main style={{ maxWidth: '1200px', margin: '0 auto', padding: 'clamp(24px, 6vw, 48px) clamp(16px, 4vw, 24px)' }}>
          <Card className="card-clean">
            <CardContent className="text-center p-8">
              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Task Not Found</h2>
              <p className="text-muted-foreground mb-4">This task may have been removed or you don't have permission to view it.</p>
              <Button onClick={() => router.push('/community')} className="button-clean">
                Back to Tasks
              </Button>
            </CardContent>
          </Card>
        </main>
      </CleanLayout>
    )
  }

  const availableSpots = task.max_participants - task.current_participants
  const platformFee = Math.round(task.earning_potential * 0.07) // 7% fee for community tasks
  const netEarnings = task.earning_potential - platformFee
  
  // Determine current step based on user participation
  const currentUserStep = userParticipation 
    ? (userParticipation.status === 'applied' ? 'submitted' : userParticipation.status)
    : currentStep

  const handleApply = () => {
    setCurrentStep('questions')
  }

  const handleSubmitApplication = () => {
    applyMutation.mutate({ applicationResponses: responses })
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'solo': return 'bg-blue-100 text-blue-800'
      case 'shared': return 'bg-green-100 text-green-800'
      case 'self_care': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <CleanLayout>
      <CleanNavigation />
      
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: 'clamp(24px, 6vw, 48px) clamp(16px, 4vw, 24px)' }}>
        {/* Back Button */}
        <Button 
          variant="ghost" 
          onClick={() => router.push('/community')}
          className="mb-6 p-0 h-auto font-normal text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Tasks
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Task Header */}
            <Card className="card-clean">
              <CardHeader>
                <div className="flex items-start justify-between mb-4">
                  <Badge className={getTypeColor(task.type)}>
                    {task.type.replace('_', ' ')}
                  </Badge>
                  <Badge className="bg-green-100 text-green-800">
                    {availableSpots} spot{availableSpots !== 1 ? 's' : ''} available
                  </Badge>
                </div>
                
                <CardTitle className="text-2xl mb-2">{task.title}</CardTitle>
                <CardDescription className="text-base">
                  {task.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Task Details */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Location</p>
                      <p className="text-small text-muted-foreground">{task.location}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Duration</p>
                      <p className="text-small text-muted-foreground">{task.duration}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Users className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Participants</p>
                      <p className="text-small text-muted-foreground">
                        {task.current_participants}/{task.max_participants} joined
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Coins className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Category</p>
                      <p className="text-small text-muted-foreground">{task.category}</p>
                    </div>
                  </div>
                </div>

                {/* Requirements */}
                {task.requirements && (
                  <div>
                    <h3 className="font-semibold mb-3">Requirements</h3>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                      <span className="text-small">{task.requirements}</span>
                    </div>
                  </div>
                )}

                {/* Creator Info */}
                <div className="border-t pt-6">
                  <h3 className="font-semibold mb-3">Task Creator</h3>
                  <div className="flex items-center gap-4">
                    <div className="text-3xl">👤</div>
                    <div>
                      <p className="font-medium">{task.creator ? `${task.creator.first_name} ${task.creator.last_name}`.trim() || 'Anonymous' : 'Anonymous'}</p>
                      <div className="flex items-center gap-2">
                        <Star className="h-4 w-4 text-yellow-500" />
                        <span className="text-small">New Member</span>
                        <span className="text-small text-muted-foreground">
                          • Phone verified
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Application Form */}
            {currentStep === 'questions' && (
              <Card className="card-clean">
                <CardHeader>
                  <CardTitle className="text-lg">Application Questions</CardTitle>
                  <CardDescription>
                    Please answer these questions to help the task creator evaluate your application
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    "Why are you interested in this task?",
                    "Do you have relevant experience or skills?", 
                    "What's your availability for this task?"
                  ].map((question, index) => (
                    <div key={index} className="space-y-2">
                      <label className="font-medium">{question}</label>
                      <Textarea
                        placeholder="Your answer..."
                        value={responses[index]}
                        onChange={(e) => {
                          const newResponses = [...responses]
                          newResponses[index] = e.target.value
                          setResponses(newResponses)
                        }}
                        className="min-h-20"
                      />
                    </div>
                  ))}
                  
                  <div className="flex gap-4 pt-4">
                    <Button
                      onClick={handleSubmitApplication}
                      className="button-clean"
                      disabled={responses.some(r => !r.trim())}
                    >
                      Submit Application
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setCurrentStep('view')}
                      className="button-outline"
                    >
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Submitted State */}
            {currentStep === 'submitted' && (
              <Card className="card-clean border-green-200 bg-green-50">
                <CardContent className="p-6 text-center">
                  <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Application Submitted!</h3>
                  <p className="text-muted-foreground mb-4">
                    Your application has been sent to the task creator. You'll be notified when they respond.
                  </p>
                  <Button
                    onClick={() => router.push('/community')}
                    className="button-clean"
                  >
                    Browse More Tasks
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Real-Time Messaging */}
            {isMessagingOpen && (
              <TaskMessaging 
                taskId={id as string}
                taskTitle={task.title}
                isOpen={isMessagingOpen}
                onOpenChange={setIsMessagingOpen}
              />
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Earnings Breakdown */}
            <Card className="card-clean">
              <CardHeader>
                <CardTitle className="text-lg">Earnings Breakdown</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Task Payout</span>
                  <span className="font-semibold">${task.earning_potential}</span>
                </div>
                <div className="flex justify-between">
                  <span>Platform Fee ({task.type === 'barter' ? '0' : '7'}%)</span>
                  <span className="text-red-600">{task.type === 'barter' ? '$0' : `-$${platformFee}`}</span>
                </div>
                <div className="flex justify-between pt-2 border-t font-semibold">
                  <span>Your Earnings</span>
                  <span className="text-green-600">${task.type === 'barter' ? task.earning_potential : netEarnings}</span>
                </div>
                <p className="text-small text-muted-foreground">
                  {task.max_participants > 1 ? `Split between ${task.max_participants} participants` : 'Individual task'}
                </p>
                {task.type !== 'barter' && (
                  <p className="text-small text-muted-foreground">
                    <span className="text-primary cursor-pointer" onClick={() => router.push('/subscribe')}>
                      Upgrade your plan
                    </span> to reduce platform fees
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Task Communication */}
            {isAuthenticated && (
              <Card className="card-clean">
                <CardHeader>
                  <CardTitle className="text-lg">Task Communication</CardTitle>
                  <CardDescription>
                    Chat with other participants and the task creator
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    onClick={() => setIsMessagingOpen(true)}
                    className="w-full button-clean"
                    data-testid="button-open-messaging"
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Open Task Chat
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Action Button */}
            <Card className="card-clean">
              <CardContent className="p-6">
                {availableSpots === 0 ? (
                  <div className="text-center">
                    <Users className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
                    <p className="font-medium mb-2">Task Full</p>
                    <p className="text-small text-muted-foreground mb-4">
                      No more spots available for this task
                    </p>
                    <Button className="w-full button-outline" disabled>
                      Task Full
                    </Button>
                  </div>
                ) : userParticipation ? (
                  <div className="text-center">
                    {userParticipation.status === 'applied' ? (
                      <>
                        <CheckCircle className="h-8 w-8 text-yellow-600 mx-auto mb-3" />
                        <p className="font-medium mb-2">Application Submitted</p>
                        <p className="text-small text-muted-foreground">
                          Waiting for creator approval
                        </p>
                      </>
                    ) : userParticipation.status === 'accepted' ? (
                      <>
                        <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-3" />
                        <p className="font-medium mb-2">Application Accepted!</p>
                        <p className="text-small text-muted-foreground mb-4">
                          You're a confirmed participant
                        </p>
                        <Button 
                          onClick={() => router.push(`/task/${id}/complete`)}
                          className="w-full button-clean"
                        >
                          Complete Task
                        </Button>
                      </>
                    ) : userParticipation.status === 'completed' ? (
                      <>
                        <CheckCircle className="h-8 w-8 text-blue-600 mx-auto mb-3" />
                        <p className="font-medium mb-2">Task Completed</p>
                        <p className="text-small text-muted-foreground">
                          Waiting for verification
                        </p>
                      </>
                    ) : userParticipation.status === 'verified' ? (
                      <>
                        <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-3" />
                        <p className="font-medium mb-2">Task Verified!</p>
                        <p className="text-small text-muted-foreground">
                          Payment will be processed soon
                        </p>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
                        <p className="font-medium mb-2">Application Rejected</p>
                        <p className="text-small text-muted-foreground">
                          This application was not accepted
                        </p>
                      </>
                    )}
                  </div>
                ) : currentStep === 'questions' ? (
                  <div className="text-center">
                    <p className="font-medium mb-2">Fill out application</p>
                    <p className="text-small text-muted-foreground">
                      Complete the questions above to apply
                    </p>
                  </div>
                ) : (
                  <div className="text-center">
                    <Coins className="h-8 w-8 text-green-600 mx-auto mb-3" />
                    <p className="font-medium mb-2">Ready to Join?</p>
                    <p className="text-small text-muted-foreground mb-4">
                      {task.type === 'barter' ? 'Trade items with other participants' : `Earn $${task.type === 'barter' ? task.earning_potential : netEarnings} for this task`}
                    </p>
                    <Button 
                      onClick={handleApply}
                      className="w-full button-clean"
                      disabled={applyMutation.isPending}
                    >
                      {applyMutation.isPending ? 'Applying...' : 'Apply Now'}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Similar Tasks */}
            <Card className="card-clean">
              <CardHeader>
                <CardTitle className="text-lg">Similar Tasks</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 border border-border rounded-lg">
                  <h4 className="font-medium text-small">After School Pickup</h4>
                  <p className="text-small text-muted-foreground">$40 • 2 spots left</p>
                </div>
                <div className="p-3 border border-border rounded-lg">
                  <h4 className="font-medium text-small">Carpool Coordination</h4>
                  <p className="text-small text-muted-foreground">$35 • 3 spots left</p>
                </div>
                <Button 
                  variant="outline" 
                  className="w-full button-outline"
                  onClick={() => router.push('/community')}
                >
                  View All Tasks
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </CleanLayout>
  )
}

export default function TaskDetailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading task details...</p>
        </div>
      </div>
    }>
      <TaskDetailContent />
    </Suspense>
  )
}