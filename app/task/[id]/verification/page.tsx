'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PhotoVerification } from '@/components/verification/PhotoVerification'
import { VerificationStatus } from '@/components/verification/VerificationStatus'
import { useAuth } from '@/components/auth/SimpleAuthProvider'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface TaskData {
  id: string
  title: string
  description: string
  category: string
  amount: number
  fee_amount: number
  net_amount: number
  status: string
  payment_status: string
  verification_id?: string
  location: string
  created_at: string
}

export default function TaskVerificationPage() {
  const params = useParams()
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const taskId = params.id as string

  const [task, setTask] = useState<TaskData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [verificationComplete, setVerificationComplete] = useState(false)

  useEffect(() => {
    if (!authLoading && user) {
      fetchTaskData()
    }
  }, [taskId, user, authLoading])

  const fetchTaskData = async () => {
    try {
      const response = await fetch(`/api/tasks?id=${taskId}`)
      const data = await response.json()

      if (response.ok && data.task) {
        setTask(data.task)
        setVerificationComplete(!!data.task.verification_id)
      } else {
        setError('Task not found or access denied')
      }
    } catch (err) {
      setError('Failed to load task data')
    } finally {
      setLoading(false)
    }
  }

  const handleVerificationComplete = (result: any) => {
    setVerificationComplete(true)
    setTask(prev => prev ? {
      ...prev,
      verification_id: result.verification.id,
      status: result.taskStatus,
      payment_status: result.paymentStatus
    } : null)
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    )
  }

  if (!user) {
    router.push('/auth')
    return null
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-red-600">{error}</p>
              <Button 
                variant="outline" 
                onClick={() => router.back()}
                className="mt-4"
              >
                Go Back
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (!task) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p>Task not found</p>
      </div>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified_complete':
        return 'bg-green-100 text-green-800'
      case 'pending_verification':
        return 'bg-yellow-100 text-yellow-800'
      case 'verification_failed':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => router.back()}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-xl font-semibold">Task Verification</h1>
              <p className="text-sm text-gray-600">Submit photos to verify completion</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 space-y-6">
        {/* Task Overview */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle>{task.title}</CardTitle>
                <CardDescription className="mt-1">
                  {task.location} • Posted {new Date(task.created_at).toLocaleDateString()}
                </CardDescription>
              </div>
              <div className="text-right">
                <Badge className={getStatusColor(task.status)}>
                  {task.status.replace('_', ' ').toUpperCase()}
                </Badge>
                <div className="mt-2">
                  <div className="text-2xl font-bold">${task.net_amount.toFixed(2)}</div>
                  <div className="text-sm text-gray-500">
                    ${task.amount.toFixed(2)} - ${task.fee_amount.toFixed(2)} fee
                  </div>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700">{task.description}</p>
          </CardContent>
        </Card>

        {/* Verification Section */}
        {verificationComplete || task.verification_id ? (
          <VerificationStatus
            taskId={taskId}
            verificationId={task.verification_id}
            showPhotos={true}
            onStatusChange={(status) => {
              setTask(prev => prev ? { ...prev, status } : null)
            }}
          />
        ) : (
          <PhotoVerification
            taskId={taskId}
            taskTitle={task.title}
            taskDescription={task.description}
            onVerificationComplete={handleVerificationComplete}
            requireBeforePhoto={task.category === 'cleaning' || task.category === 'organization'}
          />
        )}
      </div>
    </div>
  )
}