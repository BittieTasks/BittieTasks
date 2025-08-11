'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '../../components/auth/AuthProvider'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Navigation from '@/components/Navigation'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useRouter } from 'next/navigation'
import { Search, MapPin, Clock, Users, DollarSign, Filter, Star, Briefcase } from 'lucide-react'

// Mock data for now - this will be replaced with real API data
const mockTasks = [
  {
    id: '1',
    title: 'School Pickup Share',
    description: 'Looking for someone to share daily school pickup duties. Great for parents in the Westfield Elementary area.',
    category: 'Childcare',
    earningPotential: 45.00,
    maxParticipants: 2,
    currentParticipants: 0,
    location: 'Westfield Elementary',
    duration: '30 min daily',
    hostName: 'Sarah M.',
    hostRating: 4.9,
    type: 'shared',
    urgency: 'medium',
    scheduledDate: '2025-01-15',
  },
  {
    id: '2',
    title: 'Grocery Shopping Partner',
    description: 'Weekly Costco runs - split gas, time, and bulk purchases. Perfect for busy families.',
    category: 'Shopping',
    earningPotential: 32.50,
    maxParticipants: 3,
    currentParticipants: 1,
    location: 'Costco Warehouse',
    duration: '2 hours weekly',
    hostName: 'Mike D.',
    hostRating: 4.7,
    type: 'shared',
    urgency: 'low',
    scheduledDate: '2025-01-12',
  },
  {
    id: '3',
    title: 'After-School Activity Carpool',
    description: 'Soccer practice carpool for kids aged 8-12. Share driving duties and earn while helping other families.',
    category: 'Transportation',
    earningPotential: 28.00,
    maxParticipants: 4,
    currentParticipants: 2,
    location: 'Central Soccer Fields',
    duration: '1 hour, 3x/week',
    hostName: 'Lisa K.',
    hostRating: 5.0,
    type: 'shared',
    urgency: 'high',
    scheduledDate: '2025-01-10',
  },
  {
    id: '4',
    title: 'Corporate Wellness Challenge',
    description: 'Help promote healthy family habits through our sponsored wellness program. Earn rewards for tracking family activities.',
    category: 'Wellness',
    earningPotential: 75.00,
    maxParticipants: 50,
    currentParticipants: 12,
    location: 'Virtual/Home',
    duration: '2 weeks',
    hostName: 'HealthTech Solutions',
    hostRating: 4.8,
    type: 'sponsored',
    sponsor: 'HealthTech Solutions',
    urgency: 'medium',
    scheduledDate: '2025-01-20',
  }
]

const categories = ['All', 'Childcare', 'Shopping', 'Transportation', 'Wellness', 'Household', 'Educational']

export default function MarketplacePage() {
  const { user, isAuthenticated, isVerified } = useAuth()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [sortBy, setSortBy] = useState('earning')

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  if (!isAuthenticated) {
    router.push('/auth')
    return null
  }

  const filteredTasks = mockTasks
    .filter(task => 
      selectedCategory === 'All' || task.category === selectedCategory
    )
    .filter(task =>
      searchTerm === '' || 
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'earning') return b.earningPotential - a.earningPotential
      if (sortBy === 'date') return new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime()
      if (sortBy === 'participants') return a.currentParticipants - b.currentParticipants
      return 0
    })

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'bg-red-500/20 text-red-400 border-red-500/20'
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/20'
      case 'low': return 'bg-green-500/20 text-green-400 border-green-500/20'
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/20'
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'sponsored': return 'bg-purple-500/20 text-purple-400 border-purple-500/20'
      case 'shared': return 'bg-blue-500/20 text-blue-400 border-blue-500/20'
      case 'solo': return 'bg-green-500/20 text-green-400 border-green-500/20'
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/20'
    }
  }

  return (
    <>
      <Navigation />
      <div className="min-h-screen platform-gradient">
      {/* Header */}
      <div className="px-6 pt-8 pb-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white/90 backdrop-blur-sm border border-green-200 rounded-2xl p-6 shadow-lg">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-800 mb-2">Task Marketplace</h1>
                <p className="text-gray-600">Find earning opportunities in your community</p>
              </div>
              <Button 
                onClick={() => router.push('/create-task')}
                className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 border-0 shadow-lg"
                disabled={!isVerified}
              >
                Create Task
              </Button>
            </div>

            {/* Search and Filters */}
            <div className="grid md:grid-cols-4 gap-4">
              <div className="md:col-span-2 relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Search tasks..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white border-green-200 text-gray-800 placeholder-gray-500"
                />
              </div>
              
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="bg-white border-green-200 text-gray-800">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent className="bg-white border-green-200">
                  {categories.map(category => (
                    <SelectItem key={category} value={category} className="text-gray-800 hover:bg-green-50">
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="bg-white border-green-200 text-gray-800">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent className="bg-white border-green-200">
                  <SelectItem value="earning" className="text-gray-800 hover:bg-green-50">Highest Earning</SelectItem>
                  <SelectItem value="date" className="text-gray-800 hover:bg-green-50">Soonest Date</SelectItem>
                  <SelectItem value="participants" className="text-gray-800 hover:bg-green-50">Spots Available</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* Verification Banner */}
      {!isVerified && (
        <div className="px-6 pb-6">
          <div className="max-w-7xl mx-auto">
            <Card className="bg-yellow-500/10 border-yellow-500/20 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Filter className="h-5 w-5 text-yellow-500" />
                  <div>
                    <h3 className="text-yellow-500 font-semibold">Email Verification Required</h3>
                    <p className="text-gray-300 text-sm">Complete email verification to join tasks and start earning.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Task Grid */}
      <div className="px-6 pb-12">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredTasks.map((task) => (
              <Card key={task.id} className="bg-gray-800/50 backdrop-blur-sm border-gray-700 hover:border-gray-600 transition-all duration-200 hover:transform hover:scale-105">
                <CardHeader className="pb-4">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <Badge className={getTypeColor(task.type)}>
                        {task.type === 'sponsored' && <Briefcase className="w-3 h-3 mr-1" />}
                        {task.type.charAt(0).toUpperCase() + task.type.slice(1)}
                      </Badge>
                      <Badge className={getUrgencyColor(task.urgency)}>
                        {task.urgency}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      <span className="text-sm text-gray-300">{task.hostRating}</span>
                    </div>
                  </div>
                  
                  <CardTitle className="text-white text-lg">{task.title}</CardTitle>
                  <CardDescription className="text-gray-400 line-clamp-2">
                    {task.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Earning Potential */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-green-400" />
                      <span className="text-green-400 font-semibold">${task.earningPotential.toFixed(2)}</span>
                      <span className="text-gray-400 text-sm">potential</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-300 text-sm">
                        {task.currentParticipants}/{task.maxParticipants}
                      </span>
                    </div>
                  </div>

                  {/* Location and Duration */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-300 text-sm">{task.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-300 text-sm">{task.duration}</span>
                    </div>
                  </div>

                  {/* Host Info */}
                  <div className="flex items-center justify-between pt-2 border-t border-gray-700">
                    <span className="text-gray-400 text-sm">
                      Hosted by <span className="text-white">{task.hostName}</span>
                    </span>
                    <span className="text-gray-400 text-sm">
                      {new Date(task.scheduledDate).toLocaleDateString()}
                    </span>
                  </div>

                  {/* Action Button */}
                  <Button 
                    className={`w-full ${
                      isVerified 
                        ? 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 border-0'
                        : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                    }`}
                    disabled={!isVerified || task.currentParticipants >= task.maxParticipants}
                  >
                    {task.currentParticipants >= task.maxParticipants 
                      ? 'Task Full' 
                      : isVerified 
                        ? 'Join Task' 
                        : 'Verify Email to Join'
                    }
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredTasks.length === 0 && (
            <div className="text-center py-12">
              <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-8 max-w-md mx-auto">
                <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-white text-lg font-semibold mb-2">No tasks found</h3>
                <p className="text-gray-400 mb-4">Try adjusting your search criteria or create a new task.</p>
                <Button 
                  onClick={() => router.push('/create-task')}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 border-0"
                  disabled={!isVerified}
                >
                  Create New Task
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
    </>
  )
}