'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  MapPin, 
  Clock, 
  DollarSign, 
  User, 
  Users, 
  Building2, 
  ArrowLeftRight, 
  Star, 
  ArrowRight,
  CheckCircle,
  Shield,
  Zap
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import Navigation from '@/components/shared/Navigation'

interface SampleTask {
  id: string
  title: string
  description: string
  price?: number
  location: string
  timeEstimate: string
  category: string
  type: 'solo' | 'community' | 'corporate' | 'barter'
  difficulty: 'Easy' | 'Medium' | 'Hard'
  sponsor?: string
  participants?: number
  maxParticipants?: number
  tradeOffer?: string
  verificationRequired?: boolean
  platformFunded?: boolean
}

const sampleTasks: SampleTask[] = [
  // Solo Tasks (Platform Funded)
  {
    id: 'solo-1',
    title: 'Grocery Shopping Assistant',
    description: 'Help elderly neighbor with weekly grocery shopping. Pick up items from provided list and deliver safely.',
    price: 25,
    location: 'Local Grocery Store',
    timeEstimate: '2 hours',
    category: 'Shopping',
    type: 'solo',
    difficulty: 'Easy',
    verificationRequired: true,
    platformFunded: true
  },
  {
    id: 'solo-2', 
    title: 'Garden Cleanup Service',
    description: 'Remove weeds, rake leaves, and basic lawn maintenance for small residential yard.',
    price: 40,
    location: 'Residential Home',
    timeEstimate: '3 hours',
    category: 'Yard Work',
    type: 'solo',
    difficulty: 'Medium',
    verificationRequired: true,
    platformFunded: true
  },
  
  // Community Tasks (Peer-to-Peer)
  {
    id: 'community-1',
    title: 'Neighborhood Watch Setup',
    description: 'Organize and coordinate a community safety initiative. Work with neighbors to establish patrol schedule.',
    price: 75,
    location: 'Pine Street Area',
    timeEstimate: '4 hours',
    category: 'Community Safety',
    type: 'community',
    difficulty: 'Medium',
    participants: 3,
    maxParticipants: 6
  },
  {
    id: 'community-2',
    title: 'Local Food Drive Coordination',
    description: 'Help organize collection and distribution of donations for local food bank with community volunteers.',
    price: 50,
    location: 'Community Center',
    timeEstimate: '5 hours',
    category: 'Volunteer Work',
    type: 'community',
    difficulty: 'Easy',
    participants: 8,
    maxParticipants: 12
  },
  
  // Corporate Tasks (High-Value Partnerships)
  {
    id: 'corporate-1',
    title: 'Product Review & Social Media Post',
    description: 'Try our new eco-friendly cleaning products and share an honest review on your social media platforms.',
    price: 125,
    location: 'Remote/Home',
    timeEstimate: '2 hours',
    category: 'Marketing',
    type: 'corporate',
    difficulty: 'Easy',
    sponsor: 'GreenClean Co.'
  },
  {
    id: 'corporate-2',
    title: 'Local Business Photography',
    description: 'Take professional-quality photos of storefront and products for marketing materials and website.',
    price: 200,
    location: 'Downtown Bakery',
    timeEstimate: '3 hours',
    category: 'Photography',
    type: 'corporate',
    difficulty: 'Medium',
    sponsor: 'Artisan Bakery'
  },
  
  // Barter Tasks (Value Exchange)
  {
    id: 'barter-1',
    title: 'Web Design for Piano Lessons',
    description: 'Create a simple website for my music teaching business in exchange for 6 months of piano lessons.',
    location: 'Remote + Music Studio',
    timeEstimate: '15 hours total',
    category: 'Skill Exchange',
    type: 'barter',
    difficulty: 'Medium',
    tradeOffer: '6 months piano lessons'
  },
  {
    id: 'barter-2',
    title: 'Garden Fresh Vegetables for Tutoring',
    description: 'Trade fresh organic vegetables from my garden for math tutoring help for my high school daughter.',
    location: 'Home/Online',
    timeEstimate: '2 hours/week',
    category: 'Education',
    type: 'barter',
    difficulty: 'Easy',
    tradeOffer: 'Weekly fresh vegetables'
  }
]

export default function SampleTasksPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const router = useRouter()

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'solo': return 'bg-green-100 text-green-800 border-green-200'
      case 'community': return 'bg-blue-100 text-blue-800 border-blue-200'  
      case 'corporate': return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'barter': return 'bg-orange-100 text-orange-800 border-orange-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'solo': return <User className="w-4 h-4" />
      case 'community': return <Users className="w-4 h-4" />
      case 'corporate': return <Building2 className="w-4 h-4" />
      case 'barter': return <ArrowLeftRight className="w-4 h-4" />
      default: return <User className="w-4 h-4" />
    }
  }

  const getFeeInfo = (type: string) => {
    switch (type) {
      case 'solo': return { fee: '3%', description: 'Processing fee' }
      case 'community': return { fee: '7%', description: 'Platform fee' }
      case 'corporate': return { fee: '15%', description: 'Partnership fee' }
      case 'barter': return { fee: '0%', description: 'No fees' }
      default: return { fee: '0%', description: 'No fees' }
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'bg-green-100 text-green-800'
      case 'Medium': return 'bg-yellow-100 text-yellow-800'
      case 'Hard': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const filteredTasks = selectedCategory === 'all' 
    ? sampleTasks 
    : sampleTasks.filter(task => task.type === selectedCategory)

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-cyan-100">
      <Navigation showBackButton={true} backUrl="/" title="Sample Tasks" />
      
      <div className="max-w-7xl mx-auto p-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Explore Task Opportunities
          </h1>
          <p className="text-xl text-gray-600 max-w-4xl mx-auto mb-8">
            Discover the variety of tasks available on BittieTasks. From quick solo tasks to community projects, 
            corporate partnerships, and value-based exchanges - there's something for everyone.
          </p>
          
          {/* Category Filters */}
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <Button
              variant={selectedCategory === 'all' ? 'default' : 'outline'}
              onClick={() => setSelectedCategory('all')}
              className={selectedCategory === 'all' ? 'bg-teal-600 hover:bg-teal-700' : ''}
              data-testid="filter-all-tasks"
            >
              All Tasks
            </Button>
            <Button
              variant={selectedCategory === 'solo' ? 'default' : 'outline'}
              onClick={() => setSelectedCategory('solo')}
              className={selectedCategory === 'solo' ? 'bg-green-600 hover:bg-green-700' : ''}
              data-testid="filter-solo-tasks"
            >
              <User className="w-4 h-4 mr-2" />
              Solo Tasks
            </Button>
            <Button
              variant={selectedCategory === 'community' ? 'default' : 'outline'}
              onClick={() => setSelectedCategory('community')}
              className={selectedCategory === 'community' ? 'bg-blue-600 hover:bg-blue-700' : ''}
              data-testid="filter-community-tasks"
            >
              <Users className="w-4 h-4 mr-2" />
              Community
            </Button>
            <Button
              variant={selectedCategory === 'corporate' ? 'default' : 'outline'}
              onClick={() => setSelectedCategory('corporate')}
              className={selectedCategory === 'corporate' ? 'bg-purple-600 hover:bg-purple-700' : ''}
              data-testid="filter-corporate-tasks"
            >
              <Building2 className="w-4 h-4 mr-2" />
              Corporate
            </Button>
            <Button
              variant={selectedCategory === 'barter' ? 'default' : 'outline'}
              onClick={() => setSelectedCategory('barter')}
              className={selectedCategory === 'barter' ? 'bg-orange-600 hover:bg-orange-700' : ''}
              data-testid="filter-barter-tasks"
            >
              <ArrowLeftRight className="w-4 h-4 mr-2" />
              Barter
            </Button>
          </div>
        </div>

        {/* Task Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-12">
          {filteredTasks.map((task) => {
            const feeInfo = getFeeInfo(task.type)
            
            return (
              <Card key={task.id} className="hover:shadow-lg transition-all duration-200 border-0 shadow-md">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between mb-2">
                    <Badge className={`${getTypeColor(task.type)} flex items-center gap-1`}>
                      {getTypeIcon(task.type)}
                      {task.type.charAt(0).toUpperCase() + task.type.slice(1)}
                    </Badge>
                    <Badge className={`${getDifficultyColor(task.difficulty)} border-0`}>
                      {task.difficulty}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg leading-tight">{task.title}</CardTitle>
                  {task.sponsor && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Building2 className="w-4 h-4" />
                      Sponsored by {task.sponsor}
                    </div>
                  )}
                </CardHeader>
                
                <CardContent className="pt-0">
                  <CardDescription className="text-sm mb-4 line-clamp-3">
                    {task.description}
                  </CardDescription>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="w-4 h-4" />
                      {task.location}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock className="w-4 h-4" />
                      {task.timeEstimate}
                    </div>
                    
                    {task.price && (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm font-medium text-green-700">
                          <DollarSign className="w-4 h-4" />
                          ${task.price}
                        </div>
                        <div className="text-xs text-gray-500">
                          {feeInfo.fee} {feeInfo.description}
                        </div>
                      </div>
                    )}
                    
                    {task.tradeOffer && (
                      <div className="flex items-center gap-2 text-sm font-medium text-orange-700">
                        <ArrowLeftRight className="w-4 h-4" />
                        Trade: {task.tradeOffer}
                      </div>
                    )}
                    
                    {task.participants && (
                      <div className="flex items-center gap-2 text-sm text-blue-600">
                        <Users className="w-4 h-4" />
                        {task.participants}/{task.maxParticipants} participants
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    {task.verificationRequired && (
                      <div className="flex items-center gap-1">
                        <Shield className="w-3 h-3" />
                        AI Verified
                      </div>
                    )}
                    {task.platformFunded && (
                      <div className="flex items-center gap-1">
                        <Zap className="w-3 h-3" />
                        Platform Funded
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Call to Action */}
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Ready to Start Earning?
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Join thousands of neighbors who are already earning money and building stronger communities 
              through BittieTasks. Sign up now and start applying for tasks that match your skills and schedule.
            </p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="text-center">
                <div className="text-2xl font-bold text-teal-600">2,847</div>
                <div className="text-sm text-gray-600">Tasks Completed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-teal-600">$127K+</div>
                <div className="text-sm text-gray-600">Paid to Users</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-teal-600">96%</div>
                <div className="text-sm text-gray-600">Success Rate</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-teal-600">18hr</div>
                <div className="text-sm text-gray-600">Avg Completion</div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-teal-600 hover:bg-teal-700 text-white px-8 py-4 text-lg"
                onClick={() => router.push('/auth?mode=signup')}
                data-testid="button-sign-up-now"
              >
                Sign Up Now
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="px-8 py-4 text-lg border-teal-600 text-teal-600 hover:bg-teal-50"
                onClick={() => router.push('/auth?mode=signin')}
                data-testid="button-sign-in"
              >
                Already have an account? Sign In
              </Button>
            </div>
            
            <div className="flex items-center justify-center gap-6 mt-8 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <CheckCircle className="w-4 h-4 text-green-600" />
                Email verification required
              </div>
              <div className="flex items-center gap-1">
                <CheckCircle className="w-4 h-4 text-green-600" />
                Secure payments
              </div>
              <div className="flex items-center gap-1">
                <CheckCircle className="w-4 h-4 text-green-600" />
                AI-powered verification
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}