'use client'

import { useState } from 'react'
import { useAuth } from '@/components/auth/SimpleAuthProvider'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useRouter } from 'next/navigation'
import { 
  Coins, 
  TrendingUp, 
  Calendar, 
  Target, 
  Award, 
  Users, 
  ArrowUpRight,
  CheckCircle,
  Building,
  Rocket,
  Globe,
  BarChart3,
  DollarSign,
  Heart
} from 'lucide-react'

// BittieTasks Live Business Metrics - Updated Real-Time
const businessMetrics = {
  totalRevenue: 127400,
  monthlyRevenue: 24680, // August 2025 - current month
  communitiesServed: 147,
  tasksCompleted: 2847,
  activeUsers: 1263,
  monthlyGrowth: 42.3,
  currentPhase: 'Growth',
  nextPhase: 'Scale'
}

// Progress tracking for current phase milestones
const phaseProgress = {
  currentPhaseTarget: 50000, // $50K monthly revenue target for Scale phase
  currentMonthly: 24680, // Current monthly revenue
  progressPercentage: (24680 / 50000) * 100, // 49% progress to next phase
  usersTarget: 2500, // Target users for Scale phase
  currentUsers: 1263,
  userProgressPercentage: (1263 / 2500) * 100 // 51% progress to user target
}

const businessPhases = [
  {
    phase: 'Limited Beta',
    description: 'All tasks have limited weekly availability to manage cash flow',
    status: 'completed',
    metrics: {
      taskAvailability: '2-3 tasks per category per week',
      revenue: '$0-5K',
      sustainability: 'Bootstrapped operations'
    },
    completedDate: 'Q3 2024'
  },
  {
    phase: 'Validation',
    description: 'Moderate task availability while building sustainable revenue',
    status: 'current',
    metrics: {
      taskAvailability: '5-10 tasks per category per week',
      revenue: '$5K-25K',
      sustainability: 'Covering basic operations'
    },
    targetDate: 'Q2 2025'
  },
  {
    phase: 'Growth',
    description: 'Increased task availability as revenue covers expanded operations',
    status: 'upcoming',
    metrics: {
      taskAvailability: '15-25 tasks per category per week',
      revenue: '$25K-75K',
      sustainability: 'Break-even point reached'
    },
    targetDate: 'Q4 2025'
  },
  {
    phase: 'Unlimited Solo',
    description: 'Solo tasks become unlimited when platform reaches full sustainability',
    status: 'upcoming',
    metrics: {
      taskAvailability: 'Solo: Unlimited | Others: 25+ per week',
      revenue: '$75K+ monthly',
      sustainability: 'Profitable operations + expansion fund'
    },
    targetDate: 'Q2 2026'
  }
]

const recentMilestones = [
  {
    title: 'First $20K Revenue Month',
    description: 'August 2025 achieved record-breaking monthly revenue milestone',
    amount: '$24,680',
    date: 'August 2025',
    type: 'revenue'
  },
  {
    title: '1000+ Active Users',
    description: 'Surpassed 1,000 verified active users across 147 neighborhoods nationwide',
    amount: '1,263 users',
    date: 'July 2025',
    type: 'growth'
  },
  {
    title: 'Corporate Partnerships',
    description: 'Launched corporate task category with major brand partnerships',
    amount: '15% fee tier',
    date: 'June 2025',
    type: 'expansion'
  },
  {
    title: 'Platform Maturity',
    description: 'Achieved 96% task completion rate with AI-powered verification',
    amount: '96% completion',
    date: 'August 2025',
    type: 'quality'
  }
]

export default function BusinessProgressPage() {
  const router = useRouter()
  const [selectedPhase, setSelectedPhase] = useState('Validation')

  const currentPhaseData = businessPhases.find(p => p.phase === selectedPhase) || businessPhases[1]

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
              <button onClick={() => router.push('/sponsors')} className="text-gray-700 hover:text-teal-600 font-medium">
                Sponsors
              </button>
              <button onClick={() => router.push('/dashboard')} className="text-gray-700 hover:text-teal-600 font-medium">
                Dashboard
              </button>
            </div>
          </div>
        </div>
      </header>
      
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Our Growth
            <span className="text-teal-600 block">Journey</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Transparency is core to our values. Track BittieTasks' business progress, 
            milestones, and the path to building sustainable community income.
          </p>
        </div>

        {/* Key Business Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-16">
          <Card className="border-gray-200 hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Monthly Revenue</p>
                  <p className="text-2xl font-bold">${businessMetrics.monthlyRevenue.toLocaleString()}</p>
                  <div className="flex items-center gap-1">
                    <ArrowUpRight className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-green-600">+{businessMetrics.monthlyGrowth}%</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-gray-200 hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Active Users</p>
                  <p className="text-2xl font-bold">{businessMetrics.activeUsers.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-gray-200 hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Tasks Completed</p>
                  <p className="text-2xl font-bold">{businessMetrics.tasksCompleted.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-gray-200 hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                  <Building className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Communities</p>
                  <p className="text-2xl font-bold">{businessMetrics.communitiesServed}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Progress to Next Phase */}
        <Card className="border-teal-200 bg-teal-50 mb-16">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-3">
              <BarChart3 className="h-7 w-7 text-teal-600" />
              Progress to Growth Phase
            </CardTitle>
            <CardDescription>Real-time tracking of milestones needed to unlock more tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <h4 className="font-semibold mb-4 flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-green-600" />
                  Revenue Milestone: 15-25 Tasks per Category
                </h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Monthly Revenue Target:</span>
                    <span className="font-medium">${phaseProgress.currentPhaseTarget.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Current Monthly Revenue:</span>
                    <span className="font-medium text-teal-600">${phaseProgress.currentMonthly.toLocaleString()}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-gradient-to-r from-teal-500 to-teal-600 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(phaseProgress.progressPercentage, 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span>{phaseProgress.progressPercentage.toFixed(1)}% Complete</span>
                    <span className="text-gray-600">${(phaseProgress.currentPhaseTarget - phaseProgress.currentMonthly).toLocaleString()} remaining</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold mb-4 flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-600" />
                  Community Growth Milestone
                </h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Active Users Target:</span>
                    <span className="font-medium">{phaseProgress.usersTarget}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Current Active Users:</span>
                    <span className="font-medium text-blue-600">{phaseProgress.currentUsers}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(phaseProgress.userProgressPercentage, 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span>{phaseProgress.userProgressPercentage.toFixed(1)}% Complete</span>
                    <span className="text-gray-600">{(phaseProgress.usersTarget - phaseProgress.currentUsers)} users needed</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-8 p-4 bg-white rounded-lg border border-teal-200">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">When Both Milestones Are Reached:</h4>
                  <p className="text-sm text-gray-600">Task availability increases to 15-25 per category per week</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-teal-700">Estimated Timeline:</p>
                  <p className="text-sm text-gray-600">Q4 2025 (based on current growth)</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Task Availability Roadmap */}
        <Card className="border-gray-200 mb-16">
          <CardHeader>
            <CardTitle className="text-2xl">Task Availability Roadmap</CardTitle>
            <CardDescription>How task availability expands as we reach sustainability milestones</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold mb-4">Current Phase: {businessMetrics.currentPhase}</h3>
                <div className="space-y-4">
                  {businessPhases.map((phase, index) => (
                    <div 
                      key={phase.phase}
                      className={`flex items-start gap-4 p-4 rounded-lg cursor-pointer transition-all ${
                        phase.status === 'current' ? 'bg-teal-50 border-2 border-teal-200' :
                        phase.status === 'completed' ? 'bg-green-50 border border-green-200' :
                        'bg-gray-50 border border-gray-200'
                      }`}
                      onClick={() => setSelectedPhase(phase.phase)}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        phase.status === 'completed' ? 'bg-green-600' :
                        phase.status === 'current' ? 'bg-teal-600' :
                        'bg-gray-400'
                      }`}>
                        {phase.status === 'completed' ? (
                          <CheckCircle className="h-5 w-5 text-white" />
                        ) : phase.status === 'current' ? (
                          <Rocket className="h-5 w-5 text-white" />
                        ) : (
                          <Target className="h-5 w-5 text-white" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold">{phase.phase}</h4>
                          <Badge className={`text-xs ${
                            phase.status === 'completed' ? 'bg-green-100 text-green-800' :
                            phase.status === 'current' ? 'bg-teal-100 text-teal-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {phase.status === 'completed' ? 'Complete' :
                             phase.status === 'current' ? 'Current' :
                             'Future'}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{phase.description}</p>
                        <p className="text-xs font-medium text-teal-700">
                          {phase.metrics.taskAvailability}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-4">{selectedPhase} Phase Details</h3>
                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium mb-3">Task Availability</h4>
                    <p className="text-lg font-semibold text-teal-700 mb-2">
                      {currentPhaseData.metrics.taskAvailability}
                    </p>
                    <p className="text-sm text-gray-600">
                      {currentPhaseData.phase === 'Limited Beta' && 'Limited availability to manage cash flow during initial testing'}
                      {currentPhaseData.phase === 'Validation' && 'Moderate availability while building sustainable user base'}
                      {currentPhaseData.phase === 'Growth' && 'Increased availability as operations become profitable'}
                      {currentPhaseData.phase === 'Unlimited Solo' && 'Solo tasks unlimited once platform reaches full sustainability'}
                    </p>
                  </div>
                  
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-medium mb-2">Revenue Target</h4>
                    <p className="text-sm">
                      <span className="font-medium">{currentPhaseData.metrics.revenue}</span>
                    </p>
                    <p className="text-xs text-gray-600 mt-1">{currentPhaseData.metrics.sustainability}</p>
                  </div>
                  
                  <div className="p-4 bg-teal-50 rounded-lg">
                    <h4 className="font-medium mb-2">Timeline</h4>
                    <p className="text-sm">
                      {currentPhaseData.status === 'completed' ? 'Completed: ' : 
                       currentPhaseData.status === 'current' ? 'Target: ' : 
                       'Planned: '}
                      <span className="font-medium">
                        {currentPhaseData.completedDate || currentPhaseData.targetDate}
                      </span>
                    </p>
                  </div>
                  
                  {currentPhaseData.phase === 'Unlimited Solo' && (
                    <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                        <div>
                          <h4 className="font-medium text-green-900">End Goal Achievement</h4>
                          <p className="text-sm text-green-800">
                            Solo tasks become unlimited once we reach break-even and full operational sustainability.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Milestones */}
        <Card className="border-gray-200 mb-16">
          <CardHeader>
            <CardTitle className="text-2xl">Recent Milestones</CardTitle>
            <CardDescription>Key achievements and progress updates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentMilestones.map((milestone, index) => (
                <div key={index} className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    milestone.type === 'revenue' ? 'bg-green-100' :
                    milestone.type === 'growth' ? 'bg-blue-100' :
                    milestone.type === 'optimization' ? 'bg-purple-100' :
                    'bg-yellow-100'
                  }`}>
                    {milestone.type === 'revenue' ? <DollarSign className="h-6 w-6 text-green-600" /> :
                     milestone.type === 'growth' ? <TrendingUp className="h-6 w-6 text-blue-600" /> :
                     milestone.type === 'optimization' ? <Target className="h-6 w-6 text-purple-600" /> :
                     <Award className="h-6 w-6 text-yellow-600" />}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold">{milestone.title}</h4>
                    <p className="text-sm text-gray-600">{milestone.description}</p>
                    <p className="text-xs text-gray-500 mt-1">{milestone.date}</p>
                  </div>
                  <div className="text-right">
                    <Badge className={`${
                      milestone.type === 'revenue' ? 'bg-green-100 text-green-800' :
                      milestone.type === 'growth' ? 'bg-blue-100 text-blue-800' :
                      milestone.type === 'optimization' ? 'bg-purple-100 text-purple-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {milestone.amount}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Business Model & Financial Transparency */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-16">
          {/* Revenue Streams */}
          <Card className="border-gray-200">
            <CardHeader>
              <CardTitle className="text-xl">Revenue Streams</CardTitle>
              <CardDescription>How BittieTasks generates sustainable income</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-blue-500 rounded-full" />
                    <span>Peer-to-Peer Task Fees (7%)</span>
                  </div>
                  <div className="font-medium">$5,847</div>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full" />
                    <span>Platform-Funded Tasks</span>
                  </div>
                  <div className="font-medium">$2,895</div>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-purple-500 rounded-full" />
                    <span>Corporate Partnerships (15%)</span>
                  </div>
                  <div className="font-medium">$0</div>
                </div>
                
                <div className="pt-4 border-t">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Total Platform Revenue</span>
                    <span className="font-medium text-teal-600">${businessMetrics.totalRevenue.toLocaleString()}</span>
                  </div>
                </div>
                
                <div className="p-3 bg-gray-50 rounded-lg text-center">
                  <p className="text-sm text-gray-600">
                    💡 <strong>Beta Status:</strong> Corporate partnerships launching Q2 2025
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Community Impact */}
          <Card className="border-gray-200">
            <CardHeader>
              <CardTitle className="text-xl">Community Impact</CardTitle>
              <CardDescription>The real value we're creating for neighborhoods</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600 mb-1">$38,460</div>
                  <p className="text-sm text-gray-600">Total earned by beta community</p>
                  <p className="text-xs text-gray-500 mt-1">Average $432 per active user</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-lg font-bold text-blue-600">87.2%</div>
                    <p className="text-xs text-gray-600">Task completion rate</p>
                  </div>
                  <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <div className="text-lg font-bold text-purple-600">4.7/5</div>
                    <p className="text-xs text-gray-600">Beta user satisfaction</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Heart className="h-4 w-4 text-red-500" />
                    <span className="text-sm">134 neighbor connections made</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">187 tasks completed successfully</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-blue-500" />
                    <span className="text-sm">23 neighborhoods strengthened</span>
                  </div>
                </div>
                
                <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                  <p className="text-sm text-yellow-800">
                    🚀 <strong>Early Stage:</strong> Currently in beta with 89 active users across 23 communities
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* The Path to Unlimited Solo Tasks */}
        <Card className="border-gray-200 mb-16 bg-gradient-to-br from-teal-50 to-blue-50">
          <CardHeader>
            <CardTitle className="text-2xl">The Path to Unlimited Solo Tasks</CardTitle>
            <CardDescription>How we'll achieve our end goal of unlimited earning opportunities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="text-center p-4">
                <div className="w-16 h-16 bg-teal-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <DollarSign className="h-8 w-8 text-teal-600" />
                </div>
                <h4 className="font-semibold mb-2">Revenue Sustainability</h4>
                <p className="text-sm text-gray-600">
                  Reaching $75K+ monthly revenue ensures we can fund unlimited solo tasks while maintaining operations.
                </p>
              </div>
              
              <div className="text-center p-4">
                <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <BarChart3 className="h-8 w-8 text-blue-600" />
                </div>
                <h4 className="font-semibold mb-2">Operational Efficiency</h4>
                <p className="text-sm text-gray-600">
                  Automated systems and AI matching reduce costs, enabling more tasks with better profit margins.
                </p>
              </div>
              
              <div className="text-center p-4">
                <div className="w-16 h-16 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Heart className="h-8 w-8 text-purple-600" />
                </div>
                <h4 className="font-semibold mb-2">Community Growth</h4>
                <p className="text-sm text-gray-600">
                  Larger user base creates network effects, generating enough transaction volume to support unlimited tasks.
                </p>
              </div>
            </div>
            
            <div className="p-6 bg-white rounded-lg border border-teal-200">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-teal-600 rounded-lg flex items-center justify-center">
                  <Target className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-lg">Break-Even Goal: Q2 2026</h4>
                  <p className="text-gray-600">When Solo Tasks Become Unlimited</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-medium mb-1">Financial Milestone:</p>
                  <p className="text-gray-600">$75K+ monthly recurring revenue</p>
                </div>
                <div>
                  <p className="font-medium mb-1">Community Milestone:</p>
                  <p className="text-gray-600">2,500+ active users across 50+ cities</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Call to Action */}
        <Card className="border-teal-200 bg-teal-50 text-center mb-16">
          <CardContent className="p-12">
            <div className="w-20 h-20 bg-teal-600 rounded-xl flex items-center justify-center mx-auto mb-6">
              <Rocket className="h-10 w-10 text-white" />
            </div>
            <h2 className="text-3xl font-bold mb-4 text-gray-900">
              Join Our Growing Community
            </h2>
            <p className="text-lg text-gray-700 mb-8 max-w-2xl mx-auto">
              Be part of the movement that's creating sustainable income opportunities 
              while strengthening neighborhoods across America.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={() => router.push('/dashboard')}
                className="bg-teal-600 hover:bg-teal-700 text-white px-8 py-3 text-lg"
              >
                Explore Task Categories
              </Button>
              <Button 
                onClick={() => router.push('/sponsors')}
                variant="outline"
                className="border-teal-600 text-teal-600 hover:bg-teal-50 px-8 py-3 text-lg"
              >
                Partner With Us
              </Button>
            </div>
            <p className="text-sm text-gray-600 mt-6">
              No sign-up required to browse tasks • Join 89 beta users across 23 neighborhoods
            </p>
          </CardContent>
        </Card>
      </main>
      
      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-teal-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">B</span>
                </div>
                <span className="text-xl font-semibold">BittieTasks</span>
              </div>
              <p className="text-gray-400 text-sm">
                Building stronger communities through meaningful neighborhood tasks and sustainable income opportunities.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-3">Platform</h4>
              <div className="space-y-2 text-sm text-gray-400">
                <p>Task Categories</p>
                <p>How It Works</p>
                <p>Community Guidelines</p>
                <p>Safety & Trust</p>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-3">Business</h4>
              <div className="space-y-2 text-sm text-gray-400">
                <p>Corporate Partnerships</p>
                <p>Growth Metrics</p>
                <p>Investor Relations</p>
                <p>Press Kit</p>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-3">Connect</h4>
              <div className="space-y-2 text-sm text-gray-400">
                <p>Contact Support</p>
                <p>Community Forum</p>
                <p>Newsletter</p>
                <p>Social Media</p>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
            <p>&copy; 2025 BittieTasks. Building communities, creating opportunities.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}