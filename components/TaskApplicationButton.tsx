'use client'

import { useState } from 'react'
import { useAuth } from '@/components/auth/SimpleAuthProvider'
import { useToast } from '@/app/hooks/use-toast'
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
import { Users } from 'lucide-react'

interface TaskApplicationButtonProps {
  taskId: string
  taskTitle: string
  taskType: 'solo' | 'shared' | 'barter' | 'corporate_sponsored'
  payout: number
}

export function TaskApplicationButton({ 
  taskId, 
  taskTitle, 
  taskType, 
  payout 
}: TaskApplicationButtonProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [isOpen, setIsOpen] = useState(false)
  const [applicationMessage, setApplicationMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleApply = async () => {
    if (!user?.id) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to apply for this task.",
        variant: "destructive"
      })
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/tasks/apply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          taskId,
          applicationMessage: applicationMessage.trim() || 'I would like to help with this task.'
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to apply for task')
      }

      toast({
        title: "Application Submitted!",
        description: `Your application for "${taskTitle}" has been submitted successfully.`,
      })

      setIsOpen(false)
      setApplicationMessage('')
    } catch (error: any) {
      console.error('Error applying for task:', error)
      toast({
        title: "Application Failed",
        description: error.message || "Could not submit your application. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const getButtonText = () => {
    switch (taskType) {
      case 'barter':
        return 'Propose Exchange'
      case 'shared':
        return 'Join Team'
      case 'corporate_sponsored':
        return 'Apply for Position'
      default:
        return 'Apply Now'
    }
  }

  const getButtonColor = () => {
    switch (taskType) {
      case 'barter':
        return 'bg-orange-600 hover:bg-orange-700'
      case 'shared':
        return 'bg-blue-600 hover:bg-blue-700'
      case 'corporate_sponsored':
        return 'bg-purple-600 hover:bg-purple-700'
      default:
        return 'bg-green-600 hover:bg-green-700'
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          className={`w-full text-white ${getButtonColor()}`}
          data-testid={`button-apply-${taskId}`}
        >
          <Users className="w-4 h-4 mr-2" />
          {getButtonText()}
          {payout > 0 && (
            <span className="ml-2 font-semibold">
              ${payout.toFixed(0)}
            </span>
          )}
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Apply for Task</DialogTitle>
          <DialogDescription>
            {taskType === 'barter' 
              ? 'Describe what you can offer in exchange for this request.'
              : `Submit your application for "${taskTitle}".`
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="application-message">
              {taskType === 'barter' ? 'Your Offer' : 'Application Message'}
            </Label>
            <Textarea
              id="application-message"
              placeholder={
                taskType === 'barter' 
                  ? 'Describe what you can offer in exchange...'
                  : 'Tell the task creator why you\'re the right person for this job...'
              }
              value={applicationMessage}
              onChange={(e) => setApplicationMessage(e.target.value)}
              rows={4}
            />
          </div>

          {payout > 0 && (
            <div className="p-3 bg-green-50 rounded-lg border border-green-200">
              <p className="text-sm text-green-800">
                <strong>Potential Earnings:</strong> ${payout.toFixed(2)}
                {taskType === 'shared' && ' (split among participants)'}
              </p>
            </div>
          )}

          <div className="flex gap-2">
            <Button
              onClick={handleApply}
              disabled={isSubmitting}
              className={`flex-1 ${getButtonColor()}`}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Application'}
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