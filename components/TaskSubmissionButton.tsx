'use client'

import { useState } from 'react'
import { useAuth } from '@/components/auth/AuthProvider'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { CheckCircle, Camera, Upload } from 'lucide-react'

interface TaskSubmissionButtonProps {
  taskId: string
  taskTitle: string
  taskType: 'solo' | 'shared' | 'barter' | 'corporate_sponsored'
  payout: number
}

export function TaskSubmissionButton({ 
  taskId, 
  taskTitle, 
  taskType, 
  payout 
}: TaskSubmissionButtonProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [isOpen, setIsOpen] = useState(false)
  const [verificationPhoto, setVerificationPhoto] = useState<string | null>(null)
  const [submissionNotes, setSubmissionNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      toast({
        title: "File Too Large",
        description: "Please select a photo under 5MB.",
        variant: "destructive"
      })
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target?.result as string
      setVerificationPhoto(result.split(',')[1]) // Remove data:image/jpeg;base64, prefix
    }
    reader.readAsDataURL(file)
  }

  const handleSubmitForVerification = async () => {
    if (!user?.id) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to submit task completion.",
        variant: "destructive"
      })
      return
    }

    if (!verificationPhoto && taskType !== 'barter') {
      toast({
        title: "Photo Required",
        description: "Please upload a verification photo showing the completed task.",
        variant: "destructive"
      })
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/tasks/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          taskId,
          verificationPhoto: verificationPhoto || 'no-photo-required',
          submissionNotes: submissionNotes.trim() || 'Task completed as requested.'
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to submit task completion')
      }

      toast({
        title: result.autoApproved ? "Task Approved!" : "Submission Received",
        description: result.autoApproved 
          ? `Your task completion has been approved! ${payout > 0 ? `$${payout.toFixed(2)} will be credited to your account.` : ''}`
          : "Your submission is under review. You'll be notified once it's approved.",
      })

      setIsOpen(false)
      setVerificationPhoto(null)
      setSubmissionNotes('')
    } catch (error: any) {
      console.error('Error submitting task completion:', error)
      toast({
        title: "Submission Failed",
        description: error.message || "Could not submit your task completion. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const calculateNetPayout = () => {
    if (payout === 0) return 0
    
    let feeRate = 0
    switch (taskType) {
      case 'solo': feeRate = 0.03; break // 3%
      case 'shared': feeRate = 0.07; break // 7%
      case 'corporate_sponsored': feeRate = 0.15; break // 15%
      case 'barter': return 0 // No monetary payout
    }
    
    return payout - (payout * feeRate)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="w-full text-green-600 border-green-200 hover:bg-green-50"
          data-testid={`button-submit-${taskId}`}
        >
          <CheckCircle className="w-4 h-4 mr-2" />
          Submit Completion
          {payout > 0 && (
            <span className="ml-2 font-semibold">
              Earn ${calculateNetPayout().toFixed(0)}
            </span>
          )}
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Submit Task Completion</DialogTitle>
          <DialogDescription>
            {taskType === 'barter' 
              ? 'Confirm that the exchange has been completed successfully.'
              : 'Upload a photo and notes to verify task completion.'
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {taskType !== 'barter' && (
            <div className="space-y-2">
              <Label htmlFor="verification-photo">Verification Photo *</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                {verificationPhoto ? (
                  <div className="space-y-2">
                    <img 
                      src={`data:image/jpeg;base64,${verificationPhoto}`}
                      alt="Verification"
                      className="max-h-32 mx-auto rounded"
                    />
                    <p className="text-sm text-green-600">Photo uploaded successfully</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Camera className="w-8 h-8 mx-auto text-gray-400" />
                    <p className="text-sm text-gray-600">Upload a photo showing the completed task</p>
                  </div>
                )}
                <input
                  id="verification-photo"
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={() => document.getElementById('verification-photo')?.click()}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {verificationPhoto ? 'Change Photo' : 'Choose Photo'}
                </Button>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="submission-notes">Additional Notes</Label>
            <Textarea
              id="submission-notes"
              placeholder="Add any notes about the task completion..."
              value={submissionNotes}
              onChange={(e) => setSubmissionNotes(e.target.value)}
              rows={3}
            />
          </div>

          {payout > 0 && (
            <div className="p-3 bg-green-50 rounded-lg border border-green-200">
              <div className="text-sm text-green-800">
                <div className="flex justify-between">
                  <span>Task Value:</span>
                  <span>${payout.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Platform Fee ({taskType === 'solo' ? '3' : taskType === 'shared' ? '7' : '15'}%):</span>
                  <span>-${(payout - calculateNetPayout()).toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-semibold border-t pt-1 mt-1">
                  <span>Your Earnings:</span>
                  <span>${calculateNetPayout().toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <Button
              onClick={handleSubmitForVerification}
              disabled={isSubmitting || (!verificationPhoto && taskType !== 'barter')}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              {isSubmitting ? 'Submitting...' : 'Submit for Verification'}
            </Button>
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}