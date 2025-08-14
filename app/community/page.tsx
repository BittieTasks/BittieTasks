'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { MessageCircle, Users, MapPin, Clock, DollarSign } from 'lucide-react'
import { TaskApplicationModal } from '@/components/TaskApplicationModal'

interface CommunityTask {
  id: string
  title: string
  description: string
  price: number
  location: string
  postedBy: string
  postedAt: string
  participants: number
  maxParticipants: number
  category: string
  difficulty: 'Easy' | 'Medium' | 'Hard'
  estimatedTime: string
  status: 'open' | 'in-progress' | 'completed'
}

const communityTasks: CommunityTask[] = [
  {
    id: 'comm-1',
    title: 'Neighborhood Clean-Up Day',
    description: 'Join our monthly neighborhood clean-up! We need volunteers to help pick up litter, plant flowers, and make our community beautiful.',
    price: 25,
    location: 'Riverside Park',
    postedBy: 'Sarah M.',
    postedAt: '2 hours ago',
    participants: 8,
    maxParticipants: 15,
    category: 'Community Service',
    difficulty: 'Easy',
    estimatedTime: '3 hours',
    status: 'open'
  },
  {
    id: 'comm-2',
    title: 'Block Party Setup Crew',
    description: 'Help set up tables, chairs, and decorations for our annual block party. Great way to meet neighbors and have fun!',
    price: 40,
    location: 'Elm Street',
    postedBy: 'Mike R.',
    postedAt: '1 day ago',
    participants: 5,
    maxParticipants: 10,
    category: 'Event Setup',
    difficulty: 'Medium',
    estimatedTime: '4 hours',
    status: 'open'
  },
  {
    id: 'comm-3',
    title: 'Community Garden Maintenance',
    description: 'Weekly maintenance of our shared garden space. Watering, weeding, and harvesting vegetables to share with the community.',
    price: 30,
    location: 'Community Center',
    postedBy: 'Lisa K.',
    postedAt: '3 days ago',
    participants: 12,
    maxParticipants: 12,
    category: 'Gardening',
    difficulty: 'Easy',
    estimatedTime: '2 hours',
    status: 'in-progress'
  }
]

export default function CommunityPage() {
  const [selectedTask, setSelectedTask] = useState<CommunityTask | null>(null)
  const [showApplicationModal, setShowApplicationModal] = useState(false)

  const handleApplyClick = (task: CommunityTask) => {
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'in-progress': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'completed': return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Community Tasks
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Join your neighbors in collaborative tasks! Work together, share earnings (7% platform fee), 
            and build stronger community connections through group messaging.
          </p>
        </div>

        {/* Stats Bar */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{communityTasks.filter(t => t.status === 'open').length}</div>
              <div className="text-sm text-gray-600">Active Tasks</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{communityTasks.reduce((sum, t) => sum + t.participants, 0)}</div>
              <div className="text-sm text-gray-600">Total Participants</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">${communityTasks.reduce((sum, t) => sum + t.price, 0)}</div>
              <div className="text-sm text-gray-600">Total Earnings</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">7%</div>
              <div className="text-sm text-gray-600">Platform Fee</div>
            </div>
          </div>
        </div>

        {/* Task Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {communityTasks.map((task) => (
            <Card key={task.id} className="hover:shadow-lg transition-all duration-200 border-0 shadow-md">
              <CardHeader className="pb-4">
                <div className="flex justify-between items-start mb-2">
                  <Badge className={getDifficultyColor(task.difficulty)} variant="outline">
                    {task.difficulty}
                  </Badge>
                  <Badge className={getStatusColor(task.status)} variant="outline">
                    {task.status}
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
                    <AvatarFallback className="bg-blue-100 text-blue-600">
                      {task.postedBy.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="text-sm font-medium">{task.postedBy}</div>
                    <div className="text-xs text-gray-500">{task.postedAt}</div>
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
                    {task.estimatedTime}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Users className="w-4 h-4" />
                    {task.participants}/{task.maxParticipants} participants
                  </div>
                </div>

                {/* Price and Actions */}
                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="flex items-center gap-1">
                    <DollarSign className="w-4 h-4 text-green-600" />
                    <span className="font-bold text-lg text-green-600">${task.price}</span>
                    <span className="text-sm text-gray-500">shared</span>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      data-testid={`button-message-${task.id}`}
                    >
                      <MessageCircle className="w-4 h-4" />
                    </Button>
                    <Button 
                      size="sm"
                      onClick={() => handleApplyClick(task)}
                      disabled={task.participants >= task.maxParticipants || task.status !== 'open'}
                      data-testid={`button-join-${task.id}`}
                    >
                      {task.participants >= task.maxParticipants ? 'Full' : 'Join Task'}
                    </Button>
                  </div>
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
              price: selectedTask.price,
              category: selectedTask.category,
              location: selectedTask.location,
              timeEstimate: selectedTask.estimatedTime,
              difficulty: selectedTask.difficulty,
              requirements: ['Valid ID', 'Team player attitude'],
              tags: ['community', 'group', 'shared-earnings']
            }}
            isOpen={showApplicationModal}
            onClose={() => setShowApplicationModal(false)}
          />
        )}
      </div>
    </div>
  )
}