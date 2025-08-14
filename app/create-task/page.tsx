'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '../../components/auth/AuthProvider'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import CleanNavigation from '@/components/CleanNavigation'
import CleanLayout from '@/components/CleanLayout'
import { useRouter } from 'next/navigation'
import { 
  PlusCircle, 
  Users, 
  Clock, 
  MapPin, 
  Coins, 
  Calendar,
  CheckCircle,
  Award,
  Target,
  Heart
} from 'lucide-react'

const categories = [
  'Transportation', 'Meal Planning', 'Home Organization', 'Mental Wellness', 
  'Community Support', 'Child Development', 'Education', 'Health & Fitness',
  'Event Planning', 'Safety & Preparedness', 'Financial Education'
]

const taskTypes = [
  { value: 'peer_to_peer', label: 'Peer-to-Peer Task', description: 'Community members help each other - You pay the helper directly', revenueStream: 'peer_to_peer' },
  { value: 'solo', label: 'Solo Task', description: 'Individual task completed independently', revenueStream: 'peer_to_peer' },
  { value: 'shared', label: 'Shared Task', description: 'Collaborative task with other community members', revenueStream: 'peer_to_peer' },
  { value: 'self_care', label: 'Self-Care Task', description: 'Personal wellness with optional accountability partners', revenueStream: 'peer_to_peer' }
]

// Task templates based on successful solo tasks for peer-to-peer collaboration
const peerToPeerTaskTemplates = [
  { 
    title: 'Grocery Shopping & Delivery', 
    payout: 35, 
    description: 'Shop for groceries from provided list and deliver to community member. Must have reliable transportation and attention to detail.',
    category: 'Delivery',
    timeEstimate: '2 hours',
    requiredSkills: ['Reliable transport', 'Attention to detail'],
    maxParticipants: 1
  },
  { 
    title: 'Pet Walking Service', 
    payout: 25, 
    description: 'Walk friendly pets for community members. Perfect for animal lovers who want flexible earning opportunities.',
    category: 'Pet Care',
    timeEstimate: '1 hour',
    requiredSkills: ['Love for animals', 'Physical fitness'],
    maxParticipants: 1
  },
  { 
    title: 'Furniture Assembly Help', 
    payout: 75, 
    description: 'Assemble furniture for community members. Must bring own tools and have assembly experience.',
    category: 'Handyman',
    timeEstimate: '4 hours',
    requiredSkills: ['Tool ownership', 'Assembly experience', 'Physical strength'],
    maxParticipants: 2
  },
  { 
    title: 'Garden Maintenance', 
    payout: 45, 
    description: 'Weed flower beds and prune shrubs for community members. Knowledge of plants preferred but not required.',
    category: 'Gardening',
    timeEstimate: '3 hours',
    requiredSkills: ['Physical stamina', 'Basic gardening knowledge'],
    maxParticipants: 2
  },
  { 
    title: 'House Cleaning Service', 
    payout: 85, 
    description: 'Deep clean homes for community members including bathrooms, kitchen, and living areas. Cleaning supplies provided.',
    category: 'Cleaning',
    timeEstimate: '5 hours',
    requiredSkills: ['Attention to detail', 'Physical stamina'],
    maxParticipants: 2
  },
  { 
    title: 'Computer Repair & Setup', 
    payout: 65, 
    description: 'Diagnose and fix computer issues, set up new software, and provide training to community members.',
    category: 'Technology',
    timeEstimate: '2.5 hours',
    requiredSkills: ['Computer expertise', 'Patience', 'Teaching ability'],
    maxParticipants: 1
  }
]

export default function CreateTaskPage() {
  const { user, isAuthenticated, isVerified } = useAuth()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    type: '',
    revenueStream: 'peer_to_peer', // Default to peer-to-peer
    payout: '',
    maxParticipants: '',
    deadline: '',
    location: '',
    timeCommitment: '',
    requirements: '',
    verificationMethods: [] as string[]
  })
  const [showTaskTemplates, setShowTaskTemplates] = useState(false)

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

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          category: formData.category,
          type: formData.type,
          earningPotential: parseFloat(formData.payout),
          maxParticipants: parseInt(formData.maxParticipants) || 1,
          location: formData.location,
          duration: formData.timeCommitment,
          requirements: formData.requirements
        })
      })

      if (response.ok) {
        const result = await response.json()
        
        // Show approval status to user
        if (result.approvalStatus === 'auto_approved') {
          alert('Task created and automatically approved! It\'s now live in the marketplace.')
        } else if (result.approvalStatus === 'manual_review') {
          alert('Task created successfully! It\'s under review and will be published once approved.')
        } else {
          alert('Task created! Approval status: ' + result.approvalStatus)
        }
        
        router.push('/marketplace')
      } else {
        const error = await response.json()
        alert('Failed to create task: ' + (error.message || 'Unknown error'))
      }
    } catch (error) {
      console.error('Error creating task:', error)
      alert('Failed to create task. Please try again.')
    }
  }

  const calculatePlatformFee = (payout: number) => {
    return Math.round(payout * 0.07) // 7% for peer-to-peer tasks
  }

  const applyTaskTemplate = (template: any) => {
    setFormData(prev => ({
      ...prev,
      title: template.title,
      description: template.description,
      category: template.category,
      payout: template.payout.toString(),
      timeCommitment: template.timeEstimate,
      maxParticipants: template.maxParticipants.toString(),
      requirements: template.requiredSkills.join(', ')
    }))
    setShowTaskTemplates(false)
  }

  return (
    <CleanLayout>
      <CleanNavigation />
      
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '48px 24px' }}>
        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '36px', fontWeight: 'bold', marginBottom: '8px', color: 'white' }}>Create New Task</h1>
          <p style={{ fontSize: '18px', color: 'rgba(255, 255, 255, 0.8)' }}>
            Choose how you want to create earnings in your community
          </p>
        </div>

        {/* Task Type Selection */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className={`cursor-pointer transition-all hover:shadow-lg ${formData.revenueStream === 'peer_to_peer' ? 'ring-2 ring-primary' : ''}`}
                onClick={() => setFormData(prev => ({ ...prev, revenueStream: 'peer_to_peer' }))}>
            <CardContent className="p-6 text-center">
              <Users className="h-8 w-8 mx-auto mb-3 text-blue-600" />
              <h3 className="font-semibold mb-2">Peer-to-Peer Tasks</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Create tasks for neighbors to help each other. You pay helpers directly.
              </p>
              <Badge className="bg-blue-100 text-blue-800">You Pay Helper</Badge>
            </CardContent>
          </Card>

          <Card className={`cursor-pointer transition-all hover:shadow-lg ${showTaskTemplates ? 'ring-2 ring-primary' : ''}`}
                onClick={() => setShowTaskTemplates(true)}>
            <CardContent className="p-6 text-center">
              <Coins className="h-8 w-8 mx-auto mb-3 text-green-600" />
              <h3 className="font-semibold mb-2">Use Task Templates</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Start with proven task templates from successful peer-to-peer tasks.
              </p>
              <Badge className="bg-green-100 text-green-800">Browse Templates</Badge>
            </CardContent>
          </Card>

          <Card className="cursor-pointer transition-all hover:shadow-lg opacity-60">
            <CardContent className="p-6 text-center">
              <Award className="h-8 w-8 mx-auto mb-3 text-purple-600" />
              <h3 className="font-semibold mb-2">Corporate Sponsored</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Business partnership tasks. Higher payouts for brand activities.
              </p>
              <Badge className="bg-purple-100 text-purple-800">Coming Soon</Badge>
            </CardContent>
          </Card>
        </div>

        {/* Verification Notice */}
        {!isVerified && (
          <Card className="mb-6 border-yellow-200 bg-yellow-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Award className="h-5 w-5 text-yellow-600" />
                <p className="text-yellow-800">
                  <strong>Email verification required</strong> to create and publish tasks.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Task Templates Modal */}
        {showTaskTemplates && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[80vh] overflow-y-auto">
              <div className="p-6 border-b">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold">Choose a Task Template</h2>
                  <Button variant="ghost" onClick={() => setShowTaskTemplates(false)}>
                    ✕
                  </Button>
                </div>
                <p className="text-muted-foreground mt-2">
                  Based on successful peer-to-peer tasks. Click any template to get started.
                </p>
              </div>
              <div className="p-6">
                <div className="grid gap-4 md:grid-cols-2">
                  {peerToPeerTaskTemplates.map((template, index) => (
                    <Card key={index} className="cursor-pointer hover:shadow-lg transition-all" onClick={() => applyTaskTemplate(template)}>
                      <CardHeader>
                        <CardTitle className="text-lg">{template.title}</CardTitle>
                        <div className="flex gap-2 flex-wrap">
                          <Badge variant="outline">{template.category}</Badge>
                          <Badge variant="outline">${template.payout}</Badge>
                          <Badge variant="outline">{template.timeEstimate}</Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground mb-3">
                          {template.description}
                        </p>
                        <div className="space-y-2">
                          <p className="text-xs font-medium">Required Skills:</p>
                          <div className="flex gap-1 flex-wrap">
                            {template.requiredSkills.map((skill: string, skillIndex: number) => (
                              <Badge key={skillIndex} variant="secondary" className="text-xs">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2">
            <Card className="card-clean">
              <CardHeader>
                <CardTitle className="text-subheading">Task Details</CardTitle>
                <CardDescription>Provide clear information to attract the right participants</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Basic Information */}
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Task Title *</Label>
                      <Input
                        id="title"
                        placeholder="e.g., School Pickup Share for Elementary Kids"
                        value={formData.title}
                        onChange={(e) => handleInputChange('title', e.target.value)}
                        className="input-clean"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Description *</Label>
                      <Textarea
                        id="description"
                        placeholder="Describe what the task involves, expectations, and any special requirements..."
                        value={formData.description}
                        onChange={(e) => handleInputChange('description', e.target.value)}
                        className="min-h-24"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="category">Category *</Label>
                        <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
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
                        <Label htmlFor="type">Task Type *</Label>
                        <Select value={formData.type} onValueChange={(value) => handleInputChange('type', value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            {taskTypes.map(type => (
                              <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  {/* Logistics */}
                  <div className="space-y-4">
                    <h3 className="font-semibold">Logistics</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="payout">Total Payout ($) *</Label>
                        <Input
                          id="payout"
                          type="number"
                          placeholder="50"
                          value={formData.payout}
                          onChange={(e) => handleInputChange('payout', e.target.value)}
                          className="input-clean"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="maxParticipants">Max Participants *</Label>
                        <Input
                          id="maxParticipants"
                          type="number"
                          placeholder="4"
                          value={formData.maxParticipants}
                          onChange={(e) => handleInputChange('maxParticipants', e.target.value)}
                          className="input-clean"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="deadline">Deadline</Label>
                        <Input
                          id="deadline"
                          type="date"
                          value={formData.deadline}
                          onChange={(e) => handleInputChange('deadline', e.target.value)}
                          className="input-clean"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="timeCommitment">Time Commitment</Label>
                        <Input
                          id="timeCommitment"
                          placeholder="e.g., 2 hours weekly"
                          value={formData.timeCommitment}
                          onChange={(e) => handleInputChange('timeCommitment', e.target.value)}
                          className="input-clean"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="location">Location/Format</Label>
                      <Input
                        id="location"
                        placeholder="e.g., Downtown Elementary, Virtual/Online, Your Home"
                        value={formData.location}
                        onChange={(e) => handleInputChange('location', e.target.value)}
                        className="input-clean"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="requirements">Requirements (Optional)</Label>
                      <Textarea
                        id="requirements"
                        placeholder="Any specific skills, equipment, or qualifications needed..."
                        value={formData.requirements}
                        onChange={(e) => handleInputChange('requirements', e.target.value)}
                        className="min-h-20"
                      />
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Button
                      type="submit"
                      className="button-clean"
                      disabled={!isVerified || !formData.title || !formData.description}
                    >
                      {isVerified ? 'Create Task' : 'Verify Email to Create'}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => router.push('/marketplace')}
                      className="button-outline"
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Task Type Info */}
            {formData.type && (
              <Card className="card-clean">
                <CardHeader>
                  <CardTitle className="text-lg">
                    {taskTypes.find(t => t.value === formData.type)?.label}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-small text-muted-foreground">
                    {taskTypes.find(t => t.value === formData.type)?.description}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Payout Breakdown */}
            {formData.payout && (
              <Card className="card-clean">
                <CardHeader>
                  <CardTitle className="text-lg">Payout Breakdown</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span>Total Payout</span>
                    <span className="font-semibold">${formData.payout}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Platform Fee (7%)</span>
                    <span className="text-red-600">
                      -${calculatePlatformFee(parseInt(formData.payout) || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between pt-2 border-t font-semibold">
                    <span>Your Cost</span>
                    <span className="text-green-600">
                      ${(parseInt(formData.payout) || 0) + calculatePlatformFee(parseInt(formData.payout) || 0)}
                    </span>
                  </div>
                  <p className="text-small text-muted-foreground">
                    <span className="text-primary cursor-pointer" onClick={() => router.push('/subscribe')}>
                      Upgrade your plan
                    </span> to reduce platform fees
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Task Templates */}
            <Card className="card-clean">
              <CardHeader>
                <CardTitle className="text-lg">Task Templates</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-small text-muted-foreground mb-3">
                  Use proven task templates based on successful peer-to-peer tasks
                </p>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => setShowTaskTemplates(true)}
                >
                  Browse Templates
                </Button>
              </CardContent>
            </Card>

            {/* Tips */}
            <Card className="card-clean">
              <CardHeader>
                <CardTitle className="text-lg">Tips for Success</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-small">Be specific</p>
                    <p className="text-small text-muted-foreground">Clear descriptions attract the right participants</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-small">Fair compensation</p>
                    <p className="text-small text-muted-foreground">Consider time investment and local rates</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-small">Set expectations</p>
                    <p className="text-small text-muted-foreground">Include timing, location, and requirements</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Community Guidelines */}
            <Card className="card-clean">
              <CardHeader>
                <CardTitle className="text-lg">Community Guidelines</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-small text-muted-foreground">
                  • Tasks must be legal and family-friendly
                </p>
                <p className="text-small text-muted-foreground">
                  • Respect all community members
                </p>
                <p className="text-small text-muted-foreground">
                  • Provide accurate task descriptions
                </p>
                <p className="text-small text-muted-foreground">
                  • Complete tasks as committed
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </CleanLayout>
  )
}