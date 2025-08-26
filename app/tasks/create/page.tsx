'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, DollarSign, Users, Clock, MapPin, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import AiTaskAssistant from "@/components/task/AiTaskAssistant"

export default function CreateTaskPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [taskType, setTaskType] = useState<'community' | 'barter'>('community')
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    earningPotential: '',
    maxParticipants: '1',
    location: '',
    duration: '',
    difficulty: 'medium',
    requirements: '',
    offering: '', // For barter
    seeking: '', // For barter
    tradeType: 'service_for_service', // For barter
    tags: ''
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleAiUpdate = (updates: any) => {
    setFormData(prev => ({ ...prev, ...updates }))
  }

  const handleAiSuggestions = (suggestions: any) => {
    setFormData(prev => ({ ...prev, ...suggestions }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          type: taskType,
          earningPotential: taskType === 'barter' ? null : parseFloat(formData.earningPotential),
          maxParticipants: parseInt(formData.maxParticipants),
          tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean)
        }),
      })

      const result = await response.json()

      if (response.ok) {
        router.push(`/tasks/${result.task.id}`)
      } else {
        alert(result.error || 'Failed to create task')
      }
    } catch (error) {
      console.error('Error creating task:', error)
      alert('Failed to create task')
    } finally {
      setLoading(false)
    }
  }

  const getTaskTypeInfo = (type: string) => {
    switch (type) {
      case 'solo':
        return {
          title: 'Solo Task - Platform Funded',
          description: 'Tasks funded by our platform with a 3% fee',
          fee: '3%',
          color: 'text-blue-600'
        }
      case 'community':
        return {
          title: 'Community Task - Peer to Peer',
          description: 'Tasks between neighbors with a 7% platform fee',
          fee: '7%',
          color: 'text-purple-600'
        }
      case 'barter':
        return {
          title: 'Barter Trade - No Fees',
          description: 'Exchange services or items with no platform fees',
          fee: 'Free',
          color: 'text-orange-600'
        }
      default:
        return { title: '', description: '', fee: '', color: '' }
    }
  }

  const categories = [
    'cleaning', 'shopping', 'delivery', 'yard-work', 'tech-help',
    'pet-care', 'tutoring', 'moving', 'repairs', 'cooking', 'trade', 'other'
  ]

  const tradeTypes = [
    { value: 'service_for_service', label: 'Service for Service' },
    { value: 'item_for_service', label: 'Item for Service' },
    { value: 'service_for_item', label: 'Service for Item' },
    { value: 'item_for_item', label: 'Item for Item' }
  ]

  return (
    <div className="container mx-auto px-4 py-6 max-w-2xl">
      <div className="mb-6">
        <Button 
          variant="ghost" 
          onClick={() => router.back()}
          className="mb-4"
          data-testid="button-back"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Tasks
        </Button>
        <h1 className="text-3xl font-bold" data-testid="text-page-title">Create New Task</h1>
        <p className="text-gray-600 mt-1" data-testid="text-page-description">
          Share a task with your neighborhood
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Task Type Selection */}
        <Card data-testid="card-task-type">
          <CardHeader>
            <CardTitle>Choose Task Type</CardTitle>
            <CardDescription>
              Different types have different fee structures
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={taskType} onValueChange={(value: any) => setTaskType(value)} data-testid="tabs-task-type">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="community" data-testid="tab-community">Community (7%)</TabsTrigger>
                <TabsTrigger value="barter" data-testid="tab-barter">Barter (Free)</TabsTrigger>
              </TabsList>
              
              {['community', 'barter'].map(type => {
                const info = getTaskTypeInfo(type)
                return (
                  <TabsContent key={type} value={type} className="mt-4">
                    <Alert data-testid={`alert-${type}-info`}>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        <strong className={info.color}>{info.title}</strong>
                        <br />
                        {info.description}
                        <br />
                        <span className="font-medium">Platform fee: {info.fee}</span>
                      </AlertDescription>
                    </Alert>
                  </TabsContent>
                )
              })}
            </Tabs>
          </CardContent>
        </Card>

        {/* AI Task Assistant */}
        <AiTaskAssistant
          taskType={taskType}
          currentData={{
            title: formData.title,
            description: formData.description,
            offering: formData.offering,
            seeking: formData.seeking
          }}
          onUpdateData={handleAiUpdate}
          onApplySuggestions={handleAiSuggestions}
        />

        {/* Basic Information */}
        <Card data-testid="card-basic-info">
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="title">Task Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Brief, clear description of the task"
                required
                data-testid="input-title"
              />
            </div>

            <div>
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Detailed description of what needs to be done"
                required
                className="min-h-[100px]"
                data-testid="textarea-description"
              />
            </div>

            <div>
              <Label htmlFor="category">Category</Label>
              <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                <SelectTrigger data-testid="select-category">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(cat => (
                    <SelectItem key={cat} value={cat} data-testid={`option-category-${cat}`}>
                      {cat.charAt(0).toUpperCase() + cat.slice(1).replace('-', ' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Task-specific Fields */}
        {taskType === 'barter' ? (
          <Card data-testid="card-barter-details">
            <CardHeader>
              <CardTitle>Barter Details</CardTitle>
              <CardDescription>What are you offering and what do you need?</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="offering">What I'm Offering *</Label>
                <Textarea
                  id="offering"
                  value={formData.offering}
                  onChange={(e) => handleInputChange('offering', e.target.value)}
                  placeholder="Describe what you can provide"
                  required
                  data-testid="textarea-offering"
                />
              </div>

              <div>
                <Label htmlFor="seeking">What I'm Seeking *</Label>
                <Textarea
                  id="seeking"
                  value={formData.seeking}
                  onChange={(e) => handleInputChange('seeking', e.target.value)}
                  placeholder="Describe what you need in return"
                  required
                  data-testid="textarea-seeking"
                />
              </div>

              <div>
                <Label htmlFor="tradeType">Trade Type</Label>
                <Select value={formData.tradeType} onValueChange={(value) => handleInputChange('tradeType', value)}>
                  <SelectTrigger data-testid="select-trade-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {tradeTypes.map(type => (
                      <SelectItem key={type.value} value={type.value} data-testid={`option-trade-${type.value}`}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card data-testid="card-payment-details">
            <CardHeader>
              <CardTitle>Payment & Participation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="earningPotential">Payment Amount ($) *</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="earningPotential"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.earningPotential}
                    onChange={(e) => handleInputChange('earningPotential', e.target.value)}
                    placeholder="0.00"
                    className="pl-10"
                    required
                    data-testid="input-earning-potential"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="maxParticipants">Max Participants</Label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="maxParticipants"
                    type="number"
                    min="1"
                    value={formData.maxParticipants}
                    onChange={(e) => handleInputChange('maxParticipants', e.target.value)}
                    className="pl-10"
                    data-testid="input-max-participants"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Location & Time */}
        <Card data-testid="card-location-time">
          <CardHeader>
            <CardTitle>Location & Timing</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="location">Location</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  placeholder="City, State or specific address"
                  className="pl-10"
                  data-testid="input-location"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="duration">Estimated Duration</Label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="duration"
                  value={formData.duration}
                  onChange={(e) => handleInputChange('duration', e.target.value)}
                  placeholder="e.g., 30 minutes, 2 hours"
                  className="pl-10"
                  data-testid="input-duration"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="difficulty">Difficulty Level</Label>
              <Select value={formData.difficulty} onValueChange={(value) => handleInputChange('difficulty', value)}>
                <SelectTrigger data-testid="select-difficulty">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy" data-testid="option-difficulty-easy">Easy</SelectItem>
                  <SelectItem value="medium" data-testid="option-difficulty-medium">Medium</SelectItem>
                  <SelectItem value="hard" data-testid="option-difficulty-hard">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Additional Details */}
        <Card data-testid="card-additional-details">
          <CardHeader>
            <CardTitle>Additional Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="requirements">Special Requirements</Label>
              <Textarea
                id="requirements"
                value={formData.requirements}
                onChange={(e) => handleInputChange('requirements', e.target.value)}
                placeholder="Any specific skills, tools, or requirements"
                data-testid="textarea-requirements"
              />
            </div>

            <div>
              <Label htmlFor="tags">Tags (comma-separated)</Label>
              <Input
                id="tags"
                value={formData.tags}
                onChange={(e) => handleInputChange('tags', e.target.value)}
                placeholder="e.g., urgent, flexible-schedule, weekend"
                data-testid="input-tags"
              />
            </div>
          </CardContent>
        </Card>

        <Button 
          type="submit" 
          className="w-full" 
          disabled={loading}
          data-testid="button-submit-task"
        >
          {loading ? 'Creating Task...' : 'Create Task'}
        </Button>
      </form>
    </div>
  )
}