'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { 
  Briefcase, 
  Star, 
  Users, 
  Coins, 
  Shield, 
  Heart,
  TrendingUp,
  CheckCircle,
  Building,
  ArrowRight,
  Crown,
  ArrowLeft,
  Menu
} from 'lucide-react'

// Sample sponsor data
const sampleSponsors = [
  {
    id: '1',
    name: 'HealthTech Solutions',
    logo: '🏥',
    description: 'Leading healthcare technology company focused on community wellness',
    ethicsScore: 92,
    tasksSponsored: 45,
    budget: 15000,
    category: 'Healthcare',
    verified: true,
    values: ['Community Health', 'Adult Wellness', 'Technology Innovation'],
    currentTasks: [
      {
        title: 'Community Fitness Challenge',
        budget: 500,
        participants: 25,
        description: 'Encourage adults to exercise together in their community'
      },
      {
        title: 'Healthy Meal Prep Workshop',
        budget: 750,
        participants: 18,
        description: 'Learn nutritious meal planning for busy adults'
      }
    ]
  },
  {
    id: '2',
    name: 'EcoFriendly Living',
    logo: '🌱',
    description: 'Sustainable living products and environmental education',
    ethicsScore: 89,
    tasksSponsored: 32,
    budget: 8500,
    category: 'Environment',
    verified: true,
    values: ['Sustainability', 'Environmental Education', 'Community Action'],
    currentTasks: [
      {
        title: 'Community Garden Project',
        budget: 400,
        participants: 15,
        description: 'Build and maintain neighborhood gardens'
      }
    ]
  },
  {
    id: '3',
    name: 'TechSkills Academy',
    logo: '💻',
    description: 'Digital literacy and skill development for adults',
    ethicsScore: 95,
    tasksSponsored: 28,
    budget: 12000,
    category: 'Education',
    verified: true,
    values: ['Digital Literacy', 'Skills Development', 'Community Education'],
    currentTasks: [
      {
        title: 'Digital Skills Workshop',
        budget: 600,
        participants: 20,
        description: 'Teach basic computer skills to community members'
      }
    ]
  }
]

export default function SponsorsPage() {
  const router = useRouter()
  
  const getEthicsScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600'
    if (score >= 80) return 'text-blue-600'
    if (score >= 70) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Navigation Header */}
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            onClick={() => router.push('/dashboard')}
            className="flex items-center gap-2 text-gray-700 hover:text-purple-600"
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
              <DropdownMenuItem onClick={() => router.push('/solo')}>
                Solo Tasks
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push('/community')}>
                Community Tasks
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
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Corporate
            <span className="text-teal-600 block">Partners</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Discover ethical partner companies offering sponsored tasks with premium payouts. 
            Join our community to access higher-paying opportunities from trusted sponsors.
          </p>
          <button
            onClick={() => router.push('/auth')}
            className="inline-flex items-center justify-center px-8 py-4 bg-teal-600 hover:bg-teal-700 text-white text-lg font-semibold rounded-lg transition-colors"
          >
            Join to Access Sponsored Tasks
            <ArrowRight size={20} className="ml-2" />
          </button>
        </div>

        {/* Key Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-16">
          <Card className="border-gray-200 hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Building className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Active Sponsors</p>
                  <p className="text-2xl font-bold">{sampleSponsors.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-gray-200 hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <Coins className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Budget</p>
                  <p className="text-2xl font-bold">
                    ${sampleSponsors.reduce((sum, sponsor) => sum + sponsor.budget, 0).toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-gray-200 hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <Star className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Avg Ethics Score</p>
                  <p className="text-2xl font-bold">
                    {Math.round(sampleSponsors.reduce((sum, sponsor) => sum + sponsor.ethicsScore, 0) / sampleSponsors.length)}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-gray-200 hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Tasks Sponsored</p>
                  <p className="text-2xl font-bold">
                    {sampleSponsors.reduce((sum, sponsor) => sum + sponsor.tasksSponsored, 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Benefits Section */}
        <Card className="border-gray-200 mb-16">
          <CardHeader>
            <CardTitle className="text-2xl">Why Choose Sponsored Tasks?</CardTitle>
            <CardDescription>Premium opportunities with ethical partners</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Coins className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Higher Payouts</h3>
                <p className="text-gray-600">
                  Sponsored tasks offer 25-50% higher compensation than standard community tasks
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Ethical Partners</h3>
                <p className="text-gray-600">
                  All sponsors undergo ethics evaluation with minimum 85% score requirement
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Heart className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Community Impact</h3>
                <p className="text-gray-600">
                  Support causes you care about while earning meaningful income
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sponsor Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          {sampleSponsors.map((sponsor) => (
            <Card key={sponsor.id} className="border-gray-200 hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-3xl">{sponsor.logo}</div>
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        {sponsor.name}
                        {sponsor.verified && <CheckCircle className="h-5 w-5 text-green-600" />}
                      </CardTitle>
                      <CardDescription>{sponsor.description}</CardDescription>
                    </div>
                  </div>
                  <Badge className="bg-teal-100 text-teal-800">
                    {sponsor.category}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Ethics Score */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Star className="h-5 w-5 text-yellow-500" />
                    <span className="font-medium">Ethics Score</span>
                  </div>
                  <span className={`font-bold text-lg ${getEthicsScoreColor(sponsor.ethicsScore)}`}>
                    {sponsor.ethicsScore}%
                  </span>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-xl font-bold text-teal-600">{sponsor.tasksSponsored}</div>
                    <div className="text-sm text-gray-600">Tasks Sponsored</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-xl font-bold text-green-600">
                      ${sponsor.budget.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600">Total Budget</div>
                  </div>
                </div>

                {/* Values */}
                <div>
                  <h4 className="font-medium mb-3">Core Values</h4>
                  <div className="flex flex-wrap gap-2">
                    {sponsor.values.map((value, index) => (
                      <Badge key={index} variant="secondary">
                        {value}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Current Tasks */}
                <div>
                  <h4 className="font-medium mb-3">Current Sponsored Tasks</h4>
                  <div className="space-y-3">
                    {sponsor.currentTasks.map((task, index) => (
                      <div key={index} className="p-3 border border-gray-200 rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <h5 className="font-medium">{task.title}</h5>
                          <Badge className="bg-green-100 text-green-800">
                            ${task.budget}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          {task.description}
                        </p>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-gray-500" />
                          <span className="text-sm text-gray-600">
                            {task.participants} participants
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Button */}
                <div className="block">
                  <Button 
                    onClick={() => router.push('/auth')}
                    className="w-full bg-teal-600 hover:bg-teal-700 text-white"
                  >
                    Join to Access Sponsored Tasks
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Partnership Requirements */}
        <Card className="border-gray-200 mb-16">
          <CardHeader>
            <CardTitle className="text-2xl">Partnership Requirements</CardTitle>
            <CardDescription>What we look for in corporate sponsors</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h4 className="font-semibold mb-4 text-lg">Ethics & Values</h4>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium">Minimum 85% Ethics Score</p>
                      <p className="text-sm text-gray-600">Independent evaluation of business practices, employee treatment, and community impact</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium">Community-First Values</p>
                      <p className="text-sm text-gray-600">Demonstrated commitment to supporting local communities and neighborhood wellbeing</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium">Family-Friendly Focus</p>
                      <p className="text-sm text-gray-600">All sponsored tasks must be appropriate for adults and families</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold mb-4 text-lg">Business Requirements</h4>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium">Minimum $5,000 Monthly Budget</p>
                      <p className="text-sm text-gray-600">Commitment to funding meaningful community tasks consistently</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium">12-Month Partnership</p>
                      <p className="text-sm text-gray-600">Minimum commitment to ensure stable opportunities for community members</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium">Verified Business Status</p>
                      <p className="text-sm text-gray-600">Registered business with valid licenses and insurance coverage</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sponsorship Packages */}
        <Card className="border-gray-200 mb-16">
          <CardHeader>
            <CardTitle className="text-2xl">Sponsorship Packages</CardTitle>
            <CardDescription>Choose the partnership level that fits your goals</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Community Partner */}
              <Card className="border-2 border-blue-200 bg-blue-50">
                <CardHeader className="text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Heart className="h-6 w-6 text-blue-600" />
                  </div>
                  <CardTitle className="text-xl">Community Partner</CardTitle>
                  <p className="text-2xl font-bold text-blue-600">$5,000/mo</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm">5-10 sponsored tasks monthly</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm">Company logo on task pages</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm">Monthly performance report</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm">Community impact metrics</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Growth Partner */}
              <Card className="border-2 border-teal-200 bg-teal-50 ring-2 ring-teal-400">
                <CardHeader className="text-center">
                  <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <TrendingUp className="h-6 w-6 text-teal-600" />
                  </div>
                  <CardTitle className="text-xl">Growth Partner</CardTitle>
                  <p className="text-2xl font-bold text-teal-600">$15,000/mo</p>
                  <Badge className="bg-teal-600 text-white">Most Popular</Badge>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm">15-25 sponsored tasks monthly</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm">Featured sponsor placement</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm">Custom task categories</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm">Weekly analytics dashboard</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm">Dedicated account manager</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Enterprise Partner */}
              <Card className="border-2 border-purple-200 bg-purple-50">
                <CardHeader className="text-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Crown className="h-6 w-6 text-purple-600" />
                  </div>
                  <CardTitle className="text-xl">Enterprise Partner</CardTitle>
                  <p className="text-2xl font-bold text-purple-600">$35,000/mo</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm">50+ sponsored tasks monthly</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm">Homepage sponsor highlight</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm">Custom branded task pages</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm">Real-time analytics access</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm">Partnership marketing support</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>

        {/* Success Metrics */}
        <Card className="border-gray-200 mb-16">
          <CardHeader>
            <CardTitle className="text-2xl">Proven Impact Metrics</CardTitle>
            <CardDescription>Results from our current corporate partnerships</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center p-6 bg-green-50 rounded-lg">
                <div className="text-3xl font-bold text-green-600 mb-2">94%</div>
                <p className="text-sm text-gray-600">Task Completion Rate</p>
                <p className="text-xs text-gray-500 mt-1">Higher than industry average</p>
              </div>
              
              <div className="text-center p-6 bg-blue-50 rounded-lg">
                <div className="text-3xl font-bold text-blue-600 mb-2">4.8</div>
                <p className="text-sm text-gray-600">Avg Sponsor Rating</p>
                <p className="text-xs text-gray-500 mt-1">From community participants</p>
              </div>
              
              <div className="text-center p-6 bg-purple-50 rounded-lg">
                <div className="text-3xl font-bold text-purple-600 mb-2">73%</div>
                <p className="text-sm text-gray-600">Brand Recall Increase</p>
                <p className="text-xs text-gray-500 mt-1">In sponsored communities</p>
              </div>
              
              <div className="text-center p-6 bg-orange-50 rounded-lg">
                <div className="text-3xl font-bold text-orange-600 mb-2">2.3x</div>
                <p className="text-sm text-gray-600">Community Engagement</p>
                <p className="text-xs text-gray-500 mt-1">Compared to traditional ads</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Application Process */}
        <Card className="border-gray-200 mb-16">
          <CardHeader>
            <CardTitle className="text-2xl">Partnership Application Process</CardTitle>
            <CardDescription>Simple 4-step process to become a BittieTasks sponsor</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-teal-600 font-bold">1</span>
                </div>
                <h4 className="font-semibold mb-2">Submit Application</h4>
                <p className="text-sm text-gray-600">Complete our online partnership form with company details and goals</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-teal-600 font-bold">2</span>
                </div>
                <h4 className="font-semibold mb-2">Ethics Review</h4>
                <p className="text-sm text-gray-600">Independent evaluation of business practices and community alignment</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-teal-600 font-bold">3</span>
                </div>
                <h4 className="font-semibold mb-2">Partnership Design</h4>
                <p className="text-sm text-gray-600">Collaborative planning of sponsored tasks and community impact goals</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-teal-600 font-bold">4</span>
                </div>
                <h4 className="font-semibold mb-2">Launch & Track</h4>
                <p className="text-sm text-gray-600">Begin sponsoring tasks with full analytics and performance tracking</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Become a Sponsor CTA */}
        <Card className="border-gray-200 text-center">
          <CardContent className="p-8">
            <div className="w-16 h-16 bg-teal-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Briefcase className="h-8 w-8 text-teal-600" />
            </div>
            <h3 className="text-2xl font-bold mb-3">Ready to Partner With Us?</h3>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Join leading companies supporting community growth while building authentic connections with engaged adults
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button className="bg-teal-600 hover:bg-teal-700 text-white">
                Apply for Partnership
              </Button>
              <Button variant="outline" className="border-teal-600 text-teal-600 hover:bg-teal-50">
                Schedule Discovery Call
              </Button>
            </div>
            <p className="text-sm text-gray-500 mt-4">
              Partnership applications typically reviewed within 5-7 business days
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}