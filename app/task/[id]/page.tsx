'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '../../../components/auth/AuthProvider'
import { useParams, useRouter } from 'next/navigation'
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

// Sample task data based on marketplace
const sampleTask = {
  id: '1',
  title: 'School Pickup Share',
  description: 'Looking for adults to share daily school pickup duties for elementary school. We need reliable adults who can take turns picking up kids from Downtown Elementary School. Perfect for working adults who want to reduce daily commute stress.',
  category: 'Transportation',
  type: 'shared',
  payout: 45,
  max_participants: 4,
  current_participants: 2,
  deadline: '2025-01-15',
  location: 'Downtown Elementary School',
  time_commitment: '30 minutes daily',
  requirements: ['Valid driver license', 'Car insurance', 'Background check'],
  creator: {
    name: 'Sarah M.',
    avatar: '👩‍🦰',
    rating: 4.8,
    completedTasks: 23
  },
  questions: [
    'Do you have experience with school pickups?',
    'Are you available Monday-Friday 3:00-3:30 PM?',
    'How many children do you currently have?'
  ]
}

export default function TaskDetailPage() {
  const { id } = useParams()
  const { user, isAuthenticated, isVerified } = useAuth()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [currentStep, setCurrentStep] = useState<'view' | 'apply' | 'questions' | 'submitted'>('view')
  const [responses, setResponses] = useState<string[]>(['', '', ''])

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

  const task = sampleTask
  const availableSpots = task.max_participants - task.current_participants
  const platformFee = Math.round(task.payout * 0.1) // 10% fee for Free users
  const netEarnings = task.payout - platformFee

  const handleApply = () => {
    if (!isVerified) {
      return
    }
    setCurrentStep('questions')
  }

  const handleSubmitApplication = () => {
    // In a real app, this would submit to your API
    console.log('Submitting application with responses:', responses)
    setCurrentStep('submitted')
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
                      <p className="font-medium">Time Commitment</p>
                      <p className="text-small text-muted-foreground">{task.time_commitment}</p>
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
                <div>
                  <h3 className="font-semibold mb-3">Requirements</h3>
                  <ul className="space-y-2">
                    {task.requirements.map((req, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-small">{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Creator Info */}
                <div className="border-t pt-6">
                  <h3 className="font-semibold mb-3">Task Creator</h3>
                  <div className="flex items-center gap-4">
                    <div className="text-3xl">{task.creator.avatar}</div>
                    <div>
                      <p className="font-medium">{task.creator.name}</p>
                      <div className="flex items-center gap-2">
                        <Star className="h-4 w-4 text-yellow-500" />
                        <span className="text-small">{task.creator.rating}</span>
                        <span className="text-small text-muted-foreground">
                          • {task.creator.completedTasks} tasks completed
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
                  {task.questions.map((question, index) => (
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
                    Your application has been sent to {task.creator.name}. You'll be notified when they respond.
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

            {/* Real-Time Messaging - Phase 4A */}
            {(currentStep === 'submitted' || isAuthenticated) && (
              <TaskMessaging 
                taskId={id as string}
                taskTitle={task.title}
                isOpen={true}
                onOpenChange={() => {}}
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
                  <span className="font-semibold">${task.payout}</span>
                </div>
                <div className="flex justify-between">
                  <span>Platform Fee (10%)</span>
                  <span className="text-red-600">-${platformFee}</span>
                </div>
                <div className="flex justify-between pt-2 border-t font-semibold">
                  <span>Your Earnings</span>
                  <span className="text-green-600">${netEarnings}</span>
                </div>
                <p className="text-small text-muted-foreground">
                  Split between {task.max_participants} participants
                </p>
                <p className="text-small text-muted-foreground">
                  <span className="text-primary cursor-pointer" onClick={() => router.push('/subscribe')}>
                    Upgrade your plan
                  </span> to reduce platform fees
                </p>
              </CardContent>
            </Card>

            {/* Action Button */}
            <Card className="card-clean">
              <CardContent className="p-6">
                {!isVerified ? (
                  <div className="text-center">
                    <AlertCircle className="h-8 w-8 text-yellow-600 mx-auto mb-3" />
                    <p className="font-medium mb-2">Email verification required</p>
                    <p className="text-small text-muted-foreground mb-4">
                      You must verify your email to apply for tasks
                    </p>
                    <Button className="w-full button-outline" disabled>
                      Verify Email First
                    </Button>
                  </div>
                ) : availableSpots === 0 ? (
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
                ) : currentStep === 'submitted' ? (
                  <div className="text-center">
                    <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-3" />
                    <p className="font-medium mb-2">Application Submitted</p>
                    <p className="text-small text-muted-foreground">
                      Waiting for creator approval
                    </p>
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
                      Earn ${netEarnings} for this task
                    </p>
                    <Button 
                      onClick={handleApply}
                      className="w-full button-clean mb-2"
                    >
                      Apply Now
                    </Button>
                    
                    {/* AI Verification Demo */}
                    <Button 
                      variant="outline"
                      onClick={() => router.push(`/task/${id}/verification`)}
                      className="w-full button-outline"
                    >
                      <Camera className="h-4 w-4 mr-2" />
                      Submit Verification
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