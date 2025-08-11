'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '../../components/auth/AuthProvider'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import CleanNavigation from '@/components/CleanNavigation'
import CleanLayout from '@/components/CleanLayout'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useRouter } from 'next/navigation'
import { Search, MapPin, Clock, Users, Coins, Filter, Star, Briefcase, Award, Target } from 'lucide-react'

// Sample task data
import { comprehensiveTasks } from '../../data/comprehensiveTasks'

// Use the comprehensive 110+ task database
const sampleTasks = comprehensiveTasks

const categories = ['All', 'Transportation', 'Meal Planning', 'Home Organization', 'Mental Wellness', 'Community Support', 'Child Development', 'Education', 'Health & Fitness', 'Financial Education']

export default function MarketplacePage() {
  const { user, isAuthenticated, isVerified } = useAuth()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [selectedType, setSelectedType] = useState('all')
  const [sortBy, setSortBy] = useState('payout')

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

  // Filter and sort tasks
  const filteredTasks = sampleTasks
    .filter(task => 
      selectedCategory === 'All' || task.category === selectedCategory
    )
    .filter(task =>
      selectedType === 'all' || task.type === selectedType
    )
    .filter(task =>
      searchTerm === '' || 
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.category.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'payout') return b.payout - a.payout
      if (sortBy === 'deadline') {
        return new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
      }
      if (sortBy === 'participants') return (a.max_participants - a.current_participants) - (b.max_participants - b.current_participants)
      return 0
    })

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'solo': return 'bg-blue-100 text-blue-800'
      case 'shared': return 'bg-green-100 text-green-800'
      case 'self_care': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getSpotsBadgeColor = (available: number) => {
    if (available === 0) return 'bg-red-100 text-red-800'
    if (available <= 2) return 'bg-yellow-100 text-yellow-800'
    return 'bg-green-100 text-green-800'
  }

  return (
    <CleanLayout>
      <CleanNavigation />
      
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2 text-gray-900">Task Marketplace</h1>
          <p className="text-lg text-gray-600">
            Discover earning opportunities in your community. Join tasks or create your own!
          </p>
        </div>

        {/* Verification Notice */}
        {!isVerified && (
          <Card className="mb-6 border-yellow-200 bg-yellow-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Award className="h-5 w-5 text-yellow-600" />
                <p className="text-yellow-800">
                  <strong>Email verification required</strong> to join tasks and start earning.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Filters */}
        <Card className="card-clean mb-8">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="text-small font-medium">Search Tasks</label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by title, description..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 input-clean"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-small font-medium">Category</label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-small font-medium">Task Type</label>
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="solo">Solo Tasks</SelectItem>
                    <SelectItem value="shared">Shared Tasks</SelectItem>
                    <SelectItem value="self_care">Self-Care</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-small font-medium">Sort By</label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="payout">Highest Payout</SelectItem>
                    <SelectItem value="deadline">Deadline</SelectItem>
                    <SelectItem value="participants">Available Spots</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Task Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="card-clean hover-lift">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-gradient">{filteredTasks.length}</div>
              <div className="text-small text-muted-foreground">Available Tasks</div>
            </CardContent>
          </Card>
          
          <Card className="card-clean">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">
                ${filteredTasks.reduce((sum, task) => sum + task.payout, 0)}
              </div>
              <div className="text-small text-muted-foreground">Total Earnings</div>
            </CardContent>
          </Card>
          
          <Card className="card-clean">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">
                {filteredTasks.reduce((sum, task) => sum + (task.max_participants - task.current_participants), 0)}
              </div>
              <div className="text-small text-muted-foreground">Open Spots</div>
            </CardContent>
          </Card>
          
          <Card className="card-clean">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">
                ${Math.round(filteredTasks.reduce((sum, task) => sum + task.payout, 0) / Math.max(filteredTasks.length, 1))}
              </div>
              <div className="text-small text-muted-foreground">Avg Payout</div>
            </CardContent>
          </Card>
        </div>

        {/* Task Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTasks.map((task) => {
            const availableSpots = task.max_participants - task.current_participants
            const platformFee = Math.round(task.payout * 0.1) // 10% fee for Free users
            const netEarnings = task.payout - platformFee

            return (
              <Card key={task.id} className="hover-lift cursor-pointer card-clean"
                onClick={() => router.push(`/task/${task.id}`)}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex gap-2">
                      <Badge className={getTypeColor(task.type)}>
                        {task.type.replace('_', ' ')}
                      </Badge>

                    </div>
                    <Badge className={getSpotsBadgeColor(availableSpots)}>
                      {availableSpots} spot{availableSpots !== 1 ? 's' : ''} left
                    </Badge>
                  </div>
                  <CardTitle className="text-lg">{task.title}</CardTitle>
                  <CardDescription className="text-small">
                    {task.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Earnings Info */}
                  <div className="bg-muted rounded-lg p-3">
                    <div className="flex justify-between items-center">
                      <span className="text-small text-muted-foreground">Gross Payout</span>
                      <span className="font-semibold">${task.payout}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-small text-muted-foreground">Platform Fee (10%)</span>
                      <span className="text-small text-red-600">-${platformFee}</span>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-border">
                      <span className="font-medium">Net Earnings</span>
                      <span className="font-bold text-green-600">${netEarnings}</span>
                    </div>
                  </div>

                  {/* Task Details */}
                  <div className="space-y-2 text-small">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{task.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>{task.time_commitment}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span>{task.current_participants}/{task.max_participants} participants</span>
                    </div>
                  </div>

                  {/* Action Button */}
                  <Button
                    className="w-full button-clean"
                    onClick={(e) => {
                      e.stopPropagation()
                      router.push(`/task/${task.id}`)
                    }}
                    disabled={!isVerified || availableSpots === 0}
                  >
                    {!isVerified ? 'Verify Email to Join' : 
                     availableSpots === 0 ? 'Task Full' : 'View Details'}
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Empty State */}
        {filteredTasks.length === 0 && (
          <Card className="card-clean">
            <CardContent className="p-12 text-center">
              <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-subheading mb-2">No tasks found</h3>
              <p className="text-body text-muted-foreground mb-6">
                Try adjusting your filters or search terms
              </p>
              <Button 
                onClick={() => router.push('/create-task')}
                className="button-clean"
              >
                Create Your Own Task
              </Button>
            </CardContent>
          </Card>
        )}
      </main>
    </CleanLayout>
  )
}