'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
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
  ArrowRight
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
              <button onClick={() => router.push('/examples')} className="text-gray-700 hover:text-teal-600 font-medium">
                Examples
              </button>
              <button onClick={() => router.push('/sponsors')} className="text-teal-600 font-medium">
                Sponsors
              </button>
              <button onClick={() => router.push('/auth')} className="px-4 py-2 text-gray-700 hover:text-teal-600 font-medium">
                Sign In
              </button>
            </div>
          </div>
        </div>
      </header>
      
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
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

        {/* Become a Sponsor CTA */}
        <Card className="border-gray-200 text-center">
          <CardContent className="p-8">
            <div className="w-16 h-16 bg-teal-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Briefcase className="h-8 w-8 text-teal-600" />
            </div>
            <h3 className="text-2xl font-bold mb-3">Interested in Becoming a Sponsor?</h3>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Partner with BittieTasks to reach engaged adult communities while supporting meaningful tasks
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button className="bg-teal-600 hover:bg-teal-700 text-white">
                Learn About Sponsorship
              </Button>
              <Button variant="outline" className="border-teal-600 text-teal-600 hover:bg-teal-50">
                Contact Partnership Team
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}