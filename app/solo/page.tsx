'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MapPin, Clock, DollarSign, User, Star, ArrowLeft, Menu } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useRouter } from 'next/navigation'
import TaskApplicationModal from '@/components/TaskApplicationModal'

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
}

const soloTasks: SoloTask[] = [
  {
    id: 'platform-001',
    title: 'Deep Clean Bathroom',
    description: 'Thoroughly clean and sanitize your bathroom including toilet, shower/tub, sink, mirror, and floor. Upload before/after photos for AI verification of cleanliness standards.',
    price: 15,
    location: 'Your Home',
    timeEstimate: '45 minutes',
    category: 'Home Maintenance',
    difficulty: 'Easy',
    requiredSkills: ['Cleaning supplies', 'Before/after photos', 'AI photo verification'],
    rating: 4.9,
    completedCount: 0
  },
  {
    id: 'platform-002',
    title: 'Complete Laundry Cycle',
    description: 'Wash, dry, fold, and put away a full load of laundry. Document the process with photos showing sorted clothes, washing machine running, and final organized results.',
    price: 12,
    location: 'Your Home',
    timeEstimate: '2.5 hours',
    category: 'Home Maintenance',
    difficulty: 'Easy',
    requiredSkills: ['Washer/dryer access', 'Process documentation', 'Final photo verification'],
    rating: 4.8,
    completedCount: 0
  },
  {
    id: 'platform-003',
    title: '30-Minute Cardio Workout',
    description: 'Complete a 30-minute cardio exercise session (running, cycling, dancing, etc.). Record a brief video showing your workout activity and post-exercise state for verification.',
    price: 10,
    location: 'Home, Gym, or Outdoors',
    timeEstimate: '30 minutes',
    category: 'Health & Fitness',
    difficulty: 'Medium',
    requiredSkills: ['Exercise equipment/space', 'Video recording capability', 'Heart rate monitoring'],
    rating: 4.7,
    completedCount: 0
  },
  {
    id: 'platform-004',
    title: 'Weekly Grocery Shopping',
    description: 'Plan and complete a thoughtful weekly grocery shopping trip. Document your shopping list, cart during shopping, receipt, and organized groceries at home.',
    price: 18,
    location: 'Local Grocery Store',
    timeEstimate: '1.5 hours',
    category: 'Errands',
    difficulty: 'Easy',
    requiredSkills: ['Transportation', 'Shopping list planning', 'Receipt and photo documentation'],
    rating: 4.6,
    completedCount: 0
  },
  {
    id: 'platform-005',
    title: 'Kitchen Deep Clean',
    description: 'Complete kitchen cleaning including all dishes, counters, appliances (inside microwave, stovetop, sink), and pantry organization. Submit comprehensive before/after photos.',
    price: 20,
    location: 'Your Home',
    timeEstimate: '1 hour',
    category: 'Home Maintenance',
    difficulty: 'Medium',
    requiredSkills: ['Cleaning supplies', 'Appliance cleaning knowledge', 'Organization skills', 'Photo verification'],
    rating: 4.8,
    completedCount: 0
  },
  {
    id: 'platform-006',
    title: 'Mindfulness Meditation Session',
    description: 'Complete a 20-minute guided meditation session focused on mindfulness and stress relief. Record a brief 2-minute reflection video about your experience and mental state.',
    price: 8,
    location: 'Quiet Space at Home',
    timeEstimate: '25 minutes',
    category: 'Mental Health',
    difficulty: 'Easy',
    requiredSkills: ['Meditation app/guide access', 'Quiet environment', 'Self-reflection video recording'],
    rating: 4.9,
    completedCount: 0
  },
  {
    id: 'platform-007',
    title: 'Organize One Closet',
    description: 'Completely organize a bedroom or storage closet by sorting, decluttering, and arranging items logically. Document before/after transformation and any items set aside for donation.',
    price: 25,
    location: 'Your Home',
    timeEstimate: '2 hours',
    category: 'Home Organization',
    difficulty: 'Medium',
    requiredSkills: ['Organization supplies', 'Decision-making skills', 'Before/after documentation'],
    rating: 4.7,
    completedCount: 0
  },
  {
    id: 'platform-008',
    title: 'Prepare Nutritious Meal',
    description: 'Plan and cook a well-balanced homemade meal including vegetables, protein, and whole grains. Document ingredients, cooking process, and beautifully plated final meal.',
    price: 16,
    location: 'Your Kitchen',
    timeEstimate: '1 hour',
    category: 'Nutrition & Wellness',
    difficulty: 'Medium',
    requiredSkills: ['Basic cooking skills', 'Meal planning knowledge', 'Food photography', 'Nutritional awareness'],
    rating: 4.6,
    completedCount: 0
  },
  {
    id: 'platform-009',
    title: 'Vehicle Interior Detailing',
    description: 'Thoroughly vacuum and clean your vehicle interior including seats, dashboard, cup holders, floor mats, and windows. Document detailed before/after condition photos.',
    price: 22,
    location: 'Your Driveway/Parking Area',
    timeEstimate: '45 minutes',
    category: 'Vehicle Maintenance',
    difficulty: 'Easy',
    requiredSkills: ['Vehicle access', 'Vacuum and cleaning supplies', 'Detail-oriented photography'],
    rating: 4.5,
    completedCount: 0
  },
  {
    id: 'platform-010',
    title: 'Personal Wellness Routine',
    description: 'Complete a comprehensive self-care routine including skincare, grooming, and relaxation activities. Document your routine and record a reflection on the wellness benefits.',
    price: 14,
    location: 'Your Home',
    timeEstimate: '1 hour',
    category: 'Personal Wellness',
    difficulty: 'Easy',
    requiredSkills: ['Personal care products', 'Self-documentation', 'Wellness reflection recording'],
    rating: 4.8,
    completedCount: 0
  }
]

export default function SoloPage() {
  const [selectedTask, setSelectedTask] = useState<SoloTask | null>(null)
  const [showApplicationModal, setShowApplicationModal] = useState(false)
  const router = useRouter()

  const handleApplyClick = (task: SoloTask) => {
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
            10 active BittieTasks-funded household and self-care tasks. Complete these platform-paid tasks and keep 100% of earnings.
            No fees - we invest in your wellness and productivity.
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
              <div className="text-2xl font-bold text-blue-600">$16</div>
              <div className="text-sm text-gray-600">Average Payout</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">4.7★</div>
              <div className="text-sm text-gray-600">Average Rating</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">100%</div>
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
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-100">
                  <div className="flex items-center gap-2">
                    <DollarSign size={18} className="text-green-600" />
                    <span className="font-semibold text-green-600">${task.price}</span>
                  </div>
                  <span className="text-xs text-green-600 font-medium">Platform Funded</span>
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
            isOpen={showApplicationModal}
            onClose={() => {
              setShowApplicationModal(false)
              setSelectedTask(null)
            }}
            task={{
              id: selectedTask.id,
              title: selectedTask.title,
              description: selectedTask.description,
              price: selectedTask.price,
              location: selectedTask.location,
              timeEstimate: selectedTask.timeEstimate,
              category: selectedTask.category,
              difficulty: selectedTask.difficulty,
              requiredSkills: selectedTask.requiredSkills,
              rating: selectedTask.rating,
              taskType: 'solo'
            }}
          />
        )}
      </div>
    </div>
  )
}