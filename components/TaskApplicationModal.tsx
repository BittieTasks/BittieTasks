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

      // Handle different verification outcomes
      if (data.verification?.status === 'approved') {
        toast({
          title: "AI Verified & Paid! 🎉",
          description: `${data.message} You earned $${data.payment.amount}! ${data.remainingCompletions > 0 ? `${data.remainingCompletions} completion(s) remaining.` : 'Task limit reached.'}`,
        })
      } else if (data.verification?.status === 'pending') {
        toast({
          title: "Under AI Review 🔍",
          description: data.message,
        })
      } else {
        throw new Error(data.error || 'Verification failed')
      }

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
            <div className="text-center p-4 bg-gradient-to-r from-teal-50 to-green-50 rounded-lg border border-teal-200">
              <h3 className="font-semibold text-teal-800">AI-Powered Verification</h3>
              <p className="text-sm text-teal-600 mt-1">
                Our smart system analyzes your submission for instant ${task.payout} payment
              </p>
              <div className="mt-2 text-xs text-teal-500">
                ✓ 70%+ confidence = Instant payment • 40-70% = Manual review • Under 40% = More details needed
              </div>
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
              <div className="text-xs text-gray-500 mt-2 space-y-1">
                <p><strong>Tips for better verification:</strong></p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Use specific keywords like "clean", "organized", "completed"</li>
                  <li>Describe what you accomplished (e.g., "folded all laundry and organized clothes")</li>
                  <li>Include before/after details for better AI confidence</li>
                  <li>Photo URLs from imgur.com, drive.google.com work great</li>
                </ul>
              </div>
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