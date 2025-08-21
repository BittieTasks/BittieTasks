'use client'

import { useState } from 'react'
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ArrowLeft, CreditCard, CheckCircle, AlertCircle } from 'lucide-react'
import { useToast } from '@/app/hooks/use-toast'

interface SubscriptionCheckoutProps {
  planId: string
  onCancel: () => void
}

const planDetails = {
  pro: {
    name: 'Pro Plan',
    price: '$9.99/month',
    savings: 'Save 30% on platform fees',
    features: ['50 tasks per month', '7% platform fee', 'Priority support']
  },
  premium: {
    name: 'Premium Plan', 
    price: '$19.99/month',
    savings: 'Save 50% on platform fees',
    features: ['Unlimited tasks', '5% platform fee', 'Premium support', 'Ad-free experience']
  }
}

export function SubscriptionCheckout({ planId, onCancel }: SubscriptionCheckoutProps) {
  const stripe = useStripe()
  const elements = useElements()
  const { toast } = useToast()
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const plan = planDetails[planId as keyof typeof planDetails]

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!stripe || !elements) {
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
          return_url: `${window.location.origin}/subscription/success?plan=${planId}`,
        },
      })

      if (confirmError) {
        setError(confirmError.message || 'Payment failed')
        setIsProcessing(false)
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred')
      setIsProcessing(false)
    }
  }

  if (!plan) {
    return (
      <div className="text-center">
        <p className="text-red-600">Invalid subscription plan</p>
        <Button onClick={onCancel} variant="outline" className="mt-4">
          Go Back
        </Button>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Button 
          onClick={onCancel}
          variant="ghost" 
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Plans
        </Button>
        
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">Complete Your Subscription</h1>
          <p className="text-gray-600">
            You're subscribing to the {plan.name} - {plan.savings}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Plan Summary */}
        <Card className="border-teal-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-teal-600" />
              {plan.name}
            </CardTitle>
            <CardDescription>
              <span className="text-2xl font-bold text-teal-600">{plan.price}</span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium text-green-700 bg-green-50 p-3 rounded-lg">
                <CheckCircle className="h-4 w-4" />
                {plan.savings}
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium">What's included:</h4>
                <ul className="space-y-1">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm text-gray-600">
                      <CheckCircle className="h-3 w-3 text-green-500" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="text-xs text-gray-500 mt-4 p-3 bg-gray-50 rounded">
                <strong>Note:</strong> Your subscription will auto-renew monthly. You can cancel anytime 
                from your account settings. Platform fee savings apply immediately to all task earnings.
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Form */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Details</CardTitle>
            <CardDescription>
              Enter your payment information to complete the subscription
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-4">
                <PaymentElement 
                  options={{
                    layout: 'tabs'
                  }}
                />
              </div>

              <div className="space-y-4">
                <Button
                  type="submit"
                  className="w-full bg-teal-600 hover:bg-teal-700"
                  disabled={!stripe || !elements || isProcessing}
                >
                  {isProcessing ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                      Processing...
                    </div>
                  ) : (
                    `Subscribe to ${plan.name}`
                  )}
                </Button>

                <p className="text-xs text-gray-500 text-center">
                  By subscribing, you agree to our Terms of Service and Privacy Policy. 
                  Your payment is secured by Stripe.
                </p>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}