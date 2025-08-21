'use client'

import { useState, useEffect } from 'react'
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { loadStripe, type StripeElementsOptions } from '@stripe/stripe-js'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, CreditCard, CheckCircle, AlertTriangle, DollarSign } from 'lucide-react'
import { useToast } from '@/app/hooks/use-toast'
import { useAuth } from '@/components/auth/SimpleAuthProvider'
import FeeBreakdown from './FeeBreakdown'
import { EscrowStatus } from './EscrowStatus'
import type { TaskType } from '@/lib/fee-calculator'

// Initialize Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_VITE_STRIPE_PUBLIC_KEY || process.env.VITE_STRIPE_PUBLIC_KEY || '')

interface PaymentModalProps {
  open: boolean
  onClose: () => void
  taskId: string
  taskType: TaskType
  taskTitle: string
  amount: number
  description?: string
  onSuccess?: (paymentIntentId: string) => void
}

interface PaymentFormProps {
  taskId: string
  taskType: TaskType
  taskTitle: string
  amount: number
  description?: string
  onSuccess?: (paymentIntentId: string) => void
  onClose: () => void
}

function PaymentForm({ 
  taskId, 
  taskType, 
  taskTitle, 
  amount, 
  description,
  onSuccess,
  onClose 
}: PaymentFormProps) {
  const stripe = useStripe()
  const elements = useElements()
  const { user } = useAuth()
  const { toast } = useToast()
  
  const [loading, setLoading] = useState(false)
  const [clientSecret, setClientSecret] = useState('')
  const [error, setError] = useState('')
  const [paymentIntentId, setPaymentIntentId] = useState('')
  const [feeBreakdown, setFeeBreakdown] = useState<any>(null)

  // Create payment intent when component mounts
  useEffect(() => {
    if (!user?.id) return

    const createPaymentIntent = async () => {
      try {
        const response = await fetch('/api/payments/create-intent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            taskId,
            taskType,
            amount,
            description: description || `Payment for ${taskTitle}`,
            userId: user.id
          })
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Failed to create payment intent')
        }

        if (data.barter) {
          // Barter task - no payment needed
          toast({
            title: 'Barter Task Confirmed',
            description: 'No payment required for barter exchanges!'
          })
          onSuccess?.(taskId)
          onClose()
          return
        }

        setClientSecret(data.clientSecret)
        setPaymentIntentId(data.paymentIntentId)
        setFeeBreakdown(data.feeBreakdown)

      } catch (error: any) {
        setError(error.message || 'Failed to initialize payment')
        console.error('Payment intent creation failed:', error)
      }
    }

    createPaymentIntent()
  }, [user?.id, taskId, taskType, amount, description, taskTitle, onSuccess, onClose, toast])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!stripe || !elements || !clientSecret) {
      return
    }

    setLoading(true)
    setError('')

    try {
      const { error: submitError } = await elements.submit()
      if (submitError) {
        throw new Error(submitError.message)
      }

      const { error: confirmError, paymentIntent } = await stripe.confirmPayment({
        elements,
        clientSecret,
        confirmParams: {
          return_url: `${window.location.origin}/task/${taskId}?payment=success`,
        },
        redirect: 'if_required'
      })

      if (confirmError) {
        throw new Error(confirmError.message)
      }

      if (paymentIntent?.status === 'succeeded') {
        toast({
          title: 'Payment Successful!',
          description: `Your payment for ${taskTitle} has been processed.`
        })
        onSuccess?.(paymentIntent.id)
        onClose()
      }

    } catch (error: any) {
      setError(error.message || 'Payment failed. Please try again.')
      toast({
        title: 'Payment Failed',
        description: error.message || 'Your payment could not be processed.',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  if (error) {
    return (
      <div className="space-y-4">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button 
            onClick={() => window.location.reload()} 
            className="flex-1"
          >
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  if (!clientSecret) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center space-y-2">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-teal-600" />
          <p className="text-sm text-gray-600">Preparing payment...</p>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Task Summary */}
      <Card className="bg-gradient-to-r from-teal-50 to-emerald-50 border-teal-200">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">{taskTitle}</CardTitle>
            <Badge variant="outline" className="capitalize">
              {taskType} Task
            </Badge>
          </div>
          {description && (
            <CardDescription>{description}</CardDescription>
          )}
        </CardHeader>
      </Card>

      {/* Fee Breakdown */}
      <FeeBreakdown 
        amount={amount} 
        taskType={taskType}
        variant="detailed" 
      />

      {/* Escrow Status */}
      {feeBreakdown && (
        <EscrowStatus 
          isEscrow={feeBreakdown.isEscrow}
          escrowThreshold={feeBreakdown.escrowThreshold}
          amount={amount}
          status="pending"
        />
      )}

      {/* Payment Element */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Payment Method
          </CardTitle>
        </CardHeader>
        <CardContent>
          <PaymentElement 
            options={{
              layout: 'tabs'
            }}
          />
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-3">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onClose}
          disabled={loading}
          className="flex-1"
        >
          Cancel
        </Button>
        <Button 
          type="submit" 
          disabled={!stripe || loading}
          className="flex-1 bg-teal-600 hover:bg-teal-700"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <DollarSign className="w-4 h-4 mr-2" />
              Pay Now
            </>
          )}
        </Button>
      </div>
    </form>
  )
}

export function PaymentModal({ 
  open, 
  onClose, 
  taskId, 
  taskType, 
  taskTitle, 
  amount,
  description,
  onSuccess 
}: PaymentModalProps) {
  if (!process.env.NEXT_PUBLIC_VITE_STRIPE_PUBLIC_KEY && !process.env.VITE_STRIPE_PUBLIC_KEY) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Payment system is not configured. Please contact support.
            </AlertDescription>
          </Alert>
        </DialogContent>
      </Dialog>
    )
  }

  const stripeOptions: StripeElementsOptions = {
    appearance: {
      theme: 'stripe',
      variables: {
        colorPrimary: '#0d9488', // Teal-600
        colorBackground: '#ffffff',
        colorText: '#1f2937',
        colorDanger: '#dc2626',
        borderRadius: '8px'
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-teal-600" />
            Complete Payment
          </DialogTitle>
        </DialogHeader>
        
        <Elements stripe={stripePromise} options={stripeOptions}>
          <PaymentForm
            taskId={taskId}
            taskType={taskType}
            taskTitle={taskTitle}
            amount={amount}
            description={description}
            onSuccess={onSuccess}
            onClose={onClose}
          />
        </Elements>
      </DialogContent>
    </Dialog>
  )
}

export default PaymentModal