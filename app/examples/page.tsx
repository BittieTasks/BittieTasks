'use client'

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
    title: "School Pickup Coordination",
    description: "Help coordinate pickup schedules for Lincoln Elementary. Share driving duties with 3 other parents.",
    payout: 35,
    location: "Lincoln Elementary School",
    time_commitment: "30 minutes",
    max_participants: 4,
    current_participants: 2,
    category: { name: "Transportation", color: "bg-orange-100 text-orange-700", icon: Car },
    sponsor: "BittieTasks",
    featured: true
  },
  {
    id: 2,
    title: "Neighborhood Meal Planning Group",
    description: "Join a weekly meal planning session. Share recipes, coordinate bulk buying, and reduce food costs.",
    payout: 42,
    location: "Community Center",
    time_commitment: "1 hour",
    max_participants: 6,
    current_participants: 4,
    category: { name: "Meal Planning", color: "bg-green-100 text-green-700", icon: Heart },
    sponsor: "BittieTasks"
  },
  {
    id: 3,
    title: "After-School Activity Shuttle",
    description: "Coordinate transportation for kids' soccer practice. Share driving responsibilities with other families.",
    payout: 28,
    location: "Riverside Soccer Fields",
    time_commitment: "45 minutes",
    max_participants: 3,
    current_participants: 1,
    category: { name: "Transportation", color: "bg-orange-100 text-orange-700", icon: Car },
    sponsor: "BittieTasks"
  },
  {
    id: 4,
    title: "Homework Support Circle",
    description: "Create a supportive environment where kids help each other with homework while parents supervise.",
    payout: 38,
    location: "Local Library",
    time_commitment: "90 minutes", 
    max_participants: 5,
    current_participants: 3,
    category: { name: "Education", color: "bg-blue-100 text-blue-700", icon: GraduationCap },
    sponsor: "BittieTasks",
    featured: true
  },
  {
    id: 5,
    title: "Grocery Shopping Coordination",
    description: "Organize bulk shopping trips to save money. Coordinate lists and split wholesale purchases.",
    payout: 25,
    location: "Costco Westfield",
    time_commitment: "2 hours",
    max_participants: 4,
    current_participants: 2,
    category: { name: "Shopping", color: "bg-purple-100 text-purple-700", icon: ShoppingBag },
    sponsor: "BittieTasks"
  },
  {
    id: 6,
    title: "Backyard Playgroup Setup",
    description: "Host rotating backyard playdates. Share setup duties and create safe play environments.",
    payout: 32,
    location: "Rotating Backyards",
    time_commitment: "2 hours",
    max_participants: 6,
    current_participants: 4,
    category: { name: "Childcare", color: "bg-pink-100 text-pink-700", icon: Heart },
    sponsor: "BittieTasks"
  }
]

export default function ExamplesPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <a href="/" className="flex items-center space-x-2 text-gray-600 hover:text-teal-600">
                <ArrowLeft size={20} />
                <span>Back</span>
              </a>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-teal-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">B</span>
              </div>
              <span className="text-xl font-semibold text-gray-900">BittieTasks</span>
            </div>
            <a
              href="/auth"
              className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-lg"
            >
              Join Now
            </a>
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
            See the types of tasks parents are sharing in communities like yours. 
            Each task is paid by BittieTasks to help families earn while building connections.
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
                          ${task.payout}
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
                      ${task.payout}
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
            Join thousands of parents who are transforming daily tasks into income opportunities. 
            Sign up today and start earning from community activities.
          </p>
          <a
            href="/auth"
            className="inline-flex items-center justify-center px-8 py-4 bg-teal-600 hover:bg-teal-700 text-white text-lg font-semibold rounded-lg transition-colors"
          >
            Join BittieTasks Now
          </a>
        </div>
      </main>
    </div>
  )
}