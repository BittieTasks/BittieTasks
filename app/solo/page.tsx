'use client'

import { useState } from 'react'
import { useAuth } from '@/components/auth/AuthProvider'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MapPin, Clock, DollarSign, User, Users, Star, ArrowLeft, Menu } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useRouter } from 'next/navigation'
import TaskApplicationModal from '@/components/TaskApplicationModal'
import EnhancedTaskCard from '@/components/task/EnhancedTaskCard'
import Navigation from '@/components/shared/Navigation'

interface SoloTask {
  id: string
  title: string
  description: string
  price: number
  location: string
  timeEstimate: string
  category: string
  difficulty: 'Easy' | 'Medium' | 'Hard'
  requiredSkills: string[]
  rating: number
  completedCount: number
  maxUsers?: number
}

const soloTasks: SoloTask[] = [
  {
    id: 'platform-001',
    title: 'Laundry Day',
    description: 'Complete a full load of laundry from start to finish: wash, dry, fold, and put away. Take photos showing your clean, folded, and organized clothes.',
    price: 20,
    location: 'Your Home',
    timeEstimate: '2 hours',
    category: 'Home Organization',
    difficulty: 'Easy',
    requiredSkills: ['Access to washer/dryer', 'Photo verification'],
    rating: 4.9,
    completedCount: 0,
    maxUsers: 2
  },
  {
    id: 'platform-002',
    title: 'Kitchen Clean-Up',
    description: 'Wash all dishes and clean kitchen counters thoroughly. Take before/after photos showing your sparkling clean kitchen transformation.',
    price: 15,
    location: 'Your Home',
    timeEstimate: '30 minutes',
    category: 'Home Organization',
    difficulty: 'Easy',
    requiredSkills: ['Kitchen access', 'Before/after photos'],
    rating: 4.8,
    completedCount: 0,
    maxUsers: 2
  },
  {
    id: 'platform-003',
    title: 'Pilates Session',
    description: 'Complete a 30-minute pilates workout session. Share a photo or video of you doing pilates poses and your post-workout state.',
    price: 12,
    location: 'Your Home or Studio',
    timeEstimate: '30 minutes',
    category: 'Health & Fitness',
    difficulty: 'Easy',
    requiredSkills: ['Exercise mat', 'Workout verification photo/video'],
    rating: 4.7,
    completedCount: 0,
    maxUsers: 2
  },
  {
    id: 'platform-004',
    title: 'Grocery Run',
    description: 'Pick up essential groceries for the week from your local store. Share a photo of your grocery haul or receipt as verification.',
    price: 25,
    location: 'Local Grocery Store',
    timeEstimate: '1 hour',
    category: 'Transportation',
    difficulty: 'Easy',
    requiredSkills: ['Transportation to store', 'Receipt or grocery photo'],
    rating: 4.6,
    completedCount: 0,
    maxUsers: 2
  },
  {
    id: 'platform-005',
    title: 'Room Organization',
    description: 'Organize and tidy one room in your home completely. Take before and after photos showing the amazing transformation.',
    price: 30,
    location: 'Your Home',
    timeEstimate: '1 hour',
    category: 'Home Organization',
    difficulty: 'Easy',
    requiredSkills: ['Before/after photos', 'Room access'],
    rating: 4.5,
    completedCount: 0,
    maxUsers: 2
  },
  {
    id: 'platform-006',
    title: 'Deep Clean Bathroom',
    description: 'Thoroughly clean and sanitize your bathroom including toilet, shower/tub, sink, mirror, and floor. Upload before/after photos for verification.',
    price: 18,
    location: 'Your Home',
    timeEstimate: '45 minutes',
    category: 'Home Maintenance',
    difficulty: 'Easy',
    requiredSkills: ['Cleaning supplies', 'Before/after photos', 'AI photo verification'],
    rating: 4.9,
    completedCount: 0,
    maxUsers: 2
  },
  {
    id: 'platform-007',
    title: 'Morning Yoga Flow',
    description: 'Complete a 20-minute morning yoga routine focusing on stretching and mindfulness. Record a video showing key poses and post-practice reflection.',
    price: 10,
    location: 'Your Home',
    timeEstimate: '25 minutes',
    category: 'Health & Fitness',
    difficulty: 'Easy',
    requiredSkills: ['Yoga mat', 'Video recording', 'Basic yoga knowledge'],
    rating: 4.8,
    completedCount: 0,
    maxUsers: 2
  },
  {
    id: 'platform-008',
    title: 'Meal Prep Session',
    description: 'Prepare 3 healthy meals for the week with proper portioning. Document ingredients, cooking process, and final meal containers.',
    price: 35,
    location: 'Your Kitchen',
    timeEstimate: '2 hours',
    category: 'Nutrition & Wellness',
    difficulty: 'Medium',
    requiredSkills: ['Cooking skills', 'Meal planning', 'Food photography', 'Nutrition awareness'],
    rating: 4.6,
    completedCount: 0,
    maxUsers: 2
  },
  {
    id: 'platform-009',
    title: 'Closet Deep Clean',
    description: 'Organize one closet completely: sort, declutter, donate unwanted items, and arrange remaining clothes logically. Document the transformation.',
    price: 28,
    location: 'Your Home',
    timeEstimate: '90 minutes',
    category: 'Home Organization',
    difficulty: 'Medium',
    requiredSkills: ['Organization supplies', 'Decision-making', 'Before/after photos'],
    rating: 4.7,
    completedCount: 0,
    maxUsers: 2
  },
  {
    id: 'platform-010',
    title: 'Vehicle Exterior Wash',
    description: 'Wash and clean your vehicle exterior including wheels, windows, and body. Take before/after photos showing the clean results.',
    price: 22,
    location: 'Your Driveway',
    timeEstimate: '1 hour',
    category: 'Vehicle Maintenance',
    difficulty: 'Easy',
    requiredSkills: ['Car washing supplies', 'Vehicle access', 'Before/after photos'],
    rating: 4.5,
    completedCount: 0,
    maxUsers: 2
  },
  {
    id: 'platform-011',
    title: 'Meditation & Journaling',
    description: 'Complete a 15-minute meditation session followed by 10 minutes of reflective journaling. Share photos of your setup and journal entry.',
    price: 8,
    location: 'Quiet Space',
    timeEstimate: '25 minutes',
    category: 'Mental Health',
    difficulty: 'Easy',
    requiredSkills: ['Meditation app/guide', 'Journal/writing materials', 'Photo documentation'],
    rating: 4.9,
    completedCount: 0,
    maxUsers: 2
  },
  {
    id: 'platform-012',
    title: 'Garden/Plant Care',
    description: 'Water, trim, and care for indoor or outdoor plants. Document plant health before and after care with detailed photos.',
    price: 14,
    location: 'Your Home/Garden',
    timeEstimate: '30 minutes',
    category: 'Home Maintenance',
    difficulty: 'Easy',
    requiredSkills: ['Plant care knowledge', 'Watering supplies', 'Before/after photos'],
    rating: 4.6,
    completedCount: 0,
    maxUsers: 2
  },
  {
    id: 'platform-013',
    title: 'Digital Detox Walk',
    description: 'Take a 30-minute walk without phone/devices, focusing on mindfulness and nature observation. Record reflections before and after the walk.',
    price: 11,
    location: 'Outdoors/Neighborhood',
    timeEstimate: '40 minutes',
    category: 'Mental Health',
    difficulty: 'Easy',
    requiredSkills: ['Walking ability', 'Reflection recording', 'Mindfulness practice'],
    rating: 4.8,
    completedCount: 0,
    maxUsers: 2
  },
  {
    id: 'platform-014',
    title: 'Home Office Organization',
    description: 'Organize your desk and workspace area completely. Clear clutter, organize supplies, and clean surfaces. Document the transformation.',
    price: 16,
    location: 'Your Home Office',
    timeEstimate: '45 minutes',
    category: 'Home Organization',
    difficulty: 'Easy',
    requiredSkills: ['Organization supplies', 'Before/after photos', 'Workspace access'],
    rating: 4.7,
    completedCount: 0,
    maxUsers: 2
  },
  {
    id: 'platform-015',
    title: 'Self-Care Spa Hour',
    description: 'Create a relaxing spa experience at home with skincare, bath/shower routine, and relaxation time. Document your self-care process.',
    price: 13,
    location: 'Your Home',
    timeEstimate: '1 hour',
    category: 'Personal Wellness',
    difficulty: 'Easy',
    requiredSkills: ['Self-care products', 'Relaxation space', 'Process documentation'],
    rating: 4.8,
    completedCount: 0,
    maxUsers: 2
  }
]

export default function SoloPage() {
  const [selectedTask, setSelectedTask] = useState<SoloTask | null>(null)
  const [showApplicationModal, setShowApplicationModal] = useState(false)
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()

  const handleApplyClick = (task: SoloTask) => {
    if (!isAuthenticated) {
      // Guide unauthenticated users to sign in
      router.push('/auth?message=Please sign in to apply for tasks')
      return
    }
    setSelectedTask(task)
    setShowApplicationModal(true)
  }

  const handleApplicationSuccess = () => {
    // Close modal and redirect to dashboard after successful verification and payment
    setShowApplicationModal(false)
    setSelectedTask(null)
    router.push('/dashboard?message=Task completed and payment processed!')
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'bg-green-100 text-green-800 border-green-200'
      case 'Medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'Hard': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Navigation Header */}
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            onClick={() => router.push('/dashboard')}
            className="flex items-center gap-2 text-gray-700 hover:text-green-600"
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
              <DropdownMenuItem onClick={() => router.push('/community')}>
                Community Tasks
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push('/sponsors')}>
                Corporate Tasks
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push('/barter')}>
                Barter Exchange
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
            Solo Tasks
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            15 active BittieTasks-funded household and self-care tasks. Complete these platform-paid tasks with our convenient solo format.
            Small 3% processing fee for the solo convenience. Limited to 2 users per task.
          </p>
        </div>

        {/* Stats Bar */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{soloTasks.length}</div>
              <div className="text-sm text-gray-600">Available Tasks</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">$20</div>
              <div className="text-sm text-gray-600">Average Payout</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">4.7★</div>
              <div className="text-sm text-gray-600">Average Rating</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">97%</div>
              <div className="text-sm text-gray-600">Your Take-Home</div>
            </div>
          </div>
        </div>

        {/* Task Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {soloTasks.map((task) => (
            <Card key={task.id} className="hover:shadow-lg transition-all duration-200 border-0 shadow-md">
              <CardHeader className="pb-4">
                <div className="flex justify-between items-start mb-2">
                  <Badge className={getDifficultyColor(task.difficulty)} variant="outline">
                    {task.difficulty}
                  </Badge>
                  <div className="flex items-center gap-1 text-yellow-500">
                    <Star size={16} fill="currentColor" />
                    <span className="text-sm font-medium text-gray-700">{task.rating}</span>
                  </div>
                </div>
                <CardTitle className="text-lg line-clamp-2">{task.title}</CardTitle>
                <CardDescription className="line-clamp-3">
                  {task.description}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Payment */}
                <div className="p-3 bg-green-50 rounded-lg border border-green-100">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <DollarSign size={18} className="text-green-600" />
                      <span className="font-semibold text-green-600">${task.price}</span>
                    </div>
                    <span className="text-xs text-green-600 font-medium">Platform Funded</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-600">
                    <span>You earn: ${(task.price * 0.97).toFixed(2)}</span>
                    <span>(3% processing fee)</span>
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <MapPin size={14} />
                    <span>{task.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock size={14} />
                    <span>{task.timeEstimate}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <User size={14} />
                    <span>{task.completedCount} completed</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users size={14} />
                    <span>Limited to {task.maxUsers} users</span>
                  </div>
                </div>

                {/* Skills */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Required:</h4>
                  <div className="flex flex-wrap gap-1">
                    {task.requiredSkills.map((skill, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Apply Button */}
                <Button 
                  onClick={() => handleApplyClick(task)}
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                  data-testid={`button-apply-${task.id}`}
                >
                  Apply & Start Task
                </Button>
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
              type: 'solo',
              payout: selectedTask.price,
              location: selectedTask.location,
              time_commitment: selectedTask.timeEstimate,
              requirements: selectedTask.requiredSkills,
              platform_funded: true,
              verification_type: 'photo'
            }}
            userId={user?.id || ''}
            isOpen={showApplicationModal}
            onOpenChange={setShowApplicationModal}
            onSuccess={handleApplicationSuccess}
          />
        )}
      </div>
    </div>
  )
}