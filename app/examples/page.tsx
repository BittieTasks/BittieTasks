'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  ArrowLeft,
  Coins, 
  MapPin, 
  Clock, 
  Users,
  Star,
  Briefcase,
  Heart,
  Home,
  Car,
  ShoppingBag,
  GraduationCap
} from 'lucide-react'

const exampleTasks = [
  {
    id: 1,
    title: "Community Fitness Walk Group",
    description: "Join a weekly walking group for adults. Share motivation and track fitness goals together with neighbors.",
    payout: 35,
    location: "Riverside Park Trail",
    time_commitment: "45 minutes",
    max_participants: 6,
    current_participants: 3,
    task_category: "Community",
    payment_source: "BittieTasks",
    category: { name: "Community", color: "bg-blue-100 text-blue-700", icon: Users },
    featured: true
  },
  {
    id: 2,
    title: "Weekly Self-Care Walks",
    description: "Join a group of adults for weekly wellness walks. Track steps and earn rewards for maintaining healthy habits.",
    payout: 30,
    location: "Local Park Trail",
    time_commitment: "45 minutes",
    max_participants: 1,
    current_participants: 1,
    task_category: "Self Care",
    payment_source: "Corporate Partnership",
    category: { name: "Self Care", color: "bg-green-100 text-green-700", icon: Heart },
    featured: true
  },
  {
    id: 3,
    title: "Photography Skills for Web Design Help",
    description: "Trade photography lessons for website design assistance. Equal time exchange between skilled adults.",
    payout: 0,
    location: "Local Coffee Shop",
    time_commitment: "2 hours",
    max_participants: 2,
    current_participants: 1,
    task_category: "Barter",
    payment_source: "Peer-to-peer",
    category: { name: "Barter", color: "bg-purple-100 text-purple-700", icon: ShoppingBag },
    barter_note: "Skills exchange - no money involved"
  },
  {
    id: 4,
    title: "Complete Online Consumer Survey",
    description: "Share insights about household shopping habits for market research. Complete at your own pace.",
    payout: 45,
    location: "Online",
    time_commitment: "30 minutes", 
    max_participants: 1,
    current_participants: 1,
    task_category: "Solo",
    payment_source: "Corporate Partnership",
    category: { name: "Solo", color: "bg-yellow-100 text-yellow-700", icon: Star }
  },
  {
    id: 5,
    title: "Neighborhood Watch Coordination",
    description: "Organize monthly neighborhood safety meetings. Coordinate with local residents and police liaison.",
    payout: 35,
    location: "Community Center",
    time_commitment: "90 minutes",
    max_participants: 8,
    current_participants: 3,
    task_category: "Community",
    payment_source: "Peer-to-peer",
    category: { name: "Community", color: "bg-blue-100 text-blue-700", icon: Users }
  },
  {
    id: 6,
    title: "Daily Meditation Check-in",
    description: "Maintain a daily 10-minute meditation practice. Track progress and earn wellness rewards.",
    payout: 25,
    location: "At Home",
    time_commitment: "10 minutes daily",
    max_participants: 1,
    current_participants: 1,
    task_category: "Self Care",
    payment_source: "BittieTasks",
    category: { name: "Self Care", color: "bg-green-100 text-green-700", icon: Heart }
  }
]

export default function ExamplesPage() {
  const router = useRouter()
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <button onClick={() => router.push('/')} className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-teal-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">B</span>
              </div>
              <span className="text-xl font-semibold text-gray-900">BittieTasks</span>
            </button>
            
            {/* Navigation Links */}
            <div className="flex items-center space-x-6">
              <button onClick={() => router.push('/examples')} className="text-teal-600 font-medium">
                Examples
              </button>
              <button onClick={() => router.push('/sponsors')} className="text-gray-700 hover:text-teal-600 font-medium">
                Sponsors
              </button>
              <button onClick={() => router.push('/auth')} className="px-4 py-2 text-gray-700 hover:text-teal-600 font-medium">
                Sign In
              </button>
            </div>
          </div>
        </div>
      </header>
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <button onClick={() => router.push('/')} className="flex items-center space-x-2 text-gray-600 hover:text-teal-600">
                <ArrowLeft size={20} />
                <span>Back</span>
              </button>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-teal-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">B</span>
              </div>
              <span className="text-xl font-semibold text-gray-900">BittieTasks</span>
            </div>
            <button
              onClick={() => router.push('/auth')}
              className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-lg"
            >
              Join Now
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Real Earning Opportunities
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            See the types of tasks adults are sharing in communities like yours. 
            Each task is paid by BittieTasks to help neighbors earn while building connections.
          </p>
          <div className="inline-flex items-center space-x-2 bg-teal-50 text-teal-700 px-4 py-2 rounded-lg">
            <Briefcase size={20} />
            <span className="font-medium">All tasks sponsored by BittieTasks</span>
          </div>
        </div>

        {/* Featured Tasks */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Featured Opportunities</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {exampleTasks.filter(task => task.featured).map((task) => {
              const IconComponent = task.category.icon
              return (
                <Card key={task.id} className="border-2 border-teal-200 hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <Badge className={`${task.category.color} border-0`}>
                            <IconComponent size={14} className="mr-1" />
                            {task.category.name}
                          </Badge>
                          <Badge className="bg-amber-100 text-amber-700 border-0">
                            <Star size={12} className="mr-1" />
                            Featured
                          </Badge>
                        </div>
                        <CardTitle className="text-lg text-gray-900 mb-2">{task.title}</CardTitle>
                        <div className="flex items-center text-teal-600 font-semibold text-lg">
                          <Coins size={18} className="mr-1" />
                          {task.barter_note ? task.barter_note : `$${task.payout}`}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-4">{task.description}</p>
                    <div className="space-y-2 text-sm text-gray-500">
                      <div className="flex items-center">
                        <MapPin size={16} className="mr-2" />
                        {task.location}
                      </div>
                      <div className="flex items-center">
                        <Clock size={16} className="mr-2" />
                        {task.time_commitment}
                      </div>
                      <div className="flex items-center">
                        <Users size={16} className="mr-2" />
                        {task.current_participants} of {task.max_participants} participants
                      </div>
                      <div className="flex items-center">
                        <Briefcase size={16} className="mr-2" />
                        Paid by: {task.payment_source}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>

        {/* All Tasks */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">More Opportunities</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {exampleTasks.filter(task => !task.featured).map((task) => {
              const IconComponent = task.category.icon
              return (
                <Card key={task.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <Badge className={`${task.category.color} border-0`}>
                        <IconComponent size={14} className="mr-1" />
                        {task.category.name}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg text-gray-900 mb-2">{task.title}</CardTitle>
                    <div className="flex items-center text-teal-600 font-semibold">
                      <Coins size={16} className="mr-1" />
                      {task.barter_note ? task.barter_note : `$${task.payout}`}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 text-sm mb-4">{task.description}</p>
                    <div className="space-y-1 text-xs text-gray-500">
                      <div className="flex items-center">
                        <MapPin size={14} className="mr-2" />
                        {task.location}
                      </div>
                      <div className="flex items-center">
                        <Clock size={14} className="mr-2" />
                        {task.time_commitment}
                      </div>
                      <div className="flex items-center">
                        <Briefcase size={14} className="mr-2" />
                        {task.payment_source}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-white rounded-xl p-12 shadow-sm border border-gray-200">
          <h3 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to Start Earning?
          </h3>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Join thousands of adults who are transforming daily tasks into income opportunities. 
            Sign up today and start earning from community activities.
          </p>
          <button
            onClick={() => router.push('/auth')}
            className="inline-flex items-center justify-center px-8 py-4 bg-teal-600 hover:bg-teal-700 text-white text-lg font-semibold rounded-lg transition-colors"
          >
            Join BittieTasks Now
          </button>
        </div>
      </main>
    </div>
  )
}