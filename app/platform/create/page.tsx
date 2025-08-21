'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../../components/auth/SimpleAuthProvider'
import { supabase } from '../../../lib/supabase'
import CleanLayout from '../../../components/CleanLayout'
import { Button } from '../../../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card'
import { Input } from '../../../components/ui/input'
import { Textarea } from '../../../components/ui/textarea'
import { Label } from '../../../components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select'
import { useToast } from '../@/app/hooks/use-toast'
import { ArrowLeft, Coins, MapPin, Clock, Users } from 'lucide-react'

interface CreateTaskForm {
  title: string
  description: string
  category_id: string
  task_type: 'shared' | 'solo' | 'sponsored'
  payout: string
  max_participants: string
  location: string
  time_commitment: string
  deadline: string
  requirements: string
}

export default function CreateTask() {
  const router = useRouter()
  const { user, loading: authLoading, isAuthenticated } = useAuth()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState<Array<{id: string, name: string}>>([])
  const [formData, setFormData] = useState<CreateTaskForm>({
    title: '',
    description: '',
    category_id: '',
    task_type: 'shared',
    payout: '',
    max_participants: '1',
    location: '',
    time_commitment: '',
    deadline: '',
    requirements: ''
  })

  useEffect(() => {
    loadCategories()
  }, [])
  
  // Redirect to auth if not authenticated
  if (!authLoading && !isAuthenticated) {
    router.push('/auth')
    return null
  }
  
  // Show loading state while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  const loadCategories = async () => {
    try {
      const response = await fetch('/api/categories')
      if (response.ok) {
        const { categories } = await response.json()
        setCategories(categories)
      }
    } catch (error) {
      console.error('Error loading categories:', error)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Validate form
      if (!formData.title.trim() || !formData.description.trim() || !formData.category_id || 
          !formData.payout || !formData.location.trim()) {
        throw new Error('Please fill in all required fields')
      }

      const payout = parseFloat(formData.payout)
      if (isNaN(payout) || payout <= 0) {
        throw new Error('Please enter a valid payout amount')
      }

      const maxParticipants = parseInt(formData.max_participants)
      if (isNaN(maxParticipants) || maxParticipants <= 0) {
        throw new Error('Please enter a valid number of participants')
      }

      if (!user) {
        throw new Error('Authentication required')
      }

      // Get session for API authentication
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        throw new Error('Please sign in again to create tasks')
      }

      // Submit to API
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create task')
      }

      toast({
        title: 'Task Created Successfully!',
        description: 'Your task has been posted to the marketplace.',
      })

      // Navigate back to marketplace
      router.push('/platform')
    } catch (error: any) {
      toast({
        title: 'Error Creating Task',
        description: error.message || 'Could not create task. Please try again.',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <CleanLayout>
      <div className="min-h-screen bg-gray-50 pb-20">
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-3xl mx-auto px-4 py-6">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                onClick={() => router.back()}
                className="p-2"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                  Create New Task
                </h1>
                <p className="text-gray-600 mt-1">
                  Post a task for your community to join and earn together
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="max-w-3xl mx-auto px-4 py-6">
          <Card className="bg-white shadow-sm border border-gray-200">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Task Details</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Info */}
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title" className="text-sm font-medium">
                      Task Title *
                    </Label>
                    <Input
                      id="title"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      placeholder="e.g., School Pickup Carpool"
                      className="mt-1"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="description" className="text-sm font-medium">
                      Description *
                    </Label>
                    <Textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="Describe what help you need and any important details..."
                      className="mt-1 min-h-24"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Category *</Label>
                      <Select 
                        value={formData.category_id} 
                        onValueChange={(value) => handleSelectChange('category_id', value)}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map(category => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-sm font-medium">Task Type</Label>
                      <Select 
                        value={formData.task_type} 
                        onValueChange={(value) => handleSelectChange('task_type', value)}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="shared">Shared (multiple people)</SelectItem>
                          <SelectItem value="solo">Solo (one person)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Payment & Logistics */}
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="payout" className="text-sm font-medium">
                        <div className="flex items-center gap-1">
                          <Coins className="w-4 h-4" />
                          Payout per person ($) *
                        </div>
                      </Label>
                      <Input
                        id="payout"
                        name="payout"
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.payout}
                        onChange={handleInputChange}
                        placeholder="25.00"
                        className="mt-1"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="max_participants" className="text-sm font-medium">
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          Max Participants
                        </div>
                      </Label>
                      <Input
                        id="max_participants"
                        name="max_participants"
                        type="number"
                        min="1"
                        value={formData.max_participants}
                        onChange={handleInputChange}
                        className="mt-1"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="location" className="text-sm font-medium">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        Location *
                      </div>
                    </Label>
                    <Input
                      id="location"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      placeholder="e.g., Lincoln Elementary, Downtown"
                      className="mt-1"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="time_commitment" className="text-sm font-medium">
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          Time Commitment
                        </div>
                      </Label>
                      <Input
                        id="time_commitment"
                        name="time_commitment"
                        value={formData.time_commitment}
                        onChange={handleInputChange}
                        placeholder="e.g., 2 hours/week"
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="deadline" className="text-sm font-medium">
                        Deadline (optional)
                      </Label>
                      <Input
                        id="deadline"
                        name="deadline"
                        type="date"
                        value={formData.deadline}
                        onChange={handleInputChange}
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="requirements" className="text-sm font-medium">
                      Requirements (optional)
                    </Label>
                    <Textarea
                      id="requirements"
                      name="requirements"
                      value={formData.requirements}
                      onChange={handleInputChange}
                      placeholder="Any specific requirements, skills, or qualifications needed..."
                      className="mt-1"
                      rows={3}
                    />
                  </div>
                </div>

                {/* Submit */}
                <div className="flex flex-col sm:flex-row gap-4 pt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-teal-600 hover:bg-teal-700 text-white"
                  >
                    {loading ? 'Creating...' : 'Post Task'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </CleanLayout>
  )
}