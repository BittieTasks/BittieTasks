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

const platformTaskTemplates = [
  { title: '30-Minute Neighborhood Walk', payout: 15, description: 'Complete a 30-minute walk in your neighborhood and document with photos', verification: ['photo', 'gps_tracking', 'time_tracking'] },
  { title: 'Try a New Local Business', payout: 20, description: 'Visit a local business you\'ve never been to and write a review', verification: ['photo', 'receipt_upload', 'social_proof'] },
  { title: 'Community Cleanup Activity', payout: 25, description: 'Spend 1 hour cleaning up a public area in your neighborhood', verification: ['photo', 'gps_tracking', 'time_tracking'] },
  { title: 'Learn Something New', payout: 30, description: 'Complete an online course or tutorial and share what you learned', verification: ['photo', 'video', 'social_proof'] },
  { title: 'Home Organization Project', payout: 20, description: 'Organize a room or area in your house with before/after photos', verification: ['photo'] }
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
  const [showPlatformTasks, setShowPlatformTasks] = useState(false)

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
    return Math.round(payout * 0.1) // 10% for Free users
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

          <Card className={`cursor-pointer transition-all hover:shadow-lg ${showPlatformTasks ? 'ring-2 ring-primary' : ''}`}
                onClick={() => setShowPlatformTasks(true)}>
            <CardContent className="p-6 text-center">
              <Coins className="h-8 w-8 mx-auto mb-3 text-green-600" />
              <h3 className="font-semibold mb-2">Platform-Funded Tasks</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Complete pre-made tasks funded by BittieTasks. Instant earnings!
              </p>
              <Badge className="bg-green-100 text-green-800">BittieTasks Pays You</Badge>
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
                    <span>Platform Fee (10%)</span>
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