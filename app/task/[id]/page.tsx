'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '../../../components/auth/AuthProvider'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Progress } from '@/components/ui/progress'
import Navigation from '@/components/Navigation'
import { 
  Clock, Users, MapPin, DollarSign, Star, Upload, 
  CheckCircle, ArrowLeft, AlertCircle, Camera, MessageSquare 
} from 'lucide-react'
import { allTasks, calculatePlatformFee, getNetEarnings, type TaskData } from '../../../lib/taskData'
import { useToast } from '../../../hooks/use-toast'

interface TaskApplication {
  id: string
  taskId: string
  userId: string
  status: 'pending' | 'approved' | 'in_progress' | 'submitted' | 'completed' | 'paid'
  applicationDate: string
  completionDate?: string
  photos: string[]
  responses: { question: string; answer: string }[]
  earnings: number
}

export default function TaskDetailPage() {
  const { id } = useParams()
  const { user, isAuthenticated, isVerified } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [mounted, setMounted] = useState(false)
  const [application, setApplication] = useState<TaskApplication | null>(null)
  const [currentStep, setCurrentStep] = useState<'apply' | 'questions' | 'work' | 'submit' | 'completed'>('apply')
  const [responses, setResponses] = useState<{ question: string; answer: string }[]>([])
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Check if user already has an application for this task
    const existingApplication = localStorage.getItem(`task_application_${id}`)
    if (existingApplication) {
      const app = JSON.parse(existingApplication)
      setApplication(app)
      setCurrentStep(app.status === 'completed' ? 'completed' : 
                    app.status === 'submitted' ? 'submit' : 
                    app.status === 'in_progress' ? 'work' : 
                    app.status === 'approved' ? 'questions' : 'apply')
      setResponses(app.responses || [])
      setUploadedPhotos(app.photos || [])
    }
  }, [id])

  if (!mounted) {
    return null
  }

  if (!isAuthenticated) {
    router.push('/auth')
    return null
  }

  if (!isVerified) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-green-100">
        <Navigation />
        <div className="flex items-center justify-center min-h-[80vh]">
          <Card className="bg-white/80 backdrop-blur-sm border-yellow-200 max-w-md mx-4">
            <CardContent className="p-8 text-center">
              <AlertCircle className="w-16 h-16 text-yellow-600 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-800 mb-2">Email Verification Required</h2>
              <p className="text-gray-600 mb-4">Please verify your email address to access earning opportunities.</p>
              <Button onClick={() => router.push('/auth')} className="bg-gradient-to-r from-green-600 to-blue-600">
                Complete Verification
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const task = allTasks.find(t => t.id === id)
  if (!task) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-green-100">
        <Navigation />
        <div className="flex items-center justify-center min-h-[80vh]">
          <Card className="bg-white/80 backdrop-blur-sm border-red-200 max-w-md mx-4">
            <CardContent className="p-8 text-center">
              <AlertCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-800 mb-2">Task Not Found</h2>
              <p className="text-gray-600 mb-4">This task may no longer be available.</p>
              <Button onClick={() => router.push('/marketplace')} variant="outline">
                Back to Marketplace
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const platformFee = calculatePlatformFee(task.payout, 'free') // Mock subscription
  const netEarnings = getNetEarnings(task.payout, 'free')

  // Dynamic questions based on task type and category
  const getTaskQuestions = (task: TaskData): string[] => {
    const baseQuestions = [
      'Why are you interested in this task?',
      'What relevant experience do you have?'
    ]

    if (task.type === 'shared') {
      return [
        ...baseQuestions,
        'How would you coordinate with other participants?',
        'What is your availability for this task?',
        'How would you ensure quality and reliability?'
      ]
    }

    if (task.type === 'self_care') {
      return [
        ...baseQuestions,
        'What are your wellness goals for this challenge?',
        'How will you track your progress?',
        'What support do you need to succeed?'
      ]
    }

    // Solo tasks
    return [
      ...baseQuestions,
      'How will you approach this task?',
      'What materials or resources do you have?',
      'When can you complete this task?'
    ]
  }

  const taskQuestions = getTaskQuestions(task)

  const handleApply = async () => {
    setLoading(true)
    
    // Simulate application processing
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    const newApplication: TaskApplication = {
      id: `app_${Date.now()}`,
      taskId: task.id,
      userId: user?.id || 'user',
      status: 'approved', // Auto-approve for demo
      applicationDate: new Date().toISOString(),
      photos: [],
      responses: [],
      earnings: netEarnings
    }

    setApplication(newApplication)
    setCurrentStep('questions')
    setResponses(taskQuestions.map(q => ({ question: q, answer: '' })))
    
    localStorage.setItem(`task_application_${id}`, JSON.stringify(newApplication))
    
    toast({
      title: 'Application Approved!',
      description: 'You can now start working on this task.',
    })
    
    setLoading(false)
  }

  const handleQuestionSubmit = async () => {
    if (responses.some(r => !r.answer.trim())) {
      toast({
        title: 'Incomplete Responses',
        description: 'Please answer all questions before proceeding.',
        variant: 'destructive'
      })
      return
    }

    setLoading(true)
    
    const updatedApplication = {
      ...application!,
      status: 'in_progress' as const,
      responses
    }
    
    setApplication(updatedApplication)
    setCurrentStep('work')
    localStorage.setItem(`task_application_${id}`, JSON.stringify(updatedApplication))
    
    toast({
      title: 'Responses Submitted!',
      description: 'You can now begin working on the task.',
    })
    
    setLoading(false)
  }

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files) {
      // Simulate photo upload
      const newPhotos = Array.from(files).map(file => URL.createObjectURL(file))
      setUploadedPhotos(prev => [...prev, ...newPhotos])
      
      toast({
        title: 'Photos Uploaded',
        description: `${files.length} photo(s) added to your submission.`,
      })
    }
  }

  const handleSubmitWork = async () => {
    if (uploadedPhotos.length === 0) {
      toast({
        title: 'Photos Required',
        description: 'Please upload at least one photo of your completed work.',
        variant: 'destructive'
      })
      return
    }

    setLoading(true)
    
    // Simulate submission processing
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    const updatedApplication = {
      ...application!,
      status: 'completed' as const,
      completionDate: new Date().toISOString(),
      photos: uploadedPhotos
    }
    
    setApplication(updatedApplication)
    setCurrentStep('completed')
    localStorage.setItem(`task_application_${id}`, JSON.stringify(updatedApplication))
    
    // Simulate payment processing
    setTimeout(() => {
      toast({
        title: 'Payment Processed!',
        description: `$${netEarnings.toFixed(2)} has been added to your earnings.`,
      })
    }, 3000)
    
    setLoading(false)
  }

  const getStepProgress = () => {
    switch (currentStep) {
      case 'apply': return 0
      case 'questions': return 25
      case 'work': return 50
      case 'submit': return 75
      case 'completed': return 100
      default: return 0
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-green-100">
      <Navigation />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Back Button */}
        <Button 
          variant="outline" 
          onClick={() => router.push('/marketplace')}
          className="mb-6 border-green-200 text-green-700 hover:bg-green-50"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Marketplace
        </Button>

        {/* Progress Bar */}
        <Card className="bg-white/70 backdrop-blur-sm border-green-200 mb-6">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Task Progress</span>
              <span className="text-sm font-medium text-green-600">{getStepProgress()}%</span>
            </div>
            <Progress value={getStepProgress()} className="h-2" />
            <div className="flex justify-between text-xs text-gray-500 mt-2">
              <span>Apply</span>
              <span>Questions</span>
              <span>Work</span>
              <span>Complete</span>
            </div>
          </CardContent>
        </Card>

        {/* Task Details */}
        <Card className="bg-white/80 backdrop-blur-sm border-green-200 mb-6">
          <CardHeader>
            <div className="flex items-start justify-between mb-4">
              <div className="flex space-x-2">
                <Badge className={`${task.type === 'solo' ? 'bg-blue-500/20 text-blue-400 border-blue-500/20' :
                                  task.type === 'shared' ? 'bg-green-500/20 text-green-400 border-green-500/20' :
                                  'bg-purple-500/20 text-purple-400 border-purple-500/20'}`} variant="outline">
                  {task.type === 'solo' ? 'Solo' : task.type === 'shared' ? 'Community' : 'Self-Care'}
                </Badge>
                {task.is_sponsored && (
                  <Badge className="bg-yellow-500/20 text-yellow-600 border-yellow-500/20" variant="outline">
                    <Star className="w-3 h-3 mr-1" />
                    Sponsored
                  </Badge>
                )}
              </div>
            </div>
            
            <CardTitle className="text-2xl text-gray-800 mb-2">{task.title}</CardTitle>
            <CardDescription className="text-gray-600 text-base leading-relaxed">
              {task.description}
            </CardDescription>
          </CardHeader>

          <CardContent>
            {/* Earnings Display */}
            <div className="bg-green-50 rounded-lg p-4 border border-green-200 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <DollarSign className="w-6 h-6 text-green-600" />
                  <div>
                    <div className="text-2xl font-bold text-green-700">${netEarnings.toFixed(2)}</div>
                    <div className="text-sm text-gray-600">Your net earnings</div>
                  </div>
                </div>
                <div className="text-right text-sm text-gray-500">
                  <div>${task.payout.toFixed(2)} gross</div>
                  <div>-${platformFee.toFixed(2)} platform fee</div>
                </div>
              </div>
            </div>

            {/* Task Details Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-600">{task.time_estimate}</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-600">
                  {task.current_participants}/{task.max_participants} joined
                </span>
              </div>
              
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-600 capitalize">{task.location_type}</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <Badge className={`${task.difficulty === 'easy' ? 'bg-green-500/20 text-green-400' :
                                  task.difficulty === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                                  'bg-red-500/20 text-red-400'}`} variant="outline">
                  {task.difficulty}
                </Badge>
              </div>
            </div>

            {/* Materials Needed */}
            {task.materials_needed && (
              <div className="mb-6">
                <h4 className="font-semibold text-gray-800 mb-2">Materials Needed:</h4>
                <div className="flex flex-wrap gap-2">
                  {task.materials_needed.map((material, index) => (
                    <Badge key={index} variant="outline" className="bg-gray-50">
                      {material}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Task Flow Steps */}
        {currentStep === 'apply' && (
          <Card className="bg-white/80 backdrop-blur-sm border-green-200">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MessageSquare className="w-5 h-5" />
                <span>Apply for This Task</span>
              </CardTitle>
              <CardDescription>
                Join this earning opportunity and start making money from your daily activities.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <h5 className="font-semibold text-blue-800 mb-2">What happens next:</h5>
                  <ol className="list-decimal list-inside space-y-1 text-sm text-blue-700">
                    <li>Answer a few questions about your approach</li>
                    <li>Complete the task according to guidelines</li>
                    <li>Upload photos of your completed work</li>
                    <li>Receive payment within 24 hours</li>
                  </ol>
                </div>
                
                <Button 
                  onClick={handleApply} 
                  disabled={loading || task.current_participants >= task.max_participants}
                  className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white"
                >
                  {loading ? 'Processing...' : 'Apply for This Task'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {currentStep === 'questions' && (
          <Card className="bg-white/80 backdrop-blur-sm border-green-200">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MessageSquare className="w-5 h-5" />
                <span>Application Questions</span>
              </CardTitle>
              <CardDescription>
                Please provide detailed answers to help us understand your approach.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {taskQuestions.map((question, index) => (
                  <div key={index}>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {index + 1}. {question}
                    </label>
                    <Textarea
                      value={responses[index]?.answer || ''}
                      onChange={(e) => {
                        const newResponses = [...responses]
                        newResponses[index] = { question, answer: e.target.value }
                        setResponses(newResponses)
                      }}
                      placeholder="Please provide a detailed answer..."
                      className="min-h-[100px]"
                    />
                  </div>
                ))}
                
                <Button 
                  onClick={handleQuestionSubmit} 
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white"
                >
                  {loading ? 'Submitting...' : 'Submit Answers & Start Task'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {currentStep === 'work' && (
          <Card className="bg-white/80 backdrop-blur-sm border-green-200">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Camera className="w-5 h-5" />
                <span>Complete Your Task</span>
              </CardTitle>
              <CardDescription>
                Follow the task guidelines and upload photos of your completed work.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <h5 className="font-semibold text-green-800 mb-2">Task Guidelines:</h5>
                  <ul className="list-disc list-inside space-y-1 text-sm text-green-700">
                    <li>Follow all safety guidelines and instructions</li>
                    <li>Take clear, well-lit photos of your work</li>
                    <li>Include before and after photos when applicable</li>
                    <li>Document any challenges or creative solutions</li>
                  </ul>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Upload Progress Photos
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <Camera className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">Upload photos of your completed work</p>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                      id="photo-upload"
                    />
                    <Button asChild variant="outline">
                      <label htmlFor="photo-upload" className="cursor-pointer">
                        <Upload className="w-4 h-4 mr-2" />
                        Choose Photos
                      </label>
                    </Button>
                  </div>
                  
                  {uploadedPhotos.length > 0 && (
                    <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                      {uploadedPhotos.map((photo, index) => (
                        <img
                          key={index}
                          src={photo}
                          alt={`Upload ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg border border-gray-200"
                        />
                      ))}
                    </div>
                  )}
                </div>
                
                <Button 
                  onClick={handleSubmitWork} 
                  disabled={loading || uploadedPhotos.length === 0}
                  className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white"
                >
                  {loading ? 'Processing Submission...' : 'Submit Completed Work'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {currentStep === 'completed' && (
          <Card className="bg-white/80 backdrop-blur-sm border-green-200">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-green-700">
                <CheckCircle className="w-6 h-6" />
                <span>Task Completed!</span>
              </CardTitle>
              <CardDescription>
                Congratulations! Your work has been submitted and payment is being processed.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="bg-green-50 p-6 rounded-lg border border-green-200 text-center">
                  <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-green-800 mb-2">Payment Processing</h3>
                  <p className="text-green-700 mb-4">
                    Your earnings of <span className="font-bold">${netEarnings.toFixed(2)}</span> will be added to your account within 24 hours.
                  </p>
                  <div className="text-sm text-green-600">
                    <p>✓ Work submitted and verified</p>
                    <p>✓ Quality standards met</p>
                    <p>✓ Payment approved</p>
                  </div>
                </div>

                {application?.photos && application.photos.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3">Your Submitted Work:</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {application.photos.map((photo, index) => (
                        <img
                          key={index}
                          src={photo}
                          alt={`Completed work ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg border border-gray-200"
                        />
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex space-x-4">
                  <Button 
                    onClick={() => router.push('/marketplace')}
                    className="flex-1 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white"
                  >
                    Find More Tasks
                  </Button>
                  <Button 
                    onClick={() => router.push('/earnings')}
                    variant="outline"
                    className="flex-1 border-green-300 text-green-700 hover:bg-green-50"
                  >
                    View Earnings
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}