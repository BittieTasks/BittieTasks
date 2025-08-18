'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Check, Crown, Zap } from 'lucide-react'
import Link from 'next/link'

export default function SubscriptionSuccessPage() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id')
  const [isVerifying, setIsVerifying] = useState(true)
  const [verificationStatus, setVerificationStatus] = useState<'success' | 'error' | 'pending'>('pending')

  useEffect(() => {
    if (sessionId) {
      // Simulate verification process
      setTimeout(() => {
        setVerificationStatus('success')
        setIsVerifying(false)
      }, 2000)
    } else {
      setVerificationStatus('error')
      setIsVerifying(false)
    }
  }, [sessionId])

  if (isVerifying) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center px-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <div className="mx-auto w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mb-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
            <CardTitle>Verifying Subscription</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-gray-400">
              Please wait while we confirm your subscription...
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (verificationStatus === 'error') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center px-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mb-4">
              <div className="text-red-600 text-2xl">✗</div>
            </div>
            <CardTitle className="text-red-600">Subscription Error</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600 dark:text-gray-400">
              There was an issue verifying your subscription. Please contact support.
            </p>
            <Button asChild className="w-full">
              <Link href="/subscribe">Try Again</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center px-4">
      <Card className="w-full max-w-lg text-center">
        <CardHeader>
          <div className="mx-auto w-20 h-20 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mb-6">
            <Check className="h-10 w-10 text-green-600" />
          </div>
          <CardTitle className="text-3xl text-green-600 mb-2">Welcome to Premium!</CardTitle>
          <p className="text-gray-600 dark:text-gray-400">
            Your subscription has been activated successfully
          </p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <h3 className="font-semibold mb-3">What's Next?</h3>
            <div className="space-y-2 text-sm text-left">
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                <span>Access unlimited task applications</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                <span>Create and manage your own tasks</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                <span>Enjoy priority customer support</span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <Button asChild className="w-full bg-blue-600 hover:bg-blue-700">
              <Link href="/app">Start Exploring Tasks</Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href="/app/profile">Manage Subscription</Link>
            </Button>
          </div>

          <p className="text-xs text-gray-500 dark:text-gray-400">
            Session ID: {sessionId}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}