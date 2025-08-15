'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { MapPin, Clock, ArrowLeftRight, User, Heart, Handshake, ArrowLeft, Menu } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useRouter } from 'next/navigation'
import TaskApplicationModal from '@/components/TaskApplicationModal'

interface BarterTask {
  id: string
  title: string
  description: string
  offering: string
  seeking: string
  location: string
  timeEstimate: string
  category: string
  postedBy: string
  postedAt: string
  difficulty: 'Easy' | 'Medium' | 'Hard'
  tradeType: 'Service for Service' | 'Item for Service' | 'Service for Item' | 'Item for Item'
  tags: string[]
}

const barterTasks: BarterTask[] = [
  {
    id: 'barter-1',
    title: 'Piano Lessons for Garden Help',
    description: 'I\'m a certified piano teacher willing to give weekly 1-hour lessons in exchange for help maintaining my vegetable garden.',
    offering: '4 piano lessons (1 hour each)',
    seeking: 'Garden weeding & watering (4 visits)',
    location: 'Maple Street',
    timeEstimate: '1 month commitment',
    category: 'Education & Gardening',
    postedBy: 'Maria T.',
    postedAt: '1 day ago',
    difficulty: 'Medium',
    tradeType: 'Service for Service',
    tags: ['music', 'education', 'gardening', 'ongoing']
  },
  {
    id: 'barter-2',
    title: 'Homemade Bread for Dog Walking',
    description: 'I bake fresh artisan bread weekly and would love to trade loaves for someone to walk my elderly dog twice a week.',
    offering: '2 fresh bread loaves weekly',
    seeking: 'Dog walking (2x per week)',
    location: 'Oak Ridge',
    timeEstimate: '30 minutes per walk',
    category: 'Food & Pet Care',
    postedBy: 'Tom R.',
    postedAt: '3 hours ago',
    difficulty: 'Easy',
    tradeType: 'Item for Service',
    tags: ['food', 'baking', 'pets', 'weekly']
  },
  {
    id: 'barter-3',
    title: 'Graphic Design for House Cleaning',
    description: 'Professional graphic designer offering logo design and branding package in exchange for deep cleaning of my 2-bedroom apartment.',
    offering: 'Custom logo + branding package',
    seeking: 'Deep apartment cleaning',
    location: 'Downtown Loft',
    timeEstimate: '5 hours cleaning',
    category: 'Design & Cleaning',
    postedBy: 'Alex K.',
    postedAt: '2 days ago',
    difficulty: 'Hard',
    tradeType: 'Service for Service',
    tags: ['design', 'branding', 'cleaning', 'professional']
  },
  {
    id: 'barter-4',
    title: 'Fresh Vegetables for Handyman Work',
    description: 'My garden is overflowing! I have fresh tomatoes, cucumbers, and herbs to trade for help fixing my fence and shed door.',
    offering: '20 lbs fresh organic vegetables',
    seeking: 'Fence repair & shed door fix',
    location: 'Suburban Home',
    timeEstimate: '3-4 hours work',
    category: 'Food & Maintenance',
    postedBy: 'Linda S.',
    postedAt: '5 hours ago',
    difficulty: 'Medium',
    tradeType: 'Item for Service',
    tags: ['organic', 'vegetables', 'handyman', 'repair']
  },
  {
    id: 'barter-5',
    title: 'Web Development for Photography Session',
    description: 'I\'ll build you a professional website with hosting setup in exchange for a family portrait session and edited photos.',
    offering: 'Custom website + 1 year hosting',
    seeking: 'Family photo session (2 hours)',
    location: 'Park or Studio',
    timeEstimate: '2 hours photo session',
    category: 'Technology & Photography',
    postedBy: 'Sarah M.',
    postedAt: '1 week ago',
    difficulty: 'Hard',
    tradeType: 'Service for Service',
    tags: ['web-development', 'photography', 'family', 'professional']
  },
  {
    id: 'barter-6',
    title: 'Yoga Classes for Meal Prep Service',
    description: 'Certified yoga instructor offering private sessions in exchange for weekly healthy meal prep for busy schedule.',
    offering: '4 private yoga sessions',
    seeking: 'Weekly meal prep (4 weeks)',
    location: 'Home or Studio',
    timeEstimate: '1 hour per session',
    category: 'Wellness & Food',
    postedBy: 'Emma C.',
    postedAt: '4 days ago',
    difficulty: 'Medium',
    tradeType: 'Service for Service',
    tags: ['yoga', 'wellness', 'meal-prep', 'health']
  }
]

export default function BarterPage() {
  const [selectedTask, setSelectedTask] = useState<BarterTask | null>(null)
  const [showApplicationModal, setShowApplicationModal] = useState(false)
  const router = useRouter()

  const handleApplyClick = (task: BarterTask) => {
    setSelectedTask(task)
    setShowApplicationModal(true)
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'bg-green-100 text-green-800 border-green-200'
      case 'Medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'Hard': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getTradeTypeColor = (tradeType: string) => {
    switch (tradeType) {
      case 'Service for Service': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'Item for Service': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'Service for Item': return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'Item for Item': return 'bg-pink-100 text-pink-800 border-pink-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Navigation Header */}
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            onClick={() => router.push('/dashboard')}
            className="flex items-center gap-2 text-gray-700 hover:text-orange-600"
          >
            <ArrowLeft size={20} />
            Back to Dashboard
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <Menu size={16} />
                Browse Tasks
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => router.push('/solo')}>
                Solo Tasks
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push('/community')}>
                Community Tasks
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push('/sponsors')}>
                Corporate Tasks
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push('/')}>
                Home
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Barter Exchange
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Trade skills, services, and items without money! Connect with neighbors for mutually beneficial exchanges. 
            No platform fees - just community-driven value trading.
          </p>
          <div className="mt-6 space-x-4">
            <Button 
              size="lg" 
              className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-3"
              data-testid="button-create-barter-trade"
            >
              Create Barter Trade
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="border-orange-600 text-orange-600 hover:bg-orange-50 px-8 py-3"
              data-testid="button-chat-traders"
            >
              Chat with Traders
            </Button>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{barterTasks.length}</div>
              <div className="text-sm text-gray-600">Active Trades</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">4</div>
              <div className="text-sm text-gray-600">Trade Types</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">100%</div>
              <div className="text-sm text-gray-600">Value Retained</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">0%</div>
              <div className="text-sm text-gray-600">Platform Fees</div>
            </div>
          </div>
        </div>

        {/* Trade Types Legend */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <h3 className="text-lg font-semibold mb-4 text-center">Trade Types</h3>
          <div className="flex flex-wrap justify-center gap-3">
            <Badge className="bg-blue-100 text-blue-800 border-blue-200" variant="outline">
              Service for Service
            </Badge>
            <Badge className="bg-orange-100 text-orange-800 border-orange-200" variant="outline">
              Item for Service
            </Badge>
            <Badge className="bg-purple-100 text-purple-800 border-purple-200" variant="outline">
              Service for Item
            </Badge>
            <Badge className="bg-pink-100 text-pink-800 border-pink-200" variant="outline">
              Item for Item
            </Badge>
          </div>
        </div>

        {/* Task Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {barterTasks.map((task) => (
            <Card key={task.id} className="hover:shadow-lg transition-all duration-200 border-0 shadow-md">
              <CardHeader className="pb-4">
                <div className="flex justify-between items-start mb-2">
                  <Badge className={getDifficultyColor(task.difficulty)} variant="outline">
                    {task.difficulty}
                  </Badge>
                  <Badge className={getTradeTypeColor(task.tradeType)} variant="outline">
                    {task.tradeType}
                  </Badge>
                </div>
                
                <CardTitle className="text-lg line-clamp-2">{task.title}</CardTitle>
                <CardDescription className="line-clamp-3">
                  {task.description}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Posted By */}
                <div className="flex items-center gap-3">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src="" />
                    <AvatarFallback className="bg-orange-100 text-orange-600">
                      {task.postedBy.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="text-sm font-medium">{task.postedBy}</div>
                    <div className="text-xs text-gray-500">{task.postedAt}</div>
                  </div>
                </div>

                {/* Trade Details */}
                <div className="bg-gradient-to-r from-orange-50 to-amber-50 p-4 rounded-lg border border-orange-200">
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <Heart className="w-4 h-4 text-orange-500 mt-1 flex-shrink-0" />
                      <div>
                        <div className="text-xs font-medium text-orange-700 uppercase tracking-wide">Offering</div>
                        <div className="text-sm text-gray-700">{task.offering}</div>
                      </div>
                    </div>
                    
                    <div className="flex justify-center">
                      <ArrowLeftRight className="w-5 h-5 text-orange-400" />
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <Handshake className="w-4 h-4 text-orange-500 mt-1 flex-shrink-0" />
                      <div>
                        <div className="text-xs font-medium text-orange-700 uppercase tracking-wide">Seeking</div>
                        <div className="text-sm text-gray-700">{task.seeking}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Task Details */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="w-4 h-4" />
                    {task.location}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="w-4 h-4" />
                    {task.timeEstimate}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <User className="w-4 h-4" />
                    {task.category}
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1">
                  {task.tags.slice(0, 3).map((tag, index) => (
                    <Badge key={index} variant="secondary" className="text-xs bg-orange-50 text-orange-700">
                      {tag}
                    </Badge>
                  ))}
                  {task.tags.length > 3 && (
                    <Badge variant="secondary" className="text-xs">
                      +{task.tags.length - 3}
                    </Badge>
                  )}
                </div>

                {/* Action */}
                <div className="pt-4 border-t">
                  <Button 
                    onClick={() => handleApplyClick(task)}
                    className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600"
                    data-testid={`button-propose-trade-${task.id}`}
                  >
                    Propose Trade
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Application Modal */}
        {selectedTask && (
          <TaskApplicationModal
            task={{
              id: selectedTask.id,
              title: selectedTask.title,
              description: selectedTask.description,
              category: selectedTask.category,
              type: 'barter',
              payout: 0, // No monetary value for barter
              location: selectedTask.location,
              time_commitment: selectedTask.timeEstimate,
              requirements: [`Can provide: ${selectedTask.seeking}`, `Will receive: ${selectedTask.offering}`],
              platform_funded: false
            }}
            userId="current-user"
            onSuccess={() => setShowApplicationModal(false)}
          />
        )}
      </div>
    </div>
  )
}