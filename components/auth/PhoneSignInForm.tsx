'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Phone, AlertCircle } from "lucide-react"
import { useToast } from "@/app/hooks/use-toast"
import { useAuth } from '@/components/auth/SimpleAuthProvider'

interface PhoneSignInFormProps {
  onSuccess?: () => void
  onSwitchToSignUp?: () => void
}

export function PhoneSignInForm({ onSuccess, onSwitchToSignUp }: PhoneSignInFormProps) {
  const [step, setStep] = useState<'signin' | 'verify'>('signin')
  const [formData, setFormData] = useState({
    phoneNumber: ''
  })
  const [verificationCode, setVerificationCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { toast } = useToast()
  const { refreshAuth } = useAuth()

  const formatPhoneNumber = (value: string) => {
    // Remove all non-digit characters
    const phone = value.replace(/\D/g, '')
    
    // Format US phone numbers as (xxx) xxx-xxxx
    if (phone.length <= 3) {
      return phone
    } else if (phone.length <= 6) {
      return `(${phone.slice(0, 3)}) ${phone.slice(3)}`
    } else {
      return `(${phone.slice(0, 3)}) ${phone.slice(3, 6)}-${phone.slice(6, 10)}`
    }
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value)
    setFormData(prev => ({ ...prev, phoneNumber: formatted }))
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Basic validation
      if (!formData.phoneNumber) {
        setError('Phone number is required')
        return
      }

      // Extract just digits for API call
      const phoneDigits = formData.phoneNumber.replace(/\D/g, '')
      if (phoneDigits.length !== 10) {
        setError('Please enter a valid 10-digit phone number')
        return
      }

      const response = await fetch('/api/auth/supabase-phone-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber: phoneDigits
        })
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to send verification code')
        return
      }

      if (data.success && data.needsVerification) {
        setStep('verify')
        toast({
          title: "Verification Code Sent",
          description: "Check your messages for the login code.",
        })
      }

    } catch (error) {
      console.error('Sign in error:', error)
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleVerification = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (!verificationCode || verificationCode.length !== 6) {
        setError('Please enter the 6-digit verification code')
        return
      }

      const phoneDigits = formData.phoneNumber.replace(/\D/g, '')

      const response = await fetch('/api/auth/supabase-verify-phone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber: phoneDigits,
          code: verificationCode
        })
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Verification failed')
        return
      }

      if (data.success) {
        toast({
          title: "Welcome back!",
          description: "You've successfully signed in.",
        })
        
        // Refresh auth state and reload page
        if (typeof window !== 'undefined') {
          window.location.reload()
        }
        onSuccess?.()
      }

    } catch (error) {
      console.error('Verification error:', error)
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const resendCode = async () => {
    setLoading(true)
    try {
      const phoneDigits = formData.phoneNumber.replace(/\D/g, '')
      const response = await fetch('/api/auth/supabase-phone-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber: phoneDigits
        })
      })

      if (response.ok) {
        toast({
          title: "Code Resent",
          description: "Check your messages for the new verification code.",
        })
      }
    } catch (error) {
      console.error('Resend error:', error)
    } finally {
      setLoading(false)
    }
  }

  if (step === 'verify') {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="space-y-1">
          <div className="flex items-center gap-2">
            <Phone className="h-6 w-6 text-green-600" />
            <CardTitle className="text-2xl">Verify Your Phone</CardTitle>
          </div>
          <CardDescription>
            We sent a 6-digit code to {formData.phoneNumber}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleVerification} className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 p-3 text-sm text-red-600 bg-red-50 rounded-md">
                <AlertCircle className="h-4 w-4" />
                {error}
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="code">Verification Code</Label>
              <Input
                id="code"
                type="text"
                placeholder="123456"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                maxLength={6}
                className="text-center text-2xl tracking-widest"
                data-testid="input-verification-code"
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading} data-testid="button-verify-code">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                'Sign In'
              )}
            </Button>

            <div className="text-center">
              <Button 
                type="button" 
                variant="link" 
                onClick={resendCode}
                disabled={loading}
                data-testid="button-resend-code"
              >
                Didn't receive a code? Resend
              </Button>
            </div>

            <div className="text-center">
              <Button 
                type="button" 
                variant="link" 
                onClick={() => setStep('signin')}
                data-testid="button-back-to-signin"
              >
                ← Back to Sign In
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-1">
        <div className="flex items-center gap-2">
          <Phone className="h-6 w-6 text-blue-600" />
          <CardTitle className="text-2xl">Welcome Back</CardTitle>
        </div>
        <CardDescription>
          Enter your phone number to receive a verification code
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSignIn} className="space-y-4">
          {error && (
            <div className="flex items-center gap-2 p-3 text-sm text-red-600 bg-red-50 rounded-md">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="(555) 123-4567"
              value={formData.phoneNumber}
              onChange={handlePhoneChange}
              data-testid="input-phone-number"
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading} data-testid="button-sign-in">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending Code...
              </>
            ) : (
              'Send Verification Code'
            )}
          </Button>

          <div className="text-center">
            <Button 
              type="button" 
              variant="link" 
              onClick={onSwitchToSignUp}
              data-testid="button-switch-to-signup"
            >
              Don't have an account? Sign up
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}