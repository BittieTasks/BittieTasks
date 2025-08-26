'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Phone, CheckCircle, AlertCircle } from "lucide-react"
import { useToast } from "@/app/hooks/use-toast"

interface PhoneSignUpFormProps {
  onSuccess?: () => void
  onSwitchToSignIn?: () => void
}

export function PhoneSignUpForm({ onSuccess, onSwitchToSignIn }: PhoneSignUpFormProps) {
  const [step, setStep] = useState<'signup' | 'verify'>('signup')
  const [formData, setFormData] = useState({
    phoneNumber: '',
    firstName: '',
    lastName: '',
    password: ''
  })
  const [verificationCode, setVerificationCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { toast } = useToast()

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

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Basic validation
      if (!formData.phoneNumber || !formData.firstName || !formData.lastName || !formData.password) {
        setError('All fields are required')
        return
      }

      if (formData.password.length < 6) {
        setError('Password must be at least 6 characters')
        return
      }

      // Extract just digits for API call
      const phoneDigits = formData.phoneNumber.replace(/\D/g, '')
      if (phoneDigits.length !== 10) {
        setError('Please enter a valid 10-digit phone number')
        return
      }

      const response = await fetch('/api/auth/supabase-phone-signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber: phoneDigits,
          firstName: formData.firstName,
          lastName: formData.lastName,
          password: formData.password
        })
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Sign up failed')
        return
      }

      if (data.success && data.needsVerification) {
        setStep('verify')
        toast({
          title: "Account Created!",
          description: "Please check your messages for a verification code.",
        })
      }

    } catch (error) {
      console.error('Sign up error:', error)
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
          title: "Phone Verified!",
          description: "Your account is ready. You can now sign in.",
        })
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
      const response = await fetch('/api/auth/supabase-phone-signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber: phoneDigits,
          firstName: formData.firstName,
          lastName: formData.lastName,
          password: formData.password
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
            <CheckCircle className="h-6 w-6 text-green-600" />
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
                'Verify Phone Number'
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
                onClick={() => setStep('signup')}
                data-testid="button-back-to-signup"
              >
                ← Back to Sign Up
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
          <CardTitle className="text-2xl">Create Account</CardTitle>
        </div>
        <CardDescription>
          Enter your phone number and details to get started
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSignUp} className="space-y-4">
          {error && (
            <div className="flex items-center gap-2 p-3 text-sm text-red-600 bg-red-50 rounded-md">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          )}
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                type="text"
                placeholder="John"
                value={formData.firstName}
                onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                data-testid="input-first-name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                type="text"
                placeholder="Doe"
                value={formData.lastName}
                onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                data-testid="input-last-name"
              />
            </div>
          </div>

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

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="At least 6 characters"
              value={formData.password}
              onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
              data-testid="input-password"
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading} data-testid="button-create-account">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Account...
              </>
            ) : (
              'Create Account'
            )}
          </Button>

          <div className="text-center">
            <Button 
              type="button" 
              variant="link" 
              onClick={onSwitchToSignIn}
              data-testid="button-switch-to-signin"
            >
              Already have an account? Sign in
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}