'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle, XCircle, Loader2 } from 'lucide-react'

export default function VerifyEmailPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const token = searchParams.get('token')
    
    if (!token) {
      setStatus('error')
      setMessage('Invalid verification link. No token provided.')
      return
    }

    verifyToken(token)
  }, [searchParams])

  const verifyToken = async (token: string) => {
    try {
      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setStatus('success')
        setMessage(data.message)
        
        // Redirect to marketplace after 3 seconds
        setTimeout(() => {
          router.push(data.redirectUrl || '/marketplace')
        }, 3000)
      } else {
        setStatus('error')
        setMessage(data.error || 'Verification failed')
      }
    } catch (error) {
      setStatus('error')
      setMessage('Network error. Please check your connection and try again.')
    }
  }

  const handleReturnToAuth = () => {
    router.push('/auth')
  }

  const handleGoToMarketplace = () => {
    router.push('/marketplace')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-teal-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-2xl">B</span>
            </div>
          </div>
          <CardTitle className="text-2xl text-gray-900">Email Verification</CardTitle>
        </CardHeader>

        <CardContent className="text-center space-y-6">
          {status === 'loading' && (
            <div className="space-y-4">
              <Loader2 className="h-12 w-12 text-teal-600 animate-spin mx-auto" />
              <p className="text-gray-600">Verifying your email address...</p>
            </div>
          )}

          {status === 'success' && (
            <div className="space-y-4">
              <CheckCircle className="h-12 w-12 text-green-600 mx-auto" />
              <div className="space-y-2">
                <p className="text-green-700 font-medium">{message}</p>
                <p className="text-sm text-gray-600">
                  Redirecting to marketplace in 3 seconds...
                </p>
              </div>
              <Button 
                onClick={handleGoToMarketplace}
                className="w-full bg-teal-600 hover:bg-teal-700"
              >
                Go to Marketplace Now
              </Button>
            </div>
          )}

          {status === 'error' && (
            <div className="space-y-4">
              <XCircle className="h-12 w-12 text-red-600 mx-auto" />
              <div className="space-y-2">
                <p className="text-red-700 font-medium">Verification Failed</p>
                <p className="text-sm text-gray-600">{message}</p>
              </div>
              <div className="space-y-2">
                <Button 
                  onClick={handleReturnToAuth}
                  className="w-full bg-teal-600 hover:bg-teal-700"
                >
                  Request New Verification Email
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => router.push('/')}
                  className="w-full"
                >
                  Return to Homepage
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}