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
import { useRouter } from 'next/navigation'
import { useToast } from '../../hooks/use-toast'
import { MapPin, Clock, Users, DollarSign, Calendar, AlertCircle, CheckCircle, Info } from 'lucide-react'
import Navigation from '@/components/Navigation'

const categories = [
  { id: 'childcare', name: 'Childcare', icon: '👶', description: 'School pickups, babysitting, playdates' },
  { id: 'shopping', name: 'Shopping', icon: '🛒', description: 'Grocery runs, bulk shopping, errands' },
  { id: 'transportation', name: 'Transportation', icon: '🚗', description: 'Carpools, airport runs, deliveries' },
  { id: 'household', name: 'Household', icon: '🏠', description: 'Cleaning, maintenance, organization' },
  { id: 'educational', name: 'Educational', icon: '📚', description: 'Tutoring, lessons, study groups' },
  { id: 'wellness', name: 'Wellness', icon: '💪', description: 'Fitness, yoga, health activities' },
  { id: 'pets', name: 'Pet Care', icon: '🐕', description: 'Walking, sitting, grooming' },
  { id: 'events', name: 'Events', icon: '🎉', description: 'Parties, gatherings, celebrations' }
]

const taskTypes = [
  { 
    id: 'shared', 
    name: 'Shared Task', 
    description: 'Split costs and effort with neighbors',
    icon: '🤝',
    color: 'blue'
  },
  { 
    id: 'solo', 
    name: 'Solo Opportunity', 
    description: 'Individual earning opportunity',
    icon: '⭐',
    color: 'green'
  }
]

export default function CreateTaskPage() {
  const { user, isAuthenticated, isVerified } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [mounted, setMounted] = useState(false)
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    type: 'shared',
    earningPotential: '',
    maxParticipants: '2',
    location: '',
    duration: '',
    requirements: '',
    scheduledDate: '',
    scheduledTime: ''
  })
  
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(1)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  if (!isAuthenticated) {
    router.push('/auth')
    return null
  }

  if (!isVerified) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center px-6">
        <Card className="max-w-md bg-gray-800/50 backdrop-blur-sm border-gray-700">
          <CardContent className="p-8 text-center">
            <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Email Verification Required</h2>
            <p className="text-gray-400 mb-6">
              You need to verify your email address before creating tasks.
            </p>
            <Button 
              onClick={() => router.push('/platform')}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 border-0"
            >
              Go to Platform
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Here we would submit to the API
      console.log('Task data:', formData)
      
      toast({
        title: 'Task Created Successfully!',
        description: 'Your task has been posted to the marketplace.',
      })
      
      router.push('/marketplace')
    } catch (error) {
      toast({
        title: 'Error Creating Task',
        description: 'Please try again later.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'shared': return 'bg-blue-500/20 text-blue-400 border-blue-500/20'
      case 'solo': return 'bg-green-500/20 text-green-400 border-green-500/20'
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/20'
    }
  }

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <div className="px-6 pt-8 pb-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-6">
            <h1 className="text-3xl font-bold text-white mb-2">Create New Task</h1>
            <p className="text-gray-400">Share your activities and start earning with your community</p>
            
            {/* Progress Steps */}
            <div className="flex items-center gap-4 mt-6">
              {[1, 2, 3].map((num) => (
                <div key={num} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                    step >= num 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-700 text-gray-400'
                  }`}>
                    {step > num ? <CheckCircle className="w-4 h-4" /> : num}
                  </div>
                  {num < 3 && (
                    <div className={`w-12 h-1 mx-2 ${
                      step > num ? 'bg-blue-500' : 'bg-gray-700'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="px-6 pb-12">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSubmit}>
            {step === 1 && (
              <Card className="bg-gray-800/50 backdrop-blur-sm border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Task Details</CardTitle>
                  <CardDescription className="text-gray-400">
                    Tell us about your task and what you need help with
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Title */}
                  <div className="space-y-2">
                    <Label htmlFor="title" className="text-gray-300">Task Title *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      placeholder="e.g., School Pickup Share for Westfield Elementary"
                      className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                      required
                    />
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-gray-300">Description *</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      placeholder="Describe what you need help with, when, and how it benefits everyone involved..."
                      className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 h-32"
                      required
                    />
                  </div>

                  {/* Category */}
                  <div className="space-y-2">
                    <Label className="text-gray-300">Category *</Label>
                    <div className="grid md:grid-cols-4 gap-3">
                      {categories.map((category) => (
                        <button
                          key={category.id}
                          type="button"
                          onClick={() => handleInputChange('category', category.id)}
                          className={`p-3 rounded-lg border text-left transition-all ${
                            formData.category === category.id
                              ? 'border-blue-500 bg-blue-500/20 text-blue-400'
                              : 'border-gray-600 bg-gray-700/50 text-gray-300 hover:border-gray-500'
                          }`}
                        >
                          <div className="text-lg mb-1">{category.icon}</div>
                          <div className="font-semibold text-sm">{category.name}</div>
                          <div className="text-xs text-gray-400">{category.description}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Task Type */}
                  <div className="space-y-2">
                    <Label className="text-gray-300">Task Type *</Label>
                    <div className="grid md:grid-cols-2 gap-4">
                      {taskTypes.map((type) => (
                        <button
                          key={type.id}
                          type="button"
                          onClick={() => handleInputChange('type', type.id)}
                          className={`p-4 rounded-lg border text-left transition-all ${
                            formData.type === type.id
                              ? 'border-blue-500 bg-blue-500/20 text-blue-400'
                              : 'border-gray-600 bg-gray-700/50 text-gray-300 hover:border-gray-500'
                          }`}
                        >
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-xl">{type.icon}</span>
                            <span className="font-semibold">{type.name}</span>
                          </div>
                          <p className="text-sm text-gray-400">{type.description}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button
                      type="button"
                      onClick={() => setStep(2)}
                      className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 border-0"
                      disabled={!formData.title || !formData.description || !formData.category}
                    >
                      Next: Logistics
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {step === 2 && (
              <Card className="bg-gray-800/50 backdrop-blur-sm border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Logistics & Timing</CardTitle>
                  <CardDescription className="text-gray-400">
                    Set the practical details for your task
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Location */}
                    <div className="space-y-2">
                      <Label htmlFor="location" className="text-gray-300 flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        Location *
                      </Label>
                      <Input
                        id="location"
                        value={formData.location}
                        onChange={(e) => handleInputChange('location', e.target.value)}
                        placeholder="e.g., Westfield Elementary School"
                        className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                        required
                      />
                    </div>

                    {/* Duration */}
                    <div className="space-y-2">
                      <Label htmlFor="duration" className="text-gray-300 flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        Duration *
                      </Label>
                      <Input
                        id="duration"
                        value={formData.duration}
                        onChange={(e) => handleInputChange('duration', e.target.value)}
                        placeholder="e.g., 30 minutes daily, 2 hours weekly"
                        className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Scheduled Date */}
                    <div className="space-y-2">
                      <Label htmlFor="scheduledDate" className="text-gray-300 flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        Start Date *
                      </Label>
                      <Input
                        id="scheduledDate"
                        type="date"
                        value={formData.scheduledDate}
                        onChange={(e) => handleInputChange('scheduledDate', e.target.value)}
                        className="bg-gray-700 border-gray-600 text-white"
                        required
                      />
                    </div>

                    {/* Time */}
                    <div className="space-y-2">
                      <Label htmlFor="scheduledTime" className="text-gray-300">Start Time</Label>
                      <Input
                        id="scheduledTime"
                        type="time"
                        value={formData.scheduledTime}
                        onChange={(e) => handleInputChange('scheduledTime', e.target.value)}
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                    </div>
                  </div>

                  {/* Max Participants */}
                  <div className="space-y-2">
                    <Label htmlFor="maxParticipants" className="text-gray-300 flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Maximum Participants
                    </Label>
                    <Select value={formData.maxParticipants} onValueChange={(value) => handleInputChange('maxParticipants', value)}>
                      <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-700 border-gray-600">
                        {[1,2,3,4,5,6,8,10,15,20].map(num => (
                          <SelectItem key={num} value={num.toString()} className="text-white hover:bg-gray-600">
                            {num} {num === 1 ? 'person' : 'people'}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Requirements */}
                  <div className="space-y-2">
                    <Label htmlFor="requirements" className="text-gray-300">Special Requirements</Label>
                    <Textarea
                      id="requirements"
                      value={formData.requirements}
                      onChange={(e) => handleInputChange('requirements', e.target.value)}
                      placeholder="Any specific requirements, skills needed, or important details..."
                      className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                    />
                  </div>

                  <div className="flex justify-between">
                    <Button
                      type="button"
                      onClick={() => setStep(1)}
                      variant="outline"
                      className="border-gray-600 bg-gray-700 text-gray-300 hover:bg-gray-600"
                    >
                      Back
                    </Button>
                    <Button
                      type="button"
                      onClick={() => setStep(3)}
                      className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 border-0"
                      disabled={!formData.location || !formData.duration || !formData.scheduledDate}
                    >
                      Next: Earnings
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {step === 3 && (
              <Card className="bg-gray-800/50 backdrop-blur-sm border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Earnings & Review</CardTitle>
                  <CardDescription className="text-gray-400">
                    Set the earning potential and review your task
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Earning Potential */}
                  <div className="space-y-2">
                    <Label htmlFor="earningPotential" className="text-gray-300 flex items-center gap-2">
                      <DollarSign className="w-4 h-4" />
                      Earning Potential Per Person *
                    </Label>
                    <div className="relative">
                      <span className="absolute left-3 top-3 text-gray-400">$</span>
                      <Input
                        id="earningPotential"
                        type="number"
                        step="0.01"
                        min="1"
                        value={formData.earningPotential}
                        onChange={(e) => handleInputChange('earningPotential', e.target.value)}
                        placeholder="25.00"
                        className="pl-8 bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                        required
                      />
                    </div>
                    <p className="text-sm text-gray-400">
                      Suggest a fair amount based on time saved, costs split, or value provided
                    </p>
                  </div>

                  {/* Earnings Breakdown */}
                  {formData.earningPotential && (
                    <div className="bg-gray-700/30 rounded-lg p-4">
                      <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                        <Info className="w-4 h-4" />
                        Earnings Breakdown
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Potential per participant:</span>
                          <span className="text-white">${parseFloat(formData.earningPotential || '0').toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Platform fee (10%):</span>
                          <span className="text-red-400">-${(parseFloat(formData.earningPotential || '0') * 0.1).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between border-t border-gray-600 pt-2">
                          <span className="text-gray-400">You earn per participant:</span>
                          <span className="text-green-400 font-semibold">
                            ${(parseFloat(formData.earningPotential || '0') * 0.9).toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Total potential ({formData.maxParticipants} participants):</span>
                          <span className="text-green-400 font-semibold">
                            ${(parseFloat(formData.earningPotential || '0') * 0.9 * parseInt(formData.maxParticipants)).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Task Preview */}
                  <div className="bg-gray-700/30 rounded-lg p-4">
                    <h4 className="text-white font-semibold mb-3">Task Preview</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Badge className={getTypeColor(formData.type)}>
                          {formData.type.charAt(0).toUpperCase() + formData.type.slice(1)}
                        </Badge>
                        {formData.category && (
                          <Badge className="bg-gray-600 text-gray-300">
                            {categories.find(c => c.id === formData.category)?.name}
                          </Badge>
                        )}
                      </div>
                      <h5 className="text-white font-semibold">{formData.title || 'Task Title'}</h5>
                      <p className="text-gray-400">{formData.description || 'Task description...'}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-400">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {formData.location || 'Location'}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formData.duration || 'Duration'}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          0/{formData.maxParticipants}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <Button
                      type="button"
                      onClick={() => setStep(2)}
                      variant="outline"
                      className="border-gray-600 bg-gray-700 text-gray-300 hover:bg-gray-600"
                    >
                      Back
                    </Button>
                    <Button
                      type="submit"
                      className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 border-0"
                      disabled={loading || !formData.earningPotential}
                    >
                      {loading ? 'Creating...' : 'Create Task'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </form>
        </div>
      </div>
    </div>
    </>
  )
}