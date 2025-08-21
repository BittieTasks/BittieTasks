'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Mail, RefreshCw, ArrowLeft, CheckCircle } from 'lucide-react'
import { useToast } from @/app/hooks/use-toast'
import Link from 'next/link'

export default function EmailVerificationRequired() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleResendVerification = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) {
      toast({
        title: 'Email Required',
        description: 'Please enter your email address to resend verification.',
        variant: 'destructive',
      })
      return
    }
    
    setLoading(true)
    
    try {
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      
      if (response.ok) {
        toast({
          title: 'Verification Email Sent',
          description: 'Please check your email for the verification link. Check your spam folder if you don\'t see it.',
        })
      } else {
        const data = await response.json()
        toast({
          title: 'Failed to Send Email',
          description: data.error || 'Please try again or contact support if the problem persists.',
          variant: 'destructive',
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to send verification email. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-emerald-100 p-4 flex items-center justify-center">
      <div className="max-w-md w-full space-y-4">
        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4">
              <Mail className="w-16 h-16 text-teal-600" />
            </div>
            <CardTitle className="text-2xl">Verify Your Email</CardTitle>
            <CardDescription className="text-base">
              Before accessing BittieTasks, you need to verify your email address.
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="bg-teal-50 p-4 rounded-lg border border-teal-200">
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-teal-600 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-teal-800">Check your email</p>
                  <p className="text-teal-700 mt-1">
                    We've sent a verification link to your email address. Click the link to activate your account and access all features.
                  </p>
                </div>
              </div>
            </div>

            <div className="text-center text-sm text-gray-600 space-y-2">
              <p>Haven't received the email?</p>
              <ul className="text-xs space-y-1 text-left bg-gray-50 p-3 rounded">
                <li>• Check your spam/junk folder</li>
                <li>• Make sure you entered the correct email</li>
                <li>• Wait a few minutes for delivery</li>
              </ul>
            </div>

            <form onSubmit={handleResendVerification} className="space-y-4">
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  required
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full bg-teal-600 hover:bg-teal-700"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Mail className="w-4 h-4 mr-2" />
                    Resend Verification Email
                  </>
                )}
              </Button>
            </form>

            <div className="pt-4 border-t">
              <Link href="/auth">
                <Button variant="outline" className="w-full">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Sign In
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <div className="text-center">
          <p className="text-sm text-gray-600">
            Need help? Contact us at{' '}
            <a href="mailto:support@bittietasks.com" className="text-teal-600 hover:underline">
              support@bittietasks.com
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}