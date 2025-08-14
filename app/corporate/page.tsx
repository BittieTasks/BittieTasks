'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MapPin, Clock, DollarSign, Building2, Award, Users } from 'lucide-react'
import TaskApplicationModal from '@/components/TaskApplicationModal'

interface CorporateTask {
  id: string
  title: string
  description: string
  price: number
  sponsor: string
  sponsorLogo: string
  location: string
  timeEstimate: string
  category: string
  difficulty: 'Easy' | 'Medium' | 'Hard'
  applicants: number
  maxApplicants: number
  requirements: string[]
  benefits: string[]
}

const corporateTasks: CorporateTask[] = [
  {
    id: 'corp-1',
    title: 'Product Review & Social Media Post',
    description: 'Try our new eco-friendly cleaning products and share an honest review on your social media. Must have 100+ followers.',
    price: 50,
    sponsor: 'GreenClean Co.',
    sponsorLogo: 'GC',
    location: 'Remote/Home',
    timeEstimate: '2 hours',
    category: 'Marketing',
    difficulty: 'Easy',
    applicants: 23,
    maxApplicants: 50,
    requirements: ['100+ social media followers', 'Smartphone with camera'],
    benefits: ['Free product samples', 'Bonus for high engagement']
  },
  {
    id: 'corp-2',
    title: 'Local Business Photography',
    description: 'Take high-quality photos of our storefront and products for marketing materials. Professional camera preferred.',
    price: 125,
    sponsor: 'Artisan Bakery',
    sponsorLogo: 'AB',
    location: 'Downtown Bakery',
    timeEstimate: '3 hours',
    category: 'Photography',
    difficulty: 'Medium',
    applicants: 8,
    maxApplicants: 15,
    requirements: ['Photography portfolio', 'Professional camera or high-end smartphone'],
    benefits: ['Portfolio credit', 'Free baked goods']
  },
  {
    id: 'corp-3',
    title: 'Market Research Survey Team',
    description: 'Conduct street interviews about coffee preferences for our new café location. Training provided.',
    price: 75,
    sponsor: 'Urban Coffee Co.',
    sponsorLogo: 'UC',
    location: 'City Center',
    timeEstimate: '4 hours',
    category: 'Research',
    difficulty: 'Easy',
    applicants: 15,
    maxApplicants: 25,
    requirements: ['Good communication skills', 'Tablet provided'],
    benefits: ['Full training session', 'Free coffee for a month']
  },
  {
    id: 'corp-4',
    title: 'App Beta Testing Champion',
    description: 'Test our new fitness app for 2 weeks, document bugs, and provide detailed feedback. Must be active fitness enthusiast.',
    price: 200,
    sponsor: 'FitTech Solutions',
    sponsorLogo: 'FT',
    location: 'Remote',
    timeEstimate: '2 weeks',
    category: 'Technology',
    difficulty: 'Medium',
    applicants: 42,
    maxApplicants: 100,
    requirements: ['Smartphone', 'Active lifestyle', 'Detail-oriented'],
    benefits: ['Premium app access', 'Fitness tracker bonus']
  },
  {
    id: 'corp-5',
    title: 'Community Event Ambassador',
    description: 'Represent our brand at local farmers market, engage with customers, and distribute samples. Weekend commitment.',
    price: 150,
    sponsor: 'Organic Harvest',
    sponsorLogo: 'OH',
    location: 'Farmers Market',
    timeEstimate: '6 hours',
    category: 'Events',
    difficulty: 'Easy',
    applicants: 19,
    maxApplicants: 30,
    requirements: ['Outgoing personality', 'Weekend availability'],
    benefits: ['Organic produce samples', 'Brand ambassador certification']
  },
  {
    id: 'corp-6',
    title: 'Website Accessibility Testing',
    description: 'Test our website for accessibility compliance and user experience. Technical knowledge of web standards required.',
    price: 175,
    sponsor: 'TechForward Inc.',
    sponsorLogo: 'TF',
    location: 'Remote',
    timeEstimate: '8 hours',
    category: 'Technology',
    difficulty: 'Hard',
    applicants: 6,
    maxApplicants: 12,
    requirements: ['Web accessibility knowledge', 'Screen reader experience'],
    benefits: ['Professional reference', 'Accessibility certification']
  }
]

export default function CorporatePage() {
  const [selectedTask, setSelectedTask] = useState<CorporateTask | null>(null)
  const [showApplicationModal, setShowApplicationModal] = useState(false)

  const handleApplyClick = (task: CorporateTask) => {
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

  const getProgressPercentage = (applicants: number, max: number) => {
    return Math.round((applicants / max) * 100)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Corporate Partnerships
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Work with trusted brands on sponsored tasks. Higher payouts with just 15% platform fee. 
            Build professional relationships and gain valuable experience.
          </p>
        </div>

        {/* Stats Bar */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{corporateTasks.length}</div>
              <div className="text-sm text-gray-600">Active Partnerships</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">$129</div>
              <div className="text-sm text-gray-600">Average Payout</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{corporateTasks.reduce((sum, t) => sum + t.applicants, 0)}</div>
              <div className="text-sm text-gray-600">Total Applicants</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">85%</div>
              <div className="text-sm text-gray-600">Your Take-Home</div>
            </div>
          </div>
        </div>

        {/* Task Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {corporateTasks.map((task) => (
            <Card key={task.id} className="hover:shadow-lg transition-all duration-200 border-0 shadow-md">
              <CardHeader className="pb-4">
                <div className="flex justify-between items-start mb-2">
                  <Badge className={getDifficultyColor(task.difficulty)} variant="outline">
                    {task.difficulty}
                  </Badge>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Users className="w-3 h-3" />
                    {task.applicants}/{task.maxApplicants}
                  </div>
                </div>
                
                {/* Sponsor Info */}
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {task.sponsorLogo}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-purple-700">{task.sponsor}</div>
                    <div className="text-xs text-gray-500">Verified Partner</div>
                  </div>
                </div>

                <CardTitle className="text-lg line-clamp-2">{task.title}</CardTitle>
                <CardDescription className="line-clamp-3">
                  {task.description}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
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
                    <Building2 className="w-4 h-4" />
                    {task.category}
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Applications</span>
                    <span>{getProgressPercentage(task.applicants, task.maxApplicants)}% filled</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-purple-600 h-2 rounded-full transition-all duration-200" 
                      style={{ width: `${getProgressPercentage(task.applicants, task.maxApplicants)}%` }}
                    ></div>
                  </div>
                </div>

                {/* Benefits */}
                <div className="space-y-2">
                  <div className="text-sm font-medium text-gray-700 flex items-center gap-1">
                    <Award className="w-4 h-4" />
                    Benefits:
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {task.benefits.slice(0, 2).map((benefit, index) => (
                      <Badge key={index} variant="secondary" className="text-xs bg-purple-50 text-purple-700">
                        {benefit}
                      </Badge>
                    ))}
                    {task.benefits.length > 2 && (
                      <Badge variant="secondary" className="text-xs">
                        +{task.benefits.length - 2} more
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Price and Action */}
                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="flex items-center gap-1">
                    <DollarSign className="w-5 h-5 text-green-600" />
                    <span className="font-bold text-xl text-green-600">${task.price}</span>
                    <div className="text-xs text-gray-500 ml-1">
                      <div>You earn: ${Math.round(task.price * 0.85)}</div>
                    </div>
                  </div>
                  <Button 
                    onClick={() => handleApplyClick(task)}
                    disabled={task.applicants >= task.maxApplicants}
                    data-testid={`button-apply-${task.id}`}
                  >
                    {task.applicants >= task.maxApplicants ? 'Full' : 'Apply Now'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Application Modal */}
        {selectedTask && (
          <TaskApplicationModal
            task={{
              id: selectedTask.id,
              title: selectedTask.title,
              description: selectedTask.description,
              category: selectedTask.category,
              type: 'corporate',
              payout: selectedTask.price,
              location: selectedTask.location,
              time_commitment: selectedTask.timeEstimate,
              requirements: selectedTask.requirements,
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