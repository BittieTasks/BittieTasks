'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/components/auth/AuthProvider'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, Clock, DollarSign, ArrowRight } from 'lucide-react'
import { everydayTasks } from '@/lib/everydayTasks'
import { SoloTaskVerification } from '@/components/SoloTaskVerification'
import { useToast } from '@/hooks/use-toast'

export default function StartTaskPage() {
  const params = useParams()
  const router = useRouter()
  const { user, isAuthenticated } = useAuth()
  const { toast } = useToast()
  const [task, setTask] = useState<any>(null)
  const [applied, setApplied] = useState(false)
  const [applying, setApplying] = useState(false)
  const [showVerification, setShowVerification] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth?redirect=/solo-tasks')
      return
    }

    // Find task from everyday tasks
    const taskId = params.id as string
    const foundTask = everydayTasks.find(t => t.id === taskId)
    
    if (!foundTask) {
      router.push('/solo-tasks')
      return
    }

    setTask(foundTask)
    setLoading(false)
  }, [params.id, isAuthenticated, router])

  const handleApply = async () => {
    if (!task || !user) return

    setApplying(true)
    try {
      const response = await fetch('/api/solo-tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(user as any)?.access_token}`
        },
        body: JSON.stringify({
          task_id: task.id,
          application_message: `Starting solo task: ${task.title}`
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.details || result.error || 'Application failed')
      }

      setApplied(true)
      toast({
        title: "Task Started!",
        description: "You can now begin working on this task. Complete it and submit for verification.",
      })

    } catch (error: any) {
      console.error('Application error:', error)
      toast({
        title: "Application Failed",
        description: error.message || "Failed to start task. Please try again.",
        variant: "destructive",
      })
    } finally {
      setApplying(false)
    }
  }

  const handleStartWork = () => {
    setShowVerification(true)
  }

  const handleVerificationComplete = (result: any) => {
    toast({
      title: result.auto_approved ? "Payment Processed!" : "Submitted for Review",
      description: result.message,
    })
    
    // Redirect to dashboard or tasks page after completion
    setTimeout(() => {
      router.push('/dashboard')
    }, 2000)
  }

  const calculateNetPayout = () => {
    if (!task) return 0
    const fee = Math.round(task.payout * 0.03)
    return task.payout - fee
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    )
  }

  if (!task) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-red-600">Task not found</p>
              <Button 
                variant="outline" 
                onClick={() => router.push('/solo-tasks')}
                className="mt-4"
              >
                Back to Solo Tasks
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (showVerification) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <Button 
              variant="outline" 
              onClick={() => setShowVerification(false)}
              className="mb-4"
            >
              ← Back to Task Details
            </Button>
          </div>
          <SoloTaskVerification 
            task={task}
            onVerificationComplete={handleVerificationComplete}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Button 
            variant="outline" 
            onClick={() => router.push('/solo-tasks')}
            className="mb-4"
          >
            ← Back to Solo Tasks
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">{task.title}</h1>
          <Badge variant="outline" className="mt-2">
            {task.category}
          </Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Task Details */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Task Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 mb-4">{task.description}</p>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <strong>Time Estimate:</strong> {task.time_estimate}
                  </div>
                  <div>
                    <strong>Difficulty:</strong> {task.difficulty}
                  </div>
                  <div>
                    <strong>Location:</strong> {task.location_type}
                  </div>
                  <div>
                    <strong>Category:</strong> {task.category}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Materials Needed */}
            {task.materials_needed && task.materials_needed.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Materials Needed</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {task.materials_needed.map((material: string, index: number) => (
                      <li key={index} className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span>{material}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Progress Steps */}
            <Card>
              <CardHeader>
                <CardTitle>How It Works</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                      applied ? 'bg-green-600' : 'bg-blue-600'
                    }`}>
                      1
                    </div>
                    <div>
                      <p className="font-medium">Start the Task</p>
                      <p className="text-sm text-gray-600">Click to begin working on this task</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                      applied ? 'bg-blue-600' : 'bg-gray-400'
                    }`}>
                      2
                    </div>
                    <div>
                      <p className="font-medium">Complete the Work</p>
                      <p className="text-sm text-gray-600">Do the task as described and take photos for verification</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-full bg-gray-400 flex items-center justify-center text-white font-bold">
                      3
                    </div>
                    <div>
                      <p className="font-medium">Get Paid</p>
                      <p className="text-sm text-gray-600">Receive automatic payment upon verification</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Payment & Actions */}
          <div className="space-y-6">
            {/* Earnings Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-green-600" />
                  Earnings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    ${calculateNetPayout()}
                  </div>
                  <div className="text-sm text-gray-600 mb-4">
                    ${task.payout} gross - ${Math.round(task.payout * 0.03)} fee (3%)
                  </div>
                  
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                    <div className="flex items-center gap-2 text-green-800 text-sm">
                      <CheckCircle className="h-4 w-4" />
                      <span>Auto-payment upon verification</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <Card>
              <CardContent className="p-4 space-y-3">
                {!applied ? (
                  <Button 
                    onClick={handleApply}
                    disabled={applying}
                    className="w-full"
                    size="lg"
                    data-testid="start-task-button"
                  >
                    {applying ? (
                      <>
                        <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                        Starting...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Start This Task
                      </>
                    )}
                  </Button>
                ) : (
                  <>
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-3">
                      <div className="flex items-center gap-2 text-green-800 text-sm">
                        <CheckCircle className="h-4 w-4" />
                        <span>Task started! Ready to work.</span>
                      </div>
                    </div>
                    
                    <Button 
                      onClick={handleStartWork}
                      className="w-full"
                      size="lg"
                      data-testid="complete-task-button"
                    >
                      <ArrowRight className="h-4 w-4 mr-2" />
                      Complete & Submit
                    </Button>
                  </>
                )}
                
                <div className="flex items-center gap-2 text-sm text-gray-600 justify-center">
                  <Clock className="h-4 w-4" />
                  <span>Expected time: {task.time_estimate}</span>
                </div>
              </CardContent>
            </Card>

            {/* Help Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Need Help?</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-gray-600">
                <p>
                  Take before and after photos to show your work completed. 
                  This helps with quick verification and faster payment.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}