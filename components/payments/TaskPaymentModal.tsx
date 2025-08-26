'use client'

import { useState } from 'react'
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Coins, AlertCircle, CheckCircle, Clock } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface TaskPaymentModalProps {
  isOpen: boolean
  onClose: () => void
  task: {
    id: string
    title: string
    earningPotential: number
    type: string
    duration?: string
    platformFee?: number
  }
  clientSecret: string | null
}

export function TaskPaymentModal({ isOpen, onClose, task, clientSecret }: TaskPaymentModalProps) {
  const stripe = useStripe()
  const elements = useElements()
  const { toast } = useToast()
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const platformFeeAmount = task.platformFee ? (task.earningPotential * task.platformFee / 100) : 0
  const netEarnings = task.earningPotential - platformFeeAmount

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!stripe || !elements || !clientSecret) {
      return
    }

    setIsProcessing(true)
    setError(null)

    try {
      const { error: submitError } = await elements.submit()
      
      if (submitError) {
        setError(submitError.message || 'An error occurred')
        setIsProcessing(false)
        return
      }

      const { error: confirmError } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/task/${task.id}/payment-success`,
        },
      })

      if (confirmError) {
        setError(confirmError.message || 'Payment failed')
        setIsProcessing(false)
      } else {
        // Payment succeeded, will redirect
        toast({
          title: "Payment Processing",
          description: "Your payment is being processed. You'll be redirected shortly.",
        })
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred')
      setIsProcessing(false)
    }
  }

  if (!clientSecret) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Loading Payment...</DialogTitle>
            <DialogDescription>
              Setting up payment for this task...
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin h-8 w-8 border-4 border-teal-600 border-t-transparent rounded-full" />
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Coins className="h-5 w-5 text-teal-600" />
            Complete Task Payment
          </DialogTitle>
          <DialogDescription>
            Finalize payment for "{task.title}"
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Task Summary */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium mb-3">{task.title}</h3>
            <div className="flex flex-wrap gap-2 mb-3">
              <Badge variant="secondary">{task.type}</Badge>
              {task.duration && (
                <Badge variant="outline" className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {task.duration}
                </Badge>
              )}
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Base Earning:</span>
                <span className="font-medium">${task.earningPotential.toFixed(2)}</span>
              </div>
              {platformFeeAmount > 0 && (
                <div className="flex justify-between text-gray-600">
                  <span>Platform Fee ({task.platformFee}%):</span>
                  <span>-${platformFeeAmount.toFixed(2)}</span>
                </div>
              )}
              <hr />
              <div className="flex justify-between text-lg font-semibold text-teal-600">
                <span>Your Net Earnings:</span>
                <span>${netEarnings.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Payment Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="border rounded-lg p-4">
              <PaymentElement 
                options={{
                  layout: 'tabs'
                }}
              />
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">Secure Payment Protection</p>
                  <p>
                    Your payment is processed securely through Stripe. Funds are held in escrow 
                    until task completion is verified. You'll receive your earnings within 1-2 business days.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1"
                disabled={isProcessing}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-teal-600 hover:bg-teal-700"
                disabled={!stripe || !elements || isProcessing}
              >
                {isProcessing ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                    Processing...
                  </div>
                ) : (
                  `Confirm Payment - $${task.earningPotential.toFixed(2)}`
                )}
              </Button>
            </div>

            <p className="text-xs text-gray-500 text-center">
              By proceeding, you agree to the task terms and conditions. 
              Payment will be processed upon successful task completion verification.
            </p>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}