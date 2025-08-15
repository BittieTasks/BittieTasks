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
import { communityTaskFormSchema, type CommunityTaskFormData } from '@shared/schema'
import { useToast } from '@/hooks/use-toast'
import { ArrowLeft, Users, DollarSign, MapPin, Clock, AlertCircle } from 'lucide-react'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiRequest } from '@/lib/lib/queryClient'

const difficultyOptions = [
  { value: 'easy', label: 'Easy', description: 'Simple tasks, minimal experience needed' },
  { value: 'medium', label: 'Medium', description: 'Moderate complexity, some experience helpful' },
  { value: 'hard', label: 'Hard', description: 'Complex tasks, significant experience required' }
]

export default function CreateTaskPage() {
  const router = useRouter()
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const form = useForm<CommunityTaskFormData>({
    resolver: zodResolver(communityTaskFormSchema),
    defaultValues: {
      title: '',
      description: '',
      earningPotential: 25,
      maxParticipants: 5,
      location: '',
      duration: '',
      difficulty: 'medium',
      requirements: '',
    },
  })

  const createTaskMutation = useMutation({
    mutationFn: async (data: CommunityTaskFormData) => {
      const response = await apiRequest('POST', '/api/tasks', {
        ...data,
        type: 'shared',
        hostId: 'demo-user', // Replace with actual user ID from auth
      })
      return response.json()
    },
    onSuccess: () => {
      toast({
        title: "Task Created Successfully",
        description: "Your community task is now live and others can join!",
      })
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] })
      router.push('/community')
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to Create Task",
        description: error.message,
        variant: "destructive",
      })
    },
  })

  const onSubmit = (data: CommunityTaskFormData) => {
    createTaskMutation.mutate(data)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Navigation Header */}
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            onClick={() => router.push('/community')}
            className="flex items-center gap-2 text-gray-700 hover:text-blue-600"
            data-testid="button-back-community"
          >
            <ArrowLeft size={20} />
            Back to Community Tasks
          </Button>
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Create Community Task
          </h1>
          <p className="text-lg text-gray-600 max-w-lg mx-auto">
            Post a collaborative task for your neighbors! Share the work and earnings with others in your community.
          </p>
        </div>

        {/* Task Creation Form */}
        <Card className="shadow-lg border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              Task Details
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
                      <FormLabel>Task Title</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., Neighborhood Clean-Up Day"
                          {...field}
                          data-testid="input-task-title"
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
                          placeholder="Describe what participants will be doing, when, and any special instructions..."
                          rows={4}
                          {...field}
                          data-testid="input-task-description"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Earnings and Participants Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="earningPotential"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4" />
                          Total Earnings (shared)
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="5"
                            max="500"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                            data-testid="input-task-earnings"
                          />
                        </FormControl>
                        <div className="text-xs text-gray-500">
                          This amount will be split among all participants. 7% platform fee applies.
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="maxParticipants"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          Max Participants
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="1"
                            max="20"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                            data-testid="input-max-participants"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
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
                            placeholder="e.g., Riverside Park, Downtown Area"
                            {...field}
                            data-testid="input-task-location"
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
                          Duration
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g., 3 hours, 2-4 hours"
                            {...field}
                            data-testid="input-task-duration"
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
                          <SelectTrigger data-testid="select-task-difficulty">
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

                {/* Requirements */}
                <FormField
                  control={form.control}
                  name="requirements"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Requirements (Optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Any special requirements, skills, or items participants should bring..."
                          rows={3}
                          {...field}
                          data-testid="input-task-requirements"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Earnings Breakdown Preview */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-800 mb-2 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    Earnings Breakdown
                  </h4>
                  <div className="text-sm text-blue-700 space-y-1">
                    <p><strong>Total Posted:</strong> ${form.watch('earningPotential')}</p>
                    <p><strong>Platform Fee (7%):</strong> ${(form.watch('earningPotential') * 0.07).toFixed(2)}</p>
                    <p><strong>Shared Among {form.watch('maxParticipants')} Participants:</strong> ${((form.watch('earningPotential') * 0.93) / form.watch('maxParticipants')).toFixed(2)} each</p>
                    <p className="text-xs text-blue-600 mt-2">
                      Participants earn equal shares. Payment is released when all participants complete the task.
                    </p>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex gap-4 pt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push('/community')}
                    className="flex-1"
                    data-testid="button-cancel-create"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={createTaskMutation.isPending}
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                    data-testid="button-create-task"
                  >
                    {createTaskMutation.isPending ? 'Creating...' : 'Create Community Task'}
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