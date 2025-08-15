'use client'

import { useState } from 'react'
import { useAuth } from '@/components/auth/AuthProvider'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { MapPin, Clock, ArrowLeftRight, User, Heart, Handshake, ArrowLeft, Menu, Plus, Search, Filter, MessageCircle } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useRouter } from 'next/navigation'
import TaskApplicationModal from '@/components/TaskApplicationModal'
import Navigation from '@/components/shared/Navigation'
import { useQuery } from '@tanstack/react-query'
import { apiRequest } from '@/lib/lib/queryClient'
import type { Task } from '@shared/schema'

interface BarterTask extends Task {
  timeEstimate?: string
  postedBy?: string
  postedAt?: string
}

export default function BarterPage() {
  const [selectedTask, setSelectedTask] = useState<BarterTask | null>(null)
  const [showApplicationModal, setShowApplicationModal] = useState(false)
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()
  
  // Filtering state
  const [searchTerm, setSearchTerm] = useState('')
  const [difficultyFilter, setDifficultyFilter] = useState('all')
  const [tradeTypeFilter, setTradeTypeFilter] = useState('all')
  const [sortBy, setSortBy] = useState('newest')

  // Fetch barter tasks from API
  const { data: barterTasks = [], isLoading, error } = useQuery({
    queryKey: ['/api/tasks', 'barter'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/tasks?type=barter')
      const tasks = await response.json()
      return tasks.map((task: Task) => ({
        ...task,
        timeEstimate: task.duration,
        postedBy: 'Trader', // Placeholder until we have user data
        postedAt: new Date(task.createdAt!).toLocaleDateString(),
      }))
    }
  })

  const handleApplyClick = (task: BarterTask) => {
    if (!isAuthenticated) {
      router.push('/auth?message=Please sign in to apply for barter tasks')
      return
    }
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

  // Filter and sort tasks
  const filteredTasks = barterTasks.filter((task: BarterTask) => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesDifficulty = difficultyFilter === 'all' || task.difficulty === difficultyFilter
    const matchesTradeType = tradeTypeFilter === 'all' || task.tradeType === tradeTypeFilter
    return matchesSearch && matchesDifficulty && matchesTradeType
  }).sort((a: BarterTask, b: BarterTask) => {
    switch (sortBy) {
      case 'newest': return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
      case 'oldest': return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime()
      default: return 0
    }
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-100">
      <Navigation showBackButton={true} backUrl="/dashboard" title="Barter Exchange" />
      
      <div className="max-w-6xl mx-auto p-4">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <h1 className="text-4xl font-bold text-gray-900">Barter Exchange</h1>
            <Badge className="bg-orange-100 text-orange-800">0% Fees</Badge>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Trade skills, services, and items without money! Connect with neighbors for mutually beneficial exchanges. 
            No platform fees - just community-driven value trading.
          </p>
          <div className="mt-6 space-x-4">
            <Button 
              size="lg" 
              className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-3"
              data-testid="button-create-barter-trade"
              onClick={() => router.push('/create-barter')}
            >
              <Plus className="w-5 h-5 mr-2" />
              Create Barter Trade
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="border-orange-600 text-orange-600 hover:bg-orange-50 px-8 py-3"
              data-testid="button-chat-traders"
            >
              <MessageCircle className="w-5 h-5 mr-2" />
              Chat with Traders
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search trades..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Difficulties</SelectItem>
                <SelectItem value="Easy">Easy</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="Hard">Hard</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={tradeTypeFilter} onValueChange={setTradeTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Trade Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Trade Types</SelectItem>
                <SelectItem value="Service for Service">Service ↔ Service</SelectItem>
                <SelectItem value="Item for Service">Item ↔ Service</SelectItem>
                <SelectItem value="Service for Item">Service ↔ Item</SelectItem>
                <SelectItem value="Item for Item">Item ↔ Item</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
              </SelectContent>
            </Select>
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

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin w-8 h-8 border-4 border-orange-600 border-t-transparent rounded-full" />
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-8">
            <p className="text-gray-600 mb-4">Failed to load barter trades</p>
            <Button variant="outline" onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && barterTasks.length === 0 && (
          <div className="text-center py-12">
            <ArrowLeftRight className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No Barter Trades Yet</h3>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              Start the first trade! Exchange skills, services, and items with your neighbors without any money.
            </p>
            <Button 
              onClick={() => router.push('/create-barter')}
              className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600"
              data-testid="button-create-first-barter"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create First Barter Trade
            </Button>
          </div>
        )}

        {/* Task Grid */}
        {!isLoading && !error && barterTasks.length > 0 && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {barterTasks.map((task: BarterTask) => (
            <Card key={task.id} className="hover:shadow-lg transition-all duration-200 border-0 shadow-md">
              <CardHeader className="pb-4">
                <div className="flex justify-between items-start mb-2">
                  <Badge className={getDifficultyColor(task.difficulty || 'medium')} variant="outline">
                    {task.difficulty || 'Medium'}
                  </Badge>
                  <Badge className={getTradeTypeColor(task.tradeType || 'Service')} variant="outline">
                    {task.tradeType || 'Service'}
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
                      {(task.postedBy || 'Anonymous').charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="text-sm font-medium">{task.postedBy || 'Anonymous'}</div>
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
                    {task.categoryId || 'General'}
                  </div>
                </div>

                {/* Tags */}
                {task.tags && task.tags.length > 0 && (
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
                )}

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
        )}

        {/* Application Modal */}
        {selectedTask && (
          <TaskApplicationModal
            task={{
              id: selectedTask.id,
              title: selectedTask.title,
              description: selectedTask.description,
              category: selectedTask.categoryId || 'General',
              type: 'barter',
              payout: 0, // No monetary value for barter
              location: selectedTask.location || 'Not specified',
              time_commitment: selectedTask.timeEstimate || 'Not specified',
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