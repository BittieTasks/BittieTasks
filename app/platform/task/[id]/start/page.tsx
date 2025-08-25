'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '../../../../../components/auth/SimpleAuthProvider'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import CleanNavigation from '@/components/CleanNavigation'
import CleanLayout from '@/components/CleanLayout'
import { useRouter, useParams } from 'next/navigation'
import { 
  Play, 
  CheckCircle, 
  Clock, 
  MapPin,
  Camera,
  Video,
  FileText,
  DollarSign,
  AlertCircle,
  Timer
} from 'lucide-react'

// Mock task data - in real app would fetch from API
const mockTaskData: { [key: string]: any } = {
  'walk-30min': {
    id: 'walk-30min',
    title: '30-Minute Neighborhood Walk',
    description: 'Complete a 30-minute walk in your neighborhood and document with photos',
    payout: 15,
    estimatedTime: '30 minutes',
    difficulty: 'Easy',
    verification: ['Photo', 'GPS Tracking', 'Time Tracking'],
    category: 'Health & Fitness',
    requirements: [
      'Take 2-3 photos during your walk',
      'GPS tracking must show 30+ minutes of movement',
      'Start and end at the same location',
      'Walk at a steady pace (2-4 mph average)'
    ],
    instructions: [
      'Put on comfortable walking shoes and dress for the weather',
      'Start GPS tracking before you begin walking',
      'Take a photo at your starting location',
      'Walk for at least 30 minutes in your neighborhood',
      'Take 1-2 photos during your walk (landmarks, scenery, etc.)',
      'Return to your starting location',
      'Take a final photo at your ending location',
      'Submit all photos and GPS data for verification'
    ],
    tips: [
      'Choose a safe, well-lit route if walking in the evening',
      'Stay hydrated, especially on warm days',
      'Consider listening to music or podcasts to make the time pass',
      'Walk at a comfortable pace - this isn\'t a race!'
    ]
  },
  'try-new-business': {
    id: 'try-new-business',
    title: 'Try a New Local Business',
    description: 'Visit a local business you\'ve never been to and write a review',
    payout: 20,
    estimatedTime: '45 minutes',
    difficulty: 'Easy',
    verification: ['Photo', 'Receipt', 'Social Media'],
    category: 'Community Support',
    requirements: [
      'Visit a business within 5 miles of your location',
      'Take photos of your experience',
      'Upload receipt of purchase',
      'Post review on Google or social media'
    ],
    instructions: [
      'Research local businesses you haven\'t visited before',
      'Choose one within 5 miles of your current location',
      'Visit the business and make a purchase',
      'Take photos of the storefront, interior, and your purchase',
      'Save your receipt',
      'Write a helpful, honest review (minimum 100 words)',
      'Post the review on Google, Yelp, or social media',
      'Submit photos, receipt, and link to your review'
    ],
    tips: [
      'Support small, locally-owned businesses when possible',
      'Be fair and constructive in your review',
      'Ask staff for recommendations to enhance your experience',
      'Take note of unique features or standout service'
    ]
  }
}

export default function PlatformTaskStartPage() {
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()
  const params = useParams()
  const taskId = params.id as string
  
  const [mounted, setMounted] = useState(false)
  const [hasStarted, setHasStarted] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [completedSteps, setCompletedSteps] = useState<boolean[]>([])

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted && !isAuthenticated) {
      router.push('/auth')
    }
  }, [mounted, isAuthenticated, router])

  if (!mounted) return null
  if (!isAuthenticated) return null

  const task = mockTaskData[taskId]
  if (!task) {
    return (
      <CleanLayout>
        <CleanNavigation />
        <div className="max-w-2xl mx-auto px-4 py-8">
          <Card>
            <CardContent className="p-8 text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Task Not Found</h2>
              <p className="text-muted-foreground mb-4">
                The requested task could not be found.
              </p>
              <Button onClick={() => router.push('/platform')}>
                Back to Platform Tasks
              </Button>
            </CardContent>
          </Card>
        </div>
      </CleanLayout>
    )
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'bg-green-100 text-green-800'
      case 'Medium': return 'bg-yellow-100 text-yellow-800'
      case 'Hard': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getVerificationIcon = (method: string) => {
    switch (method) {
      case 'Photo': return <Camera className="h-4 w-4" />
      case 'Video': return <Video className="h-4 w-4" />
      case 'GPS Tracking': return <MapPin className="h-4 w-4" />
      case 'Time Tracking': return <Clock className="h-4 w-4" />
      case 'Receipt': return <FileText className="h-4 w-4" />
      default: return <CheckCircle className="h-4 w-4" />
    }
  }

  const startTask = () => {
    setHasStarted(true)
    setCompletedSteps(new Array(task.instructions.length).fill(false))
    // In real app, would start tracking time/GPS here
  }

  const toggleStep = (index: number) => {
    const newCompletedSteps = [...completedSteps]
    newCompletedSteps[index] = !newCompletedSteps[index]
    setCompletedSteps(newCompletedSteps)
  }

  const proceedToVerification = () => {
    // Navigate to verification page with pre-filled task data
    router.push(`/task/${taskId}/verification?platform=true`)
  }

  const progress = completedSteps.length > 0 ? 
    Math.round((completedSteps.filter(Boolean).length / completedSteps.length) * 100) : 0

  const allStepsComplete = completedSteps.every(Boolean)

  return (
    <CleanLayout>
      <CleanNavigation />
      
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Task Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold">{task.title}</h1>
                <Badge className={getDifficultyColor(task.difficulty)}>
                  {task.difficulty}
                </Badge>
              </div>
              <p className="text-lg text-muted-foreground mb-4">{task.description}</p>
            </div>
            
            <Card className="ml-6">
              <CardContent className="p-4 text-center">
                <div className="flex items-center gap-1 text-green-600 text-xl font-bold">
                  <DollarSign className="h-5 w-5" />
                  {task.payout}
                </div>
                <p className="text-sm text-muted-foreground">Payout</p>
              </CardContent>
            </Card>
          </div>

          {/* Task Info */}
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>{task.estimatedTime}</span>
            </div>
            <div className="flex items-center gap-2">
              <span>Category: {task.category}</span>
            </div>
          </div>
        </div>

        {/* Verification Notice */}
        {/* Email verification notice removed - handled server-side */}

        {!hasStarted ? (
          /* Pre-Start Information */
          <div className="space-y-6">
            {/* Requirements */}
            <Card>
              <CardHeader>
                <CardTitle>Task Requirements</CardTitle>
                <CardDescription>
                  Make sure you can complete all of these before starting
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {task.requirements.map((req: string, index: number) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{req}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Verification Methods */}
            <Card>
              <CardHeader>
                <CardTitle>Verification Required</CardTitle>
                <CardDescription>
                  You'll need to provide these types of proof
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3">
                  {task.verification.map((method: string, index: number) => (
                    <Badge key={index} variant="outline" className="flex items-center gap-1">
                      {getVerificationIcon(method)}
                      {method}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Tips */}
            <Card>
              <CardHeader>
                <CardTitle>Tips for Success</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {task.tips.map((tip: string, index: number) => (
                    <li key={index} className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
                      <span className="text-sm">{tip}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Start Button */}
            <Card>
              <CardContent className="p-6">
                <div className="text-center space-y-4">
                  <h3 className="text-lg font-semibold">Ready to start?</h3>
                  <p className="text-muted-foreground">
                    Once you begin, you'll be guided through each step with a checklist.
                  </p>
                  <Button
                    size="lg"
                    onClick={startTask}
                    className="flex items-center gap-2"
                  >
                    <Play className="h-4 w-4" />
                    Start Task
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          /* Task Progress */
          <div className="space-y-6">
            {/* Progress Header */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Timer className="h-5 w-5" />
                  Task In Progress
                </CardTitle>
                <CardDescription>
                  Follow the steps below and check them off as you complete them
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">
                      Progress: {completedSteps.filter(Boolean).length} of {completedSteps.length} steps
                    </span>
                    <span className="text-sm text-muted-foreground">{progress}% complete</span>
                  </div>
                  <Progress value={progress} className="w-full" />
                </div>
              </CardContent>
            </Card>

            {/* Step Checklist */}
            <Card>
              <CardHeader>
                <CardTitle>Task Steps</CardTitle>
                <CardDescription>
                  Check off each step as you complete it
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {task.instructions.map((instruction: string, index: number) => (
                    <div
                      key={index}
                      className={`flex items-start gap-3 p-3 rounded-lg border transition-colors cursor-pointer ${
                        completedSteps[index] 
                          ? 'bg-green-50 border-green-200' 
                          : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                      }`}
                      onClick={() => toggleStep(index)}
                    >
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center mt-0.5 ${
                        completedSteps[index]
                          ? 'bg-green-600 border-green-600'
                          : 'border-gray-300'
                      }`}>
                        {completedSteps[index] && (
                          <CheckCircle className="h-3 w-3 text-white fill-current" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium">Step {index + 1}</span>
                        </div>
                        <p className={`text-sm ${completedSteps[index] ? 'text-green-800' : 'text-gray-700'}`}>
                          {instruction}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button
                    onClick={proceedToVerification}
                    disabled={!allStepsComplete}
                    className="flex-1"
                    size="lg"
                  >
                    {allStepsComplete ? (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Submit for Verification
                      </>
                    ) : (
                      'Complete all steps to continue'
                    )}
                  </Button>
                  <Button
                    onClick={() => router.push('/platform')}
                    variant="outline"
                    size="lg"
                  >
                    Cancel Task
                  </Button>
                </div>
                
                {allStepsComplete && (
                  <div className="mt-4 text-sm text-muted-foreground">
                    <p><strong>Next:</strong> Upload your verification materials (photos, receipts, etc.) and receive your payment!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </CleanLayout>
  )
}