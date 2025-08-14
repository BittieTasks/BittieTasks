'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MapPin, Clock, DollarSign, User, Star } from 'lucide-react'
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
    id: 'solo-1',
    title: 'Grocery Shopping & Delivery',
    description: 'Shop for groceries from provided list and deliver to elderly resident. Must have reliable transportation and attention to detail.',
    price: 35,
    location: 'Downtown Market District',
    timeEstimate: '2 hours',
    category: 'Delivery',
    difficulty: 'Easy',
    requiredSkills: ['Reliable transport', 'Attention to detail'],
    rating: 4.8,
    completedCount: 247
  },
  {
    id: 'solo-2',
    title: 'Pet Walking Service',
    description: 'Walk friendly golden retriever for 1 hour in the park. Dog is well-trained and loves meeting people.',
    price: 25,
    location: 'Riverside Park',
    timeEstimate: '1 hour',
    category: 'Pet Care',
    difficulty: 'Easy',
    requiredSkills: ['Love for animals', 'Physical fitness'],
    rating: 4.9,
    completedCount: 189
  },
  {
    id: 'solo-3',
    title: 'Furniture Assembly Expert',
    description: 'Assemble IKEA bedroom set (bed frame, dresser, nightstand). Must bring own tools and have assembly experience.',
    price: 75,
    location: 'Westside Apartment',
    timeEstimate: '4 hours',
    category: 'Handyman',
    difficulty: 'Hard',
    requiredSkills: ['Tool ownership', 'Assembly experience', 'Physical strength'],
    rating: 4.7,
    completedCount: 94
  },
  {
    id: 'solo-4',
    title: 'Garden Weeding & Pruning',
    description: 'Weed flower beds and prune shrubs in backyard garden. Knowledge of plants preferred but not required.',
    price: 45,
    location: 'Suburban Home',
    timeEstimate: '3 hours',
    category: 'Gardening',
    difficulty: 'Medium',
    requiredSkills: ['Physical stamina', 'Basic gardening knowledge'],
    rating: 4.6,
    completedCount: 156
  },
  {
    id: 'solo-5',
    title: 'House Cleaning Professional',
    description: 'Deep clean 3-bedroom house including bathrooms, kitchen, and living areas. Cleaning supplies provided.',
    price: 85,
    location: 'Oak Street',
    timeEstimate: '5 hours',
    category: 'Cleaning',
    difficulty: 'Medium',
    requiredSkills: ['Attention to detail', 'Physical stamina'],
    rating: 4.8,
    completedCount: 203
  },
  {
    id: 'solo-6',
    title: 'Computer Repair & Setup',
    description: 'Diagnose and fix laptop issues, set up new software, and provide basic training to elderly user.',
    price: 65,
    location: 'Tech Repair Needed',
    timeEstimate: '2.5 hours',
    category: 'Technology',
    difficulty: 'Hard',
    requiredSkills: ['Computer expertise', 'Patience', 'Teaching ability'],
    rating: 4.9,
    completedCount: 78
  }
]

export default function SoloPage() {
  const [selectedTask, setSelectedTask] = useState<SoloTask | null>(null)
  const [showApplicationModal, setShowApplicationModal] = useState(false)

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
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Solo Tasks
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Work independently on tasks that match your skills. Keep 93% of your earnings 
            with just a 7% platform fee. Perfect for building your reputation and income.
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
              <div className="text-2xl font-bold text-blue-600">$45</div>
              <div className="text-sm text-gray-600">Average Payout</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">4.8★</div>
              <div className="text-sm text-gray-600">Average Rating</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">93%</div>
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
                  <div className="flex items-center gap-1 text-sm text-yellow-600">
                    <Star className="w-4 h-4 fill-current" />
                    {task.rating}
                  </div>
                </div>
                <CardTitle className="text-lg line-clamp-2">{task.title}</CardTitle>
                <CardDescription className="line-clamp-3">
                  {task.description}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
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
                    {task.completedCount} completed
                  </div>
                </div>

                {/* Required Skills */}
                <div className="space-y-2">
                  <div className="text-sm font-medium text-gray-700">Required Skills:</div>
                  <div className="flex flex-wrap gap-1">
                    {task.requiredSkills.map((skill, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Price and Action */}
                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="flex items-center gap-1">
                    <DollarSign className="w-5 h-5 text-green-600" />
                    <span className="font-bold text-xl text-green-600">${task.price}</span>
                    <div className="text-xs text-gray-500 ml-1">
                      <div>You earn: ${Math.round(task.price * 0.93)}</div>
                    </div>
                  </div>
                  <Button 
                    onClick={() => handleApplyClick(task)}
                    data-testid={`button-apply-${task.id}`}
                  >
                    Apply Now
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
              type: 'solo',
              payout: selectedTask.price,
              location: selectedTask.location,
              time_commitment: selectedTask.timeEstimate,
              requirements: selectedTask.requiredSkills,
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