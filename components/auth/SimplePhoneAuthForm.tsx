'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Phone, CheckCircle, AlertCircle, MessageSquare } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface SimplePhoneAuthFormProps {
  onSuccess?: () => void
}

export function SimplePhoneAuthForm({ onSuccess }: SimplePhoneAuthFormProps) {
  const [mode, setMode] = useState<'signup' | 'signin'>('signup')
  const [step, setStep] = useState<'phone' | 'otp'>('phone')
  const [formData, setFormData] = useState({
    phoneNumber: '',
    firstName: '',
    lastName: '',
    otp: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { toast } = useToast()

  const formatPhoneNumber = (value: string) => {
    const phone = value.replace(/\D/g, '')
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (step === 'phone') {
        // Step 1: Phone number validation and OTP sending
        if (!formData.phoneNumber) {
          setError('Phone number is required')
          return
        }

        if (mode === 'signup' && (!formData.firstName || !formData.lastName)) {
          setError('First name and last name are required for signup')
          return
        }

        // Extract just digits for API call
        const phoneDigits = formData.phoneNumber.replace(/\D/g, '')
        if (phoneDigits.length !== 10) {
          setError('Please enter a valid 10-digit phone number')
          return
        }

        const endpoint = mode === 'signup' ? '/api/auth/simple-phone-signup' : '/api/auth/simple-phone-signin'
        const payload = mode === 'signup' ? {
          phoneNumber: phoneDigits,
          firstName: formData.firstName,
          lastName: formData.lastName
        } : {
          phoneNumber: phoneDigits
        }

        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })

        const data = await response.json()

        if (!response.ok || !data.success) {
          // Check for mode switching hints in response
          if (data.requiresSignin) {
            setMode('signin')
            setError('Please try signing in instead.')
            return
          } else if (data.requiresSignup) {
            setMode('signup')
            setError('Please try signing up instead.')
            return
          }
          setError(data.message || data.error || `${mode === 'signup' ? 'Sign up' : 'Sign in'} failed`)
          return
        }

        if (data.requiresOtp) {
          // Move to OTP verification step
          setStep('otp')
          toast({
            title: "Verification Code Sent",
            description: "Please check your phone for the verification code.",
          })
        } else if (data.verified) {
          // Authentication complete (shouldn't happen in new flow, but handle it)
          handleAuthSuccess()
        }

      } else if (step === 'otp') {
        // Step 2: OTP verification
        if (!formData.otp) {
          setError('Verification code is required')
          return
        }

        if (formData.otp.length !== 6) {
          setError('Please enter the 6-digit verification code')
          return
        }

        const phoneDigits = formData.phoneNumber.replace(/\D/g, '')
        const endpoint = mode === 'signup' ? '/api/auth/simple-phone-signup' : '/api/auth/simple-phone-signin'
        const payload = mode === 'signup' ? {
          phoneNumber: phoneDigits,
          firstName: formData.firstName,
          lastName: formData.lastName,
          otp: formData.otp
        } : {
          phoneNumber: phoneDigits,
          otp: formData.otp
        }

        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })

        const data = await response.json()

        if (!response.ok || !data.success) {
          setError(data.message || data.error || 'Invalid verification code')
          return
        }

        if (data.verified) {
          handleAuthSuccess()
        }
      }

    } catch (error) {
      console.error('Auth error:', error)
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleAuthSuccess = () => {
    toast({
      title: mode === 'signup' ? "Account Created!" : "Signed In!",
      description: mode === 'signup' ? "Welcome to BittieTasks!" : "Welcome back!",
    })
    
    // Redirect after successful authentication
    setTimeout(() => {
      // Check for redirect parameter from URL
      const urlParams = new URLSearchParams(window.location.search)
      const redirectTo = urlParams.get('redirectTo') || '/dashboard'
      
      // Ensure we redirect locally, not to external URLs
      if (redirectTo.startsWith('/')) {
        window.location.href = redirectTo
      } else {
        window.location.href = '/dashboard'
      }
    }, 1000)
    
    onSuccess?.()
  }

  const handleBackToPhone = () => {
    setStep('phone')
    setFormData(prev => ({ ...prev, otp: '' }))
    setError('')
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-primary/10 rounded-full">
          {step === 'phone' ? <Phone className="w-6 h-6 text-primary" /> : <MessageSquare className="w-6 h-6 text-primary" />}
        </div>
        <CardTitle className="text-2xl font-bold">
          {step === 'phone' ? (mode === 'signup' ? 'Create Account' : 'Sign In') : 'Verify Your Phone'}
        </CardTitle>
        <CardDescription>
          {step === 'phone' 
            ? (mode === 'signup' ? 'Join BittieTasks with your phone number' : 'Sign in to your BittieTasks account')
            : `Enter the 6-digit code sent to ${formData.phoneNumber}`
          }
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {step === 'phone' ? (
            <>
              {mode === 'signup' && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                      placeholder="John"
                      required
                      data-testid="input-first-name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                      placeholder="Doe"
                      required
                      data-testid="input-last-name"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={handlePhoneChange}
                  placeholder="(555) 123-4567"
                  required
                  data-testid="input-phone-number"
                />
              </div>
            </>
          ) : (
            <>
              <div className="space-y-2">
                <Label htmlFor="otp">Verification Code</Label>
                <Input
                  id="otp"
                  type="text"
                  value={formData.otp}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 6)
                    setFormData(prev => ({ ...prev, otp: value }))
                  }}
                  placeholder="123456"
                  maxLength={6}
                  className="text-center text-lg tracking-widest"
                  required
                  data-testid="input-otp"
                />
              </div>
              
              <div className="text-center">
                <button
                  type="button"
                  onClick={handleBackToPhone}
                  className="text-sm text-primary hover:text-primary/80 underline"
                  data-testid="button-back-to-phone"
                >
                  ← Change phone number
                </button>
              </div>
            </>
          )}

          {error && (
            <div className="flex items-center gap-2 p-3 text-sm text-red-600 bg-red-50 rounded-md">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          <Button 
            type="submit" 
            className="w-full" 
            disabled={loading}
            data-testid={step === 'phone' ? `button-${mode}` : 'button-verify-otp'}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {step === 'phone' 
                  ? (mode === 'signup' ? 'Sending Code...' : 'Sending Code...') 
                  : 'Verifying...'
                }
              </>
            ) : (
              <>
                {step === 'phone' 
                  ? (mode === 'signup' ? 'Send Verification Code' : 'Send Verification Code') 
                  : 'Verify Code'
                }
              </>
            )}
          </Button>

          {step === 'phone' && (
            <div className="text-center">
              <button
                type="button"
                onClick={() => {
                  setMode(mode === 'signup' ? 'signin' : 'signup')
                  setError('')
                }}
                className="text-sm text-primary hover:text-primary/80 underline"
                data-testid="link-switch-mode"
              >
                {mode === 'signup' ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
              </button>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  )
}