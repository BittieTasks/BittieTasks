'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '../../components/auth/SimpleAuthProvider'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import CleanNavigation from '@/components/CleanNavigation'
import CleanLayout from '@/components/CleanLayout'
import { useRouter } from 'next/navigation'
import { 
  Coins, 
  MapPin, 
  Clock, 
  Camera, 
  Video,
  Target,
  Award,
  CheckCircle,
  Timer,
  DollarSign,
  TrendingUp
} from 'lucide-react'

// Platform-funded task templates
const platformTasks = [
  {
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
      'Start and end at the same location'
    ]
  },
  {
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
    ]
  },
  {
    id: 'community-cleanup',
    title: 'Community Cleanup Activity',
    description: 'Spend 1 hour cleaning up a public area in your neighborhood',
    payout: 25,
    estimatedTime: '60 minutes',
    difficulty: 'Medium',
    verification: ['Photo', 'GPS Tracking', 'Time Tracking'],
    category: 'Community Support',
    requirements: [
      'Before and after photos required',
      'Minimum 1 hour of activity',
      'GPS tracking of cleanup area',
      'Use proper safety equipment'
    ]
  },
  {
    id: 'learn-something-new',
    title: 'Learn Something New',
    description: 'Complete an online course or tutorial and share what you learned',
    payout: 30,
    estimatedTime: '90 minutes',
    difficulty: 'Medium',
    verification: ['Video', 'Social Media', 'Certificate'],
    category: 'Education',
    requirements: [
      'Complete a course from approved platforms',
      'Record 2-minute summary video',
      'Share completion certificate',
      'Post about your learning experience'
    ]
  },
  {
    id: 'home-organization',
    title: 'Home Organization Project',
    description: 'Organize a room or area in your house with before/after photos',
    payout: 20,
    estimatedTime: '45 minutes',
    difficulty: 'Easy',
    verification: ['Photo'],
    category: 'Home Organization',
    requirements: [
      'Clear before photos of the area',
      'Detailed after photos showing organization',
      'Brief description of organizing method used'
    ]
  },
  {
    id: 'fitness-challenge',
    title: 'Complete a Fitness Challenge',
    description: 'Complete a 45-minute workout routine and track your progress',
    payout: 18,
    estimatedTime: '45 minutes',
    difficulty: 'Medium',
    verification: ['Video', 'Time Tracking', 'Photo'],
    category: 'Health & Fitness',
    requirements: [
      'Video proof of workout completion',
      'Heart rate tracking if available',
      'Before and after photos',
      'Time tracking for full duration'
    ]
  }
]

export default function PlatformTasksPage() {
  const { user, isAuthenticated, loading } = useAuth()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('All')

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted && !loading && !isAuthenticated) {
      router.push('/auth')
    }
  }, [mounted, loading, isAuthenticated, router])

  if (!mounted) return null
  if (!isAuthenticated) return null

  const categories = ['All', ...Array.from(new Set(platformTasks.map(task => task.category)))]
  
  const filteredTasks = selectedCategory === 'All' 
    ? platformTasks 
    : platformTasks.filter(task => task.category === selectedCategory)

  const totalEarnings = filteredTasks.reduce((sum, task) => sum + task.payout, 0)

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
      case 'Photo': return <Camera className="h-3 w-3" />
      case 'Video': return <Video className="h-3 w-3" />
      case 'GPS Tracking': return <MapPin className="h-3 w-3" />
      case 'Time Tracking': return <Clock className="h-3 w-3" />
      default: return <CheckCircle className="h-3 w-3" />
    }
  }

  const startTask = (taskId: string) => {
    // Navigate to task verification page
    router.push(`/platform/task/${taskId}/start`)
  }

  return (
    <CleanLayout>
      <CleanNavigation />
      
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Coins className="h-8 w-8 text-green-600" />
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Platform-Funded Tasks</h1>
          </div>
          <p className="text-lg text-gray-600 mb-4">
            Complete tasks and earn money instantly. All tasks are funded directly by BittieTasks!
          </p>
          
          {/* Key Benefits */}
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle className="h-4 w-4" />
              <span>Instant payment upon completion</span>
            </div>
            <div className="flex items-center gap-2 text-blue-600">
              <Timer className="h-4 w-4" />
              <span>Auto-verification for faster approval</span>
            </div>
            <div className="flex items-center gap-2 text-purple-600">
              <TrendingUp className="h-4 w-4" />
              <span>No waiting for other users</span>
            </div>
          </div>
        </div>

        {/* Platform Notice */}
        <Card className="mb-6 border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Award className="h-5 w-5 text-blue-600" />
              <p className="text-blue-800">
                <strong>Platform-funded tasks</strong> are paid directly by BittieTasks for immediate earnings.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{filteredTasks.length}</div>
              <div className="text-sm text-muted-foreground">Available Tasks</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">${totalEarnings}</div>
              <div className="text-sm text-muted-foreground">Total Potential</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">
                ${Math.round(totalEarnings / filteredTasks.length)}
              </div>
              <div className="text-sm text-muted-foreground">Average Payout</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-orange-600">~5hrs</div>
              <div className="text-sm text-muted-foreground">Total Time</div>
            </CardContent>
          </Card>
        </div>

        {/* Category Filter */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-2">
              {categories.map(category => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Task Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTasks.map((task) => (
            <Card key={task.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between mb-2">
                  <Badge className={getDifficultyColor(task.difficulty)}>
                    {task.difficulty}
                  </Badge>
                  <div className="flex items-center gap-1 text-green-600 font-semibold">
                    <DollarSign className="h-4 w-4" />
                    {task.payout}
                  </div>
                </div>
                <CardTitle className="text-lg">{task.title}</CardTitle>
                <CardDescription className="text-sm">
                  {task.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Task Details */}
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{task.estimatedTime}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-muted-foreground" />
                    <span>{task.category}</span>
                  </div>
                </div>

                {/* Verification Methods */}
                <div>
                  <p className="text-sm font-medium mb-2">Verification Required:</p>
                  <div className="flex flex-wrap gap-1">
                    {task.verification.map((method, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        <span className="mr-1">{getVerificationIcon(method)}</span>
                        {method}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Requirements Preview */}
                <div>
                  <p className="text-sm font-medium mb-1">Key Requirements:</p>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    {task.requirements.slice(0, 2).map((req, index) => (
                      <li key={index}>• {req}</li>
                    ))}
                    {task.requirements.length > 2 && (
                      <li>• +{task.requirements.length - 2} more...</li>
                    )}
                  </ul>
                </div>

                {/* Action Button */}
                <Button
                  className="w-full"
                  onClick={() => startTask(task.id)}
                >
                  Start Task
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* How It Works */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>How Platform-Funded Tasks Work</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
              <div className="space-y-2">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                  <span className="text-blue-600 font-semibold">1</span>
                </div>
                <h4 className="font-medium">Choose a Task</h4>
                <p className="text-sm text-muted-foreground">
                  Select from available platform-funded activities
                </p>
              </div>
              
              <div className="space-y-2">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <span className="text-green-600 font-semibold">2</span>
                </div>
                <h4 className="font-medium">Complete & Document</h4>
                <p className="text-sm text-muted-foreground">
                  Follow requirements and submit verification
                </p>
              </div>
              
              <div className="space-y-2">
                <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center mx-auto">
                  <span className="text-yellow-600 font-semibold">3</span>
                </div>
                <h4 className="font-medium">Auto-Verification</h4>
                <p className="text-sm text-muted-foreground">
                  Most submissions approved within minutes
                </p>
              </div>
              
              <div className="space-y-2">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
                  <span className="text-purple-600 font-semibold">4</span>
                </div>
                <h4 className="font-medium">Get Paid</h4>
                <p className="text-sm text-muted-foreground">
                  Instant payment to your account
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </CleanLayout>
  )
}