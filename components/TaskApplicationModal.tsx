'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { Clock, MapPin, Users, Coins, Camera, Upload } from 'lucide-react'

interface Task {
  id: string
  title: string
  description: string
  category: string
  type: string
  payout: number
  location: string
  time_commitment: string
  requirements: string[]
  platform_funded?: boolean
  completion_limit?: number
  verification_type?: string
}

interface TaskApplicationModalProps {
  task: Task
  userId: string
  onSuccess?: () => void
}

export default function TaskApplicationModal({ task, userId, onSuccess }: TaskApplicationModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [step, setStep] = useState<'apply' | 'verify'>('apply')
  const [loading, setLoading] = useState(false)
  const [applied, setApplied] = useState(false)
  const [verificationPhoto, setVerificationPhoto] = useState('')
  const { toast } = useToast()

  const handleApply = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/tasks/apply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          taskId: task.id,
          userId: userId
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to apply for task')
      }

      setApplied(true)
      setStep('verify')
      toast({
        title: "Application Successful!",
        description: "You can now complete the task and submit verification.",
      })
    } catch (error) {
      toast({
        title: "Application Failed",
        description: error instanceof Error ? error.message : "Failed to apply for task",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyAndPay = async () => {
    if (!verificationPhoto.trim()) {
      toast({
        title: "Verification Required",
        description: "Please provide a photo or description to verify task completion.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/tasks/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          taskId: task.id,
          userId: userId,
          verificationPhoto: verificationPhoto
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to verify task')
      }

      toast({
        title: "Payment Successful! 🎉",
        description: `You earned $${data.payment.amount}! ${data.remainingCompletions > 0 ? `You can complete this task ${data.remainingCompletions} more time(s).` : 'You have reached the completion limit for this task.'}`,
      })

      setIsOpen(false)
      onSuccess?.()
    } catch (error) {
      toast({
        title: "Verification Failed",
        description: error instanceof Error ? error.message : "Failed to verify task completion",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'solo': return 'bg-blue-100 text-blue-800'
      case 'shared': return 'bg-green-100 text-green-800'
      case 'sponsored': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          className="w-full bg-teal-600 hover:bg-teal-700 text-white"
          data-testid={`button-apply-${task.id}`}
        >
          {task.platform_funded ? 'Complete Task & Earn $2' : 'Apply Now'}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md mx-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {step === 'apply' ? 'Apply for Task' : 'Verify Completion'}
            {task.platform_funded && (
              <Badge className="bg-teal-100 text-teal-800">Platform Funded</Badge>
            )}
          </DialogTitle>
          <DialogDescription>
            {step === 'apply' ? 'Review task details and apply' : 'Submit verification to receive payment'}
          </DialogDescription>
        </DialogHeader>

        {step === 'apply' && (
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-lg">{task.title}</h3>
              <p className="text-gray-600 text-sm mt-1">{task.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Coins className="h-4 w-4 text-teal-600" />
                <span className="font-semibold">${task.payout}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-gray-500" />
                <span>{task.time_commitment}</span>
              </div>
              <div className="flex items-center gap-2 col-span-2">
                <MapPin className="h-4 w-4 text-gray-500" />
                <span>{task.location}</span>
              </div>
            </div>

            <div>
              <Badge className={getTypeColor(task.type)}>
                {task.type === 'solo' ? 'Solo Task' : task.type === 'shared' ? 'Shared Task' : 'Sponsored Task'}
              </Badge>
              {task.completion_limit && (
                <Badge className="ml-2 bg-orange-100 text-orange-800">
                  Max {task.completion_limit} completions
                </Badge>
              )}
            </div>

            <div>
              <Label className="text-sm font-medium">Requirements:</Label>
              <ul className="list-disc list-inside text-sm text-gray-600 mt-1">
                {task.requirements.map((req, index) => (
                  <li key={index}>{req}</li>
                ))}
              </ul>
            </div>

            <Button 
              onClick={handleApply}
              disabled={loading}
              className="w-full bg-teal-600 hover:bg-teal-700"
              data-testid={`button-confirm-apply-${task.id}`}
            >
              {loading ? 'Applying...' : 'Apply & Start Task'}
            </Button>
          </div>
        )}

        {step === 'verify' && (
          <div className="space-y-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <h3 className="font-semibold text-green-800">Ready to Get Paid!</h3>
              <p className="text-sm text-green-600 mt-1">
                Submit verification to receive your ${task.payout} payment
              </p>
            </div>

            <div>
              <Label htmlFor="verification" className="text-sm font-medium flex items-center gap-2">
                <Camera className="h-4 w-4" />
                Verification Photo/Description
              </Label>
              <Textarea
                id="verification"
                placeholder="Describe how you completed the task or paste a photo URL as verification..."
                value={verificationPhoto}
                onChange={(e) => setVerificationPhoto(e.target.value)}
                className="mt-2"
                rows={4}
                data-testid={`input-verification-${task.id}`}
              />
              <p className="text-xs text-gray-500 mt-1">
                For photo verification, you can upload to any free image hosting service and paste the link here.
              </p>
            </div>

            <Button 
              onClick={handleVerifyAndPay}
              disabled={loading || !verificationPhoto.trim()}
              className="w-full bg-green-600 hover:bg-green-700"
              data-testid={`button-verify-${task.id}`}
            >
              {loading ? 'Processing Payment...' : `Submit & Receive $${task.payout}`}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}