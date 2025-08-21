'use client'

import { useState } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/app/hooks/use-toast'
import { Loader2, CheckCircle, DollarSign, Clock, Shield } from 'lucide-react'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_VITE_STRIPE_PUBLIC_KEY!)

interface TaskPaymentModalProps {
  isOpen: boolean
  onClose: () => void
  task: {
    id: string
    title: string
    earningPotential: string
    type: 'platform_funded' | 'peer_to_peer' | 'corporate_sponsored'
  }
  submission: {
    id: string
    verificationStatus: string
    autoVerificationScore: number
    fraudDetectionScore: number
    paymentReleased: boolean
  }
}

function PaymentForm({ 
  task, 
  submission, 
  onSuccess, 
  onError 
}: { 
  task: TaskPaymentModalProps['task']
  submission: TaskPaymentModalProps['submission']
  onSuccess: (result: any) => void
  onError: (error: string) => void
}) {
  const stripe = useStripe()
  const elements = useElements()
  const [isProcessing, setIsProcessing] = useState(false)
  const [clientSecret, setClientSecret] = useState<string | null>(null)

  // Initialize payment intent
  const initializePayment = async () => {
    try {
      const response = await fetch('/api/tasks/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('supabase.auth.token')}`
        },
        body: JSON.stringify({
          submissionId: submission.id,
          taskId: task.id,
          amount: parseFloat(task.earningPotential),
          paymentType: 'task_completion'
        })
      })

      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to initialize payment')
      }

      if (result.paymentType === 'platform_funded') {
        // Platform-funded task - payment processed automatically
        onSuccess(result)
        return
      }

      setClientSecret(result.clientSecret)
    } catch (error: any) {
      onError(error.message)
    }
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!stripe || !elements || !clientSecret) {
      return
    }

    setIsProcessing(true)

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/dashboard`,
        },
        redirect: 'if_required',
      })

      if (error) {
        onError(error.message || 'Payment failed')
      } else if (paymentIntent?.status === 'succeeded') {
        onSuccess({ paymentIntent })
      }
    } catch (error: any) {
      onError(error.message)
    } finally {
      setIsProcessing(false)
    }
  }

  // For platform-funded tasks, show instant payment UI
  if (task.type === 'platform_funded') {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
          <CheckCircle className="h-5 w-5 text-green-600" />
          <div>
            <p className="font-medium text-green-800 dark:text-green-200">
              Platform-Funded Task
            </p>
            <p className="text-sm text-green-600 dark:text-green-400">
              Payment processed automatically upon verification
            </p>
          </div>
        </div>
        
        <Button 
          onClick={initializePayment} 
          className="w-full" 
          size="lg"
          disabled={isProcessing}
        >
          {isProcessing ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Processing Payment...
            </>
          ) : (
            <>
              <DollarSign className="h-4 w-4 mr-2" />
              Claim ${task.earningPotential}
            </>
          )}
        </Button>
      </div>
    )
  }

  // For P2P and corporate tasks, show payment form
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {!clientSecret ? (
        <Button 
          type="button"
          onClick={initializePayment} 
          className="w-full" 
          size="lg"
        >
          Initialize Payment
        </Button>
      ) : (
        <>
          <PaymentElement />
          <Button 
            type="submit" 
            disabled={!stripe || isProcessing} 
            className="w-full" 
            size="lg"
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              `Pay $${task.earningPotential}`
            )}
          </Button>
        </>
      )}
    </form>
  )
}

export function TaskPaymentModal({ 
  isOpen, 
  onClose, 
  task, 
  submission 
}: TaskPaymentModalProps) {
  const { toast } = useToast()
  const [paymentSuccess, setPaymentSuccess] = useState(false)

  const handlePaymentSuccess = (result: any) => {
    setPaymentSuccess(true)
    toast({
      title: "Payment Successful!",
      description: `You've earned $${task.earningPotential} for completing "${task.title}"`,
    })
  }

  const handlePaymentError = (error: string) => {
    toast({
      title: "Payment Error",
      description: error,
      variant: "destructive",
    })
  }

  const getTaskTypeBadge = () => {
    const variants = {
      platform_funded: { color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200', label: 'Platform Funded' },
      peer_to_peer: { color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-200', label: 'Peer-to-Peer' },
      corporate_sponsored: { color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-200', label: 'Corporate Sponsored' }
    }
    
    const variant = variants[task.type]
    return <Badge className={variant.color}>{variant.label}</Badge>
  }

  const getVerificationBadge = () => {
    const statusConfig = {
      auto_verified: { color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200', label: 'Auto-Verified' },
      manual_review: { color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200', label: 'Under Review' },
      rejected: { color: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-200', label: 'Rejected' }
    }
    
    const config = statusConfig[submission.verificationStatus as keyof typeof statusConfig] || 
                   { color: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-200', label: 'Pending' }
    
    return <Badge className={config.color}>{config.label}</Badge>
  }

  if (paymentSuccess) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Payment Successful!
            </DialogTitle>
            <DialogDescription>
              Your earnings have been processed and added to your account.
            </DialogDescription>
          </DialogHeader>
          
          <div className="text-center py-6">
            <div className="text-3xl font-bold text-green-600 mb-2">
              +${task.earningPotential}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Earned from: {task.title}
            </p>
          </div>
          
          <Button onClick={onClose} className="w-full">
            Continue to Dashboard
          </Button>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Task Payment</DialogTitle>
          <DialogDescription>
            Process payment for your completed task verification
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Task Info */}
          <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-medium truncate">{task.title}</h3>
              {getTaskTypeBadge()}
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Earning Potential:</span>
              <span className="font-bold text-green-600">${task.earningPotential}</span>
            </div>
          </div>

          {/* Verification Status */}
          <div className="p-4 border rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Verification Status:</span>
              {getVerificationBadge()}
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-1">
                <Shield className="h-4 w-4 text-blue-500" />
                <span>Quality Score: {submission.autoVerificationScore}/100</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4 text-orange-500" />
                <span>Fraud Risk: {submission.fraudDetectionScore}/100</span>
              </div>
            </div>
          </div>

          {/* Payment Form */}
          {submission.verificationStatus === 'auto_verified' && !submission.paymentReleased ? (
            <Elements stripe={stripePromise}>
              <PaymentForm
                task={task}
                submission={submission}
                onSuccess={handlePaymentSuccess}
                onError={handlePaymentError}
              />
            </Elements>
          ) : submission.paymentReleased ? (
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg text-center">
              <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <p className="font-medium text-green-800 dark:text-green-200">
                Payment Already Processed
              </p>
              <p className="text-sm text-green-600 dark:text-green-400">
                Your earnings have been added to your account
              </p>
            </div>
          ) : (
            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg text-center">
              <Clock className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
              <p className="font-medium text-yellow-800 dark:text-yellow-200">
                Verification Required
              </p>
              <p className="text-sm text-yellow-600 dark:text-yellow-400">
                Payment will be available once verification is complete
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}