'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '../../components/auth/AuthProvider'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useRouter } from 'next/navigation'
import { 
  Briefcase, 
  Star, 
  Users, 
  Coins, 
  Zap, 
  Shield, 
  Heart,
  Globe,
  Award,
  TrendingUp,
  CheckCircle,
  Building
} from 'lucide-react'
import CleanNavigation from '@/components/CleanNavigation'
import CleanLayout from '@/components/CleanLayout'

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
    name: 'SafeKids Initiative',
    logo: '👶',
    description: 'Child safety and development organization',
    ethicsScore: 95,
    tasksSponsored: 28,
    budget: 12000,
    category: 'Child Safety',
    verified: true,
    values: ['Child Protection', 'Safety Education', 'Community Support'],
    currentTasks: [
      {
        title: 'Neighborhood Safety Patrol',
        budget: 600,
        participants: 20,
        description: 'Organize community safety monitoring'
      }
    ]
  }
]

export default function SponsorsPage() {
  const { user, isAuthenticated, isVerified } = useAuth()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted && !isAuthenticated) {
      router.push('/auth')
    }
  }, [mounted, isAuthenticated, router])

  if (!mounted) {
    return null
  }

  if (!isAuthenticated) {
    return null
  }

  const getEthicsScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600'
    if (score >= 80) return 'text-blue-600'
    if (score >= 70) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <CleanLayout>
      <CleanNavigation />
      
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '48px 24px' }}>
        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '36px', fontWeight: 'bold', marginBottom: '8px', color: 'white' }}>Corporate Sponsors</h1>
          <p style={{ fontSize: '18px', color: 'rgba(255, 255, 255, 0.8)' }}>
            Discover ethical partner companies offering sponsored tasks with premium payouts
          </p>
        </div>

        {/* Verification Notice */}
        {!isVerified && (
          <Card className="mb-6 border-yellow-200 bg-yellow-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Award className="h-5 w-5 text-yellow-600" />
                <p className="text-yellow-800">
                  <strong>Premium access requires email verification</strong> to participate in sponsored tasks.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Key Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="card-clean">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Building className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-small text-muted-foreground">Active Sponsors</p>
                  <p className="text-2xl font-bold">{sampleSponsors.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-clean">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <Coins className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-small text-muted-foreground">Total Budget</p>
                  <p className="text-2xl font-bold">
                    ${sampleSponsors.reduce((sum, sponsor) => sum + sponsor.budget, 0).toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-clean">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <Star className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-small text-muted-foreground">Avg Ethics Score</p>
                  <p className="text-2xl font-bold">
                    {Math.round(sampleSponsors.reduce((sum, sponsor) => sum + sponsor.ethicsScore, 0) / sampleSponsors.length)}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-clean">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-small text-muted-foreground">Tasks Sponsored</p>
                  <p className="text-2xl font-bold">
                    {sampleSponsors.reduce((sum, sponsor) => sum + sponsor.tasksSponsored, 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Benefits Section */}
        <Card className="card-clean mb-8">
          <CardHeader>
            <CardTitle className="text-subheading">Why Choose Sponsored Tasks?</CardTitle>
            <CardDescription>Premium opportunities with ethical partners</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Coins className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="font-semibold mb-2">Higher Payouts</h3>
                <p className="text-small text-muted-foreground">
                  Sponsored tasks offer 25-50% higher compensation than standard community tasks
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="font-semibold mb-2">Ethical Partners</h3>
                <p className="text-small text-muted-foreground">
                  All sponsors undergo ethics evaluation with minimum 85% score requirement
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Heart className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="font-semibold mb-2">Community Impact</h3>
                <p className="text-small text-muted-foreground">
                  Support causes you care about while earning meaningful income
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sponsor Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {sampleSponsors.map((sponsor) => (
            <Card key={sponsor.id} className="card-clean">
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
                  <Badge className="badge-success">
                    {sponsor.category}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Ethics Score */}
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
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
                  <div className="text-center p-3 bg-muted rounded-lg">
                    <div className="text-xl font-bold text-primary">{sponsor.tasksSponsored}</div>
                    <div className="text-small text-muted-foreground">Tasks Sponsored</div>
                  </div>
                  <div className="text-center p-3 bg-muted rounded-lg">
                    <div className="text-xl font-bold text-green-600">
                      ${sponsor.budget.toLocaleString()}
                    </div>
                    <div className="text-small text-muted-foreground">Total Budget</div>
                  </div>
                </div>

                {/* Values */}
                <div>
                  <h4 className="font-medium mb-2">Core Values</h4>
                  <div className="flex flex-wrap gap-2">
                    {sponsor.values.map((value, index) => (
                      <Badge key={index} className="badge-neutral">
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
                      <div key={index} className="p-3 border border-border rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <h5 className="font-medium">{task.title}</h5>
                          <Badge className="bg-green-100 text-green-800">
                            ${task.budget}
                          </Badge>
                        </div>
                        <p className="text-small text-muted-foreground mb-2">
                          {task.description}
                        </p>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span className="text-small text-muted-foreground">
                            {task.participants} participants
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Button */}
                <Button
                  className="w-full button-clean"
                  onClick={() => router.push('/marketplace')}
                  disabled={!isVerified}
                >
                  {isVerified ? 'View Sponsored Tasks' : 'Verify Email to Access'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Become a Sponsor CTA */}
        <Card className="card-clean mt-8">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-primary rounded-xl flex items-center justify-center mx-auto mb-4">
              <Briefcase className="h-8 w-8 text-primary-foreground" />
            </div>
            <h3 className="text-subheading mb-2">Interested in Becoming a Sponsor?</h3>
            <p className="text-body text-muted-foreground mb-6 max-w-2xl mx-auto">
              Partner with BittieTasks to reach engaged parent communities while supporting meaningful tasks
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button className="button-clean">
                Learn About Sponsorship
              </Button>
              <Button variant="outline" className="button-outline">
                Contact Partnership Team
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </CleanLayout>
  )
}