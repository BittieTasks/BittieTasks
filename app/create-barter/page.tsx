'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { barterTaskFormSchema, type BarterTaskFormData } from '@shared/schema'
import { useToast } from '@/hooks/use-toast'
import { ArrowLeft, ArrowLeftRight, Heart, Handshake, MapPin, Clock, Tag, X } from 'lucide-react'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiRequest } from '@/lib/lib/queryClient'

const tradeTypeOptions = [
  { 
    value: 'service_for_service', 
    label: 'Service for Service',
    description: 'Trade your skills for someone else\'s skills',
    example: 'Piano lessons ↔ Garden maintenance'
  },
  { 
    value: 'item_for_service', 
    label: 'Item for Service',
    description: 'Trade physical items for services',
    example: 'Fresh vegetables ↔ House cleaning'
  },
  { 
    value: 'service_for_item', 
    label: 'Service for Item',
    description: 'Trade your services for physical items',
    example: 'Web design ↔ Homemade goods'
  },
  { 
    value: 'item_for_item', 
    label: 'Item for Item',
    description: 'Trade physical items for other items',
    example: 'Books ↔ Kitchen equipment'
  }
]

const difficultyOptions = [
  { value: 'easy', label: 'Easy', description: 'Simple exchange, minimal time commitment' },
  { value: 'medium', label: 'Medium', description: 'Moderate exchange, some planning required' },
  { value: 'hard', label: 'Hard', description: 'Complex exchange, significant time/expertise' }
]

const commonTags = [
  'food', 'cooking', 'baking', 'gardening', 'cleaning', 'handyman', 'repair',
  'education', 'tutoring', 'music', 'art', 'design', 'technology', 'web-development',
  'photography', 'fitness', 'yoga', 'massage', 'wellness', 'childcare', 'pet-care',
  'transportation', 'moving', 'organization', 'crafts', 'sewing', 'furniture'
]

export default function CreateBarterPage() {
  const router = useRouter()
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [customTag, setCustomTag] = useState('')

  const form = useForm<BarterTaskFormData>({
    resolver: zodResolver(barterTaskFormSchema),
    defaultValues: {
      title: '',
      description: '',
      offering: '',
      seeking: '',
      location: '',
      duration: '',
      difficulty: 'medium',
      tradeType: 'service_for_service',
      tags: [],
    },
  })

  const createBarterMutation = useMutation({
    mutationFn: async (data: BarterTaskFormData) => {
      const response = await apiRequest('POST', '/api/tasks', {
        ...data,
        type: 'barter',
        earningPotential: 0, // No monetary value for barter
        maxParticipants: 1, // Barter is typically 1-on-1
        hostId: 'demo-user', // Replace with actual user ID from auth
      })
      return response.json()
    },
    onSuccess: () => {
      toast({
        title: "Barter Trade Created Successfully",
        description: "Your trade is now live and others can propose exchanges!",
      })
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] })
      router.push('/barter')
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to Create Trade",
        description: error.message,
        variant: "destructive",
      })
    },
  })

  const onSubmit = (data: BarterTaskFormData) => {
    createBarterMutation.mutate(data)
  }

  const addTag = (tag: string) => {
    const currentTags = form.getValues('tags')
    if (!currentTags.includes(tag) && currentTags.length < 10) {
      form.setValue('tags', [...currentTags, tag])
    }
  }

  const removeTag = (tagToRemove: string) => {
    const currentTags = form.getValues('tags')
    form.setValue('tags', currentTags.filter(tag => tag !== tagToRemove))
  }

  const addCustomTag = () => {
    if (customTag.trim() && !form.getValues('tags').includes(customTag.trim())) {
      addTag(customTag.trim())
      setCustomTag('')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-100 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Navigation Header */}
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            onClick={() => router.push('/barter')}
            className="flex items-center gap-2 text-gray-700 hover:text-orange-600"
            data-testid="button-back-barter"
          >
            <ArrowLeft size={20} />
            Back to Barter Exchange
          </Button>
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Create Barter Trade
          </h1>
          <p className="text-lg text-gray-600 max-w-lg mx-auto">
            Trade skills, services, and items with your neighbors! No money required - just mutually beneficial exchanges.
          </p>
        </div>

        {/* Trade Creation Form */}
        <Card className="shadow-lg border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ArrowLeftRight className="w-5 h-5 text-orange-600" />
              Trade Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Title */}
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Trade Title</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., Piano Lessons for Garden Help"
                          {...field}
                          data-testid="input-barter-title"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Description */}
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe your trade in detail. What exactly are you offering and what do you need in return?"
                          rows={4}
                          {...field}
                          data-testid="input-barter-description"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Trade Type */}
                <FormField
                  control={form.control}
                  name="tradeType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Trade Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-trade-type">
                            <SelectValue placeholder="Select trade type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {tradeTypeOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              <div className="flex flex-col">
                                <span className="font-medium">{option.label}</span>
                                <span className="text-sm text-gray-500">{option.description}</span>
                                <span className="text-xs text-orange-600">{option.example}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* What You're Offering and Seeking */}
                <div className="bg-gradient-to-r from-orange-50 to-amber-50 p-6 rounded-lg border border-orange-200">
                  <div className="space-y-6">
                    <FormField
                      control={form.control}
                      name="offering"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2 text-orange-700">
                            <Heart className="w-4 h-4" />
                            What I'm Offering
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g., 4 piano lessons (1 hour each)"
                              {...field}
                              data-testid="input-offering"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex justify-center">
                      <ArrowLeftRight className="w-6 h-6 text-orange-400" />
                    </div>

                    <FormField
                      control={form.control}
                      name="seeking"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2 text-orange-700">
                            <Handshake className="w-4 h-4" />
                            What I'm Seeking
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g., Garden weeding & watering (4 visits)"
                              {...field}
                              data-testid="input-seeking"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Location and Duration Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          Location
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g., My place, Your place, Public space"
                            {...field}
                            data-testid="input-barter-location"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="duration"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          Time Estimate
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g., 1 hour per session, 1 month commitment"
                            {...field}
                            data-testid="input-barter-duration"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Difficulty */}
                <FormField
                  control={form.control}
                  name="difficulty"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Difficulty Level</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-barter-difficulty">
                            <SelectValue placeholder="Select difficulty" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {difficultyOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              <div className="flex flex-col">
                                <span className="font-medium">{option.label}</span>
                                <span className="text-sm text-gray-500">{option.description}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Tags */}
                <FormField
                  control={form.control}
                  name="tags"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Tag className="w-4 h-4" />
                        Tags (Help others find your trade)
                      </FormLabel>
                      
                      {/* Selected Tags */}
                      {field.value.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-3">
                          {field.value.map((tag) => (
                            <Badge
                              key={tag}
                              variant="secondary"
                              className="bg-orange-100 text-orange-800 flex items-center gap-1"
                            >
                              {tag}
                              <X
                                className="w-3 h-3 cursor-pointer hover:text-orange-600"
                                onClick={() => removeTag(tag)}
                              />
                            </Badge>
                          ))}
                        </div>
                      )}

                      {/* Common Tags */}
                      <div className="space-y-3">
                        <Label className="text-sm text-gray-600">Quick Add:</Label>
                        <div className="flex flex-wrap gap-2">
                          {commonTags.map((tag) => (
                            <Button
                              key={tag}
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => addTag(tag)}
                              disabled={field.value.includes(tag) || field.value.length >= 10}
                              className="text-xs"
                              data-testid={`button-tag-${tag}`}
                            >
                              {tag}
                            </Button>
                          ))}
                        </div>
                      </div>

                      {/* Custom Tag Input */}
                      <div className="flex gap-2">
                        <Input
                          placeholder="Add custom tag..."
                          value={customTag}
                          onChange={(e) => setCustomTag(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault()
                              addCustomTag()
                            }
                          }}
                          disabled={field.value.length >= 10}
                          data-testid="input-custom-tag"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={addCustomTag}
                          disabled={!customTag.trim() || field.value.includes(customTag.trim()) || field.value.length >= 10}
                          data-testid="button-add-custom-tag"
                        >
                          Add
                        </Button>
                      </div>
                      
                      <div className="text-xs text-gray-500">
                        {field.value.length}/10 tags. Tags help others discover your trade.
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* No Fees Notice */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-medium text-green-800 mb-2">💡 Barter Benefits</h4>
                  <div className="text-sm text-green-700 space-y-1">
                    <p>✓ <strong>No Platform Fees:</strong> Keep 100% of your trade value</p>
                    <p>✓ <strong>Community Building:</strong> Connect directly with neighbors</p>
                    <p>✓ <strong>Skill Sharing:</strong> Learn new things while helping others</p>
                    <p>✓ <strong>Sustainable:</strong> Reduce waste through resource sharing</p>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex gap-4 pt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push('/barter')}
                    className="flex-1"
                    data-testid="button-cancel-create-barter"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={createBarterMutation.isPending}
                    className="flex-1 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600"
                    data-testid="button-create-barter"
                  >
                    {createBarterMutation.isPending ? 'Creating...' : 'Create Barter Trade'}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}