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
    title: 'Laundry Day',
    description: 'Complete a full load of laundry from start to finish: wash, dry, fold, and put away. Take photos showing your clean, folded, and organized clothes.',
    price: 20,
    location: 'Your Home',
    timeEstimate: '2 hours',
    category: 'Home Organization',
    difficulty: 'Easy',
    requiredSkills: ['Access to washer/dryer', 'Photo verification'],
    rating: 4.9,
    completedCount: 0
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
    completedCount: 0
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
    completedCount: 0
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
    completedCount: 0
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
            5 active BittieTasks-funded household and self-care tasks. Complete these platform-paid tasks and keep 100% of earnings.
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
              <div className="text-2xl font-bold text-blue-600">$20</div>
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