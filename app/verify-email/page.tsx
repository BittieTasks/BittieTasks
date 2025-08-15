'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react'

export default function VerifyEmailPage() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get('token')

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setStatus('error')
        setMessage('Invalid verification link. No token provided.')
        return
      }

      try {
        const response = await fetch('/api/auth/verify-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token })
        })

        const data = await response.json()

        if (response.ok && data.success) {
          setStatus('success')
          setMessage(data.message || 'Email verified successfully!')
          
          // Auto-redirect to dashboard after success
          setTimeout(() => {
            router.push('/dashboard')
          }, 3000)
        } else {
          setStatus('error')
          setMessage(data.error || 'Verification failed. Please try again.')
        }
      } catch (error) {
        console.error('Verification error:', error)
        setStatus('error')
        setMessage('An error occurred during verification. Please try again.')
      }
    }

    verifyEmail()
  }, [token, router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-emerald-100 p-4 flex items-center justify-center">
      <div className="max-w-md w-full">
        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4">
              {status === 'loading' && (
                <Loader2 className="w-12 h-12 text-teal-600 animate-spin" />
              )}
              {status === 'success' && (
                <CheckCircle className="w-12 h-12 text-green-600" />
              )}
              {status === 'error' && (
                <AlertCircle className="w-12 h-12 text-red-600" />
              )}
            </div>
            
            <CardTitle className="text-xl">
              {status === 'loading' && 'Verifying Email...'}
              {status === 'success' && 'Email Verified!'}
              {status === 'error' && 'Verification Failed'}
            </CardTitle>
            
            <CardDescription className="mt-2">
              {message}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="text-center">
            {status === 'success' && (
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  Redirecting to your dashboard in 3 seconds...
                </p>
                <Button 
                  onClick={() => router.push('/dashboard')}
                  className="bg-teal-600 hover:bg-teal-700"
                >
                  Go to Dashboard Now
                </Button>
              </div>
            )}
            
            {status === 'error' && (
              <div className="space-y-3">
                <Button 
                  onClick={() => router.push('/auth')}
                  className="bg-teal-600 hover:bg-teal-700 w-full"
                >
                  Back to Sign In
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => window.location.reload()}
                  className="w-full"
                >
                  Try Again
                </Button>
              </div>
            )}
            
            {status === 'loading' && (
              <p className="text-sm text-gray-600">
                Please wait while we verify your email address...
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}