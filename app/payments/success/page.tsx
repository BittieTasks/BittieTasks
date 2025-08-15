'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, ArrowRight, DollarSign, Calendar, MapPin } from 'lucide-react'
import { useAuth } from '@/components/auth/AuthProvider'
import { formatCurrency } from '@/lib/fee-calculator'

interface PaymentDetails {
  taskId: string
  taskTitle: string
  taskType: string
  amount: number
  netAmount: number
  platformFee: number
  processingFee: number
  paymentIntentId: string
  status: string
  completedAt: string
}

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { user, isAuthenticated } = useAuth()
  
  const [loading, setLoading] = useState(true)
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails | null>(null)
  const [error, setError] = useState('')
  
  const paymentIntentId = searchParams.get('payment_intent')
  const taskId = searchParams.get('task_id')

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth')
      return
    }

    if (!paymentIntentId && !taskId) {
      router.push('/dashboard')
      return
    }

    // In a real implementation, you'd fetch payment details from your API
    // For now, we'll simulate success
    setTimeout(() => {
      setPaymentDetails({
        taskId: taskId || 'demo-task',
        taskTitle: 'Walk My Dog for 30 Minutes',
        taskType: 'community',
        amount: 25.00,
        netAmount: 22.85,
        platformFee: 1.75,
        processingFee: 0.40,
        paymentIntentId: paymentIntentId || 'pi_demo',
        status: 'succeeded',
        completedAt: new Date().toLocaleString()
      })
      setLoading(false)
    }, 1500)
  }, [isAuthenticated, paymentIntentId, taskId, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 to-emerald-100 p-4 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 bg-teal-600 rounded-full mx-auto animate-pulse"></div>
          <p className="text-gray-600">Confirming your payment...</p>
        </div>
      </div>
    )
  }

  if (error || !paymentDetails) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 p-4 flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <CardTitle className="text-red-600">Payment Error</CardTitle>
            <CardDescription>
              {error || 'Unable to retrieve payment details'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push('/dashboard')} className="w-full">
              Return to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-emerald-100 p-4 flex items-center justify-center">
      <div className="max-w-2xl w-full space-y-6">
        {/* Success Header */}
        <Card className="shadow-lg">
          <CardHeader className="text-center pb-3">
            <div className="mx-auto mb-4">
              <CheckCircle className="w-16 h-16 text-green-600" />
            </div>
            <CardTitle className="text-2xl text-green-800">
              Payment Successful!
            </CardTitle>
            <CardDescription className="text-lg">
              Your payment has been processed and the task is now active.
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Task Details */}
        <Card className="shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-teal-600" />
                Task Payment Details
              </CardTitle>
              <Badge className="capitalize bg-teal-100 text-teal-800">
                {paymentDetails.taskType} Task
              </Badge>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
              <h3 className="font-semibold text-teal-800 mb-2">
                {paymentDetails.taskTitle}
              </h3>
              <div className="flex items-center gap-4 text-sm text-teal-700">
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  <span>Local Area</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>{paymentDetails.completedAt}</span>
                </div>
              </div>
            </div>

            {/* Payment Breakdown */}
            <div className="space-y-3">
              <h4 className="font-medium text-gray-800">Payment Breakdown</h4>
              
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Task Amount</span>
                  <span className="font-semibold">
                    {formatCurrency(paymentDetails.amount)}
                  </span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Platform Fee</span>
                  <span className="text-red-600">
                    -{formatCurrency(paymentDetails.platformFee)}
                  </span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Processing Fee</span>
                  <span className="text-red-600">
                    -{formatCurrency(paymentDetails.processingFee)}
                  </span>
                </div>
                
                <div className="border-t pt-2 flex justify-between font-semibold">
                  <span className="text-gray-800">You'll Receive</span>
                  <span className="text-green-700">
                    {formatCurrency(paymentDetails.netAmount)}
                  </span>
                </div>
              </div>
            </div>

            {/* Payment Info */}
            <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded">
              <p><strong>Payment ID:</strong> {paymentDetails.paymentIntentId}</p>
              <p><strong>Status:</strong> {paymentDetails.status}</p>
              <p><strong>Processed:</strong> {paymentDetails.completedAt}</p>
            </div>
          </CardContent>
        </Card>

        {/* Next Steps */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>What's Next?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-800 mb-2">Task Now Active</h4>
              <p className="text-sm text-blue-700">
                The task poster has been notified of your payment. You can track progress 
                and communicate through your dashboard.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <Button 
                onClick={() => router.push(`/task/${paymentDetails.taskId}`)}
                className="flex-1 bg-teal-600 hover:bg-teal-700"
              >
                <ArrowRight className="w-4 h-4 mr-2" />
                View Task Details
              </Button>
              <Button 
                variant="outline"
                onClick={() => router.push('/dashboard')}
                className="flex-1"
              >
                Return to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Receipt Note */}
        <div className="text-center">
          <p className="text-sm text-gray-600">
            A receipt has been sent to your email address. 
            Need help? Contact{' '}
            <a href="mailto:support@bittietasks.com" className="text-teal-600 hover:underline">
              support@bittietasks.com
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}