'use client'

import { useState } from 'react'
import { useAuth } from '../../components/auth/AuthProvider'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useRouter } from 'next/navigation'
import { 
  Briefcase, 
  Star, 
  Users, 
  DollarSign, 
  Zap, 
  Shield, 
  Heart,
  Globe,
  Award,
  TrendingUp,
  CheckCircle,
  Building
} from 'lucide-react'

// Mock data for corporate sponsors
const mockSponsors = [
  {
    id: '1',
    name: 'HealthTech Solutions',
    logo: '🏥',
    description: 'Leading healthcare technology company focused on family wellness',
    ethicsScore: 92,
    tasksSponsored: 45,
    budget: 15000,
    category: 'Healthcare',
    verified: true,
    values: ['Family Health', 'Community Wellness', 'Technology Innovation'],
    currentTasks: [
      {
        title: 'Family Fitness Challenge',
        budget: 500,
        participants: 25,
        description: 'Encourage families to exercise together'
      },
      {
        title: 'Healthy Meal Prep Workshop',
        budget: 750,
        participants: 18,
        description: 'Learn nutritious meal planning for busy families'
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
    name: 'SafeKids Initiative',
    logo: '🛡️',
    description: 'Child safety and family security solutions',
    ethicsScore: 95,
    tasksSponsored: 28,
    budget: 12000,
    category: 'Safety',
    verified: true,
    values: ['Child Safety', 'Family Security', 'Community Protection'],
    currentTasks: [
      {
        title: 'Neighborhood Safety Walks',
        budget: 300,
        participants: 22,
        description: 'Organize community safety patrol groups'
      }
    ]
  }
]

const ethicsMetrics = [
  { label: 'DEI Leadership', weight: 25 },
  { label: 'Environmental Impact', weight: 20 },
  { label: 'Labor Practices', weight: 20 },
  { label: 'Community Investment', weight: 15 },
  { label: 'LGBTQ+ Support', weight: 10 },
  { label: 'Transparency', weight: 10 }
]

export default function SponsorsPage() {
  const { user, isAuthenticated, isVerified } = useAuth()
  const router = useRouter()
  const [selectedSponsor, setSelectedSponsor] = useState<string | null>(null)

  if (!isAuthenticated) {
    router.push('/auth')
    return null
  }

  const getEthicsColor = (score: number) => {
    if (score >= 90) return 'text-green-400'
    if (score >= 80) return 'text-yellow-400'
    if (score >= 70) return 'text-orange-400'
    return 'text-red-400'
  }

  const getEthicsBadgeColor = (score: number) => {
    if (score >= 90) return 'bg-green-500/20 text-green-400 border-green-500/20'
    if (score >= 80) return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/20'
    if (score >= 70) return 'bg-orange-500/20 text-orange-400 border-orange-500/20'
    return 'bg-red-500/20 text-red-400 border-red-500/20'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <div className="px-6 pt-8 pb-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-6">
            <div className="inline-flex items-center space-x-2 bg-purple-500/20 text-purple-300 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Building className="w-4 h-4" />
              <span>Ethical Corporate Partners</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Corporate Sponsorship Portal
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-3xl">
              Partner with ethically-evaluated companies that align with community values and family well-being. Every sponsor is vetted for ethics, diversity, and community impact.
            </p>

            {/* Key Metrics */}
            <div className="grid md:grid-cols-4 gap-6">
              <div className="bg-gray-700/30 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-2">
                  <Shield className="h-5 w-5 text-green-400" />
                  <div>
                    <p className="text-gray-400 text-sm">Ethics Rating</p>
                    <p className="text-xl font-bold text-white">92%</p>
                    <p className="text-green-400 text-xs">Average score</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-700/30 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-2">
                  <Briefcase className="h-5 w-5 text-blue-400" />
                  <div>
                    <p className="text-gray-400 text-sm">Active Sponsors</p>
                    <p className="text-xl font-bold text-white">{mockSponsors.length}</p>
                    <p className="text-blue-400 text-xs">Verified partners</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-700/30 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-2">
                  <DollarSign className="h-5 w-5 text-purple-400" />
                  <div>
                    <p className="text-gray-400 text-sm">Total Budget</p>
                    <p className="text-xl font-bold text-white">
                      ${mockSponsors.reduce((sum, sponsor) => sum + sponsor.budget, 0).toLocaleString()}
                    </p>
                    <p className="text-purple-400 text-xs">Available funding</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-700/30 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-2">
                  <Users className="h-5 w-5 text-yellow-400" />
                  <div>
                    <p className="text-gray-400 text-sm">Tasks Sponsored</p>
                    <p className="text-xl font-bold text-white">
                      {mockSponsors.reduce((sum, sponsor) => sum + sponsor.tasksSponsored, 0)}
                    </p>
                    <p className="text-yellow-400 text-xs">Community impact</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 pb-12">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Ethics Evaluation Process */}
          <Card className="bg-gray-800/50 backdrop-blur-sm border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Award className="h-5 w-5" />
                Our Ethics Evaluation Process
              </CardTitle>
              <CardDescription className="text-gray-400">
                Every corporate partner is evaluated across multiple criteria to ensure alignment with community values
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-4">
                {ethicsMetrics.map((metric, index) => (
                  <div key={index} className="text-center p-3 bg-gray-700/30 rounded-lg">
                    <div className="text-2xl mb-2">
                      {index === 0 && '🤝'}
                      {index === 1 && '🌍'}
                      {index === 2 && '⚖️'}
                      {index === 3 && '❤️'}
                      {index === 4 && '🏳️‍🌈'}
                      {index === 5 && '📊'}
                    </div>
                    <h4 className="text-white font-semibold text-sm mb-1">{metric.label}</h4>
                    <p className="text-gray-400 text-xs">{metric.weight}% weight</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Sponsor Cards */}
          <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {mockSponsors.map((sponsor) => (
              <Card 
                key={sponsor.id} 
                className="bg-gray-800/50 backdrop-blur-sm border-gray-700 hover:border-gray-600 transition-all duration-200"
              >
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="text-3xl">{sponsor.logo}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-white font-bold">{sponsor.name}</h3>
                        {sponsor.verified && (
                          <CheckCircle className="w-4 h-4 text-green-400" />
                        )}
                      </div>
                      <Badge className="bg-gray-600 text-gray-300 text-xs">
                        {sponsor.category}
                      </Badge>
                    </div>
                    <Badge className={getEthicsBadgeColor(sponsor.ethicsScore)}>
                      <Star className="w-3 h-3 mr-1" />
                      {sponsor.ethicsScore}%
                    </Badge>
                  </div>
                  
                  <p className="text-gray-400 text-sm mb-4">{sponsor.description}</p>
                  
                  {/* Company Values */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {sponsor.values.map((value, index) => (
                      <Badge key={index} className="bg-blue-500/20 text-blue-400 border-blue-500/20 text-xs">
                        {value}
                      </Badge>
                    ))}
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Sponsor Metrics */}
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-gray-400 text-xs">Budget</p>
                      <p className="text-white font-semibold">${(sponsor.budget / 1000)}k</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-xs">Tasks</p>
                      <p className="text-white font-semibold">{sponsor.tasksSponsored}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-xs">Rating</p>
                      <p className={`font-semibold ${getEthicsColor(sponsor.ethicsScore)}`}>
                        {sponsor.ethicsScore}%
                      </p>
                    </div>
                  </div>

                  {/* Current Tasks */}
                  <div>
                    <h4 className="text-white font-semibold text-sm mb-2">Current Sponsored Tasks</h4>
                    <div className="space-y-2">
                      {sponsor.currentTasks.map((task, index) => (
                        <div key={index} className="bg-gray-700/30 rounded p-2">
                          <div className="flex justify-between items-start mb-1">
                            <h5 className="text-white text-xs font-semibold">{task.title}</h5>
                            <span className="text-green-400 text-xs font-semibold">${task.budget}</span>
                          </div>
                          <p className="text-gray-400 text-xs mb-1">{task.description}</p>
                          <div className="flex items-center gap-2">
                            <Users className="w-3 h-3 text-gray-400" />
                            <span className="text-gray-400 text-xs">{task.participants} participants</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-2 gap-2">
                    <Button 
                      className="text-xs bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 border-blue-500/20"
                      disabled={!isVerified}
                    >
                      View Tasks
                    </Button>
                    <Button 
                      className="text-xs bg-green-500/20 hover:bg-green-500/30 text-green-400 border-green-500/20"
                      disabled={!isVerified}
                    >
                      Partner Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Partnership Benefits */}
          <div className="grid lg:grid-cols-2 gap-8">
            <Card className="bg-gray-800/50 backdrop-blur-sm border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Heart className="h-5 w-5 text-red-400" />
                  Community Benefits
                </CardTitle>
                <CardDescription className="text-gray-400">
                  How corporate partnerships benefit our families
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-500/20 rounded flex items-center justify-center">
                    <DollarSign className="w-4 h-4 text-green-400" />
                  </div>
                  <div>
                    <h4 className="text-white font-semibold text-sm">Higher Earnings</h4>
                    <p className="text-gray-400 text-xs">Sponsored tasks offer 25-50% higher payouts</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-500/20 rounded flex items-center justify-center">
                    <Users className="w-4 h-4 text-blue-400" />
                  </div>
                  <div>
                    <h4 className="text-white font-semibold text-sm">Community Impact</h4>
                    <p className="text-gray-400 text-xs">Tasks focused on health, education, and wellness</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-purple-500/20 rounded flex items-center justify-center">
                    <Shield className="w-4 h-4 text-purple-400" />
                  </div>
                  <div>
                    <h4 className="text-white font-semibold text-sm">Ethical Standards</h4>
                    <p className="text-gray-400 text-xs">All partners meet strict ethics and values criteria</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-yellow-500/20 rounded flex items-center justify-center">
                    <Award className="w-4 h-4 text-yellow-400" />
                  </div>
                  <div>
                    <h4 className="text-white font-semibold text-sm">Exclusive Access</h4>
                    <p className="text-gray-400 text-xs">Premium members get early access to sponsored tasks</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/50 backdrop-blur-sm border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-400" />
                  Earning Opportunities
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Current sponsored task categories
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-700/30 rounded p-3 text-center">
                    <div className="text-lg mb-1">💪</div>
                    <h4 className="text-white font-semibold text-sm">Wellness</h4>
                    <p className="text-green-400 text-xs">$45-75 avg</p>
                  </div>
                  <div className="bg-gray-700/30 rounded p-3 text-center">
                    <div className="text-lg mb-1">🌱</div>
                    <h4 className="text-white font-semibold text-sm">Environment</h4>
                    <p className="text-green-400 text-xs">$30-50 avg</p>
                  </div>
                  <div className="bg-gray-700/30 rounded p-3 text-center">
                    <div className="text-lg mb-1">📚</div>
                    <h4 className="text-white font-semibold text-sm">Education</h4>
                    <p className="text-green-400 text-xs">$40-65 avg</p>
                  </div>
                  <div className="bg-gray-700/30 rounded p-3 text-center">
                    <div className="text-lg mb-1">🛡️</div>
                    <h4 className="text-white font-semibold text-sm">Safety</h4>
                    <p className="text-green-400 text-xs">$35-55 avg</p>
                  </div>
                </div>
                
                <Button 
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 border-0"
                  onClick={() => router.push('/marketplace')}
                  disabled={!isVerified}
                >
                  Browse Sponsored Tasks
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Verification Notice */}
          {!isVerified && (
            <Card className="bg-yellow-500/10 border-yellow-500/20 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <Shield className="h-6 w-6 text-yellow-500" />
                  <div>
                    <h3 className="text-yellow-500 font-semibold">Email Verification Required</h3>
                    <p className="text-gray-300">Complete email verification to access sponsored tasks and corporate partnership opportunities.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}