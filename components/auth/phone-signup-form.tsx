'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Phone, Shield, User } from "lucide-react"
import { useRouter } from 'next/navigation'

interface PhoneSignupFormProps {
  onSuccess?: () => void
}

type Step = 'phone' | 'verify' | 'profile'

export function PhoneSignupForm({ onSuccess }: PhoneSignupFormProps) {
  const [step, setStep] = useState<Step>('phone')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [verificationCode, setVerificationCode] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const router = useRouter()

  const formatPhoneInput = (value: string) => {
    // Remove all non-digit characters
    const digits = value.replace(/\D/g, '')
    
    // Limit to 10 digits
    const limited = digits.slice(0, 10)
    
    // Format as (XXX) XXX-XXXX
    if (limited.length >= 6) {
      return `(${limited.slice(0, 3)}) ${limited.slice(3, 6)}-${limited.slice(6)}`
    } else if (limited.length >= 3) {
      return `(${limited.slice(0, 3)}) ${limited.slice(3)}`
    } else {
      return limited
    }
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneInput(e.target.value)
    setPhoneNumber(formatted)
  }

  const sendVerificationCode = async () => {
    setIsLoading(true)
    setError('')
    
    try {
      // Format phone number consistently with country code
      const formattedPhone = `+1${phoneNumber.replace(/\D/g, '')}`
      console.log('Sending verification request for phone:', formattedPhone)
      
      const response = await fetch('/api/auth/send-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumber: formattedPhone
        }),
      })

      console.log('Response status:', response.status)
      console.log('Response headers:', Object.fromEntries(response.headers.entries()))

      const data = await response.json()
      console.log('Response data:', data)

      if (!response.ok) {
        console.error('Response not OK:', response.status, data)
        throw new Error(data.error || `Server error: ${response.status}`)
      }

      setSuccess('Verification code sent! Check your text messages.')
      setStep('verify')
    } catch (err: any) {
      console.error('Send verification error:', err)
      setError(err.message || 'Network error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const verifyPhoneCode = async () => {
    setIsLoading(true)
    setError('')
    
    try {
      const formattedPhone = `+1${phoneNumber.replace(/\D/g, '')}`
      console.log('Verifying phone code for:', formattedPhone, 'with code:', verificationCode)
      
      const response = await fetch('/api/auth/verify-phone', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumber: formattedPhone,
          code: verificationCode
        }),
      })

      console.log('Verify response status:', response.status)
      const data = await response.json()
      console.log('Verify response data:', data)

      if (!response.ok) {
        console.error('Verify response not OK:', response.status, data)
        throw new Error(data.error || `Server error: ${response.status}`)
      }

      setSuccess('Phone verified! Now create your profile.')
      setStep('profile')
    } catch (err: any) {
      console.error('Verify phone error:', err)
      setError(err.message || 'Network error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const createAccount = async () => {
    setIsLoading(true)
    setError('')
    
    try {
      const formattedPhone = `+1${phoneNumber.replace(/\D/g, '')}`
      console.log('Creating account for:', formattedPhone, 'with data:', {
        phoneNumber: formattedPhone,
        firstName,
        lastName,
        email: email || undefined
      })
      
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumber: formattedPhone,
          password,
          firstName,
          lastName,
          email: email || undefined
        }),
      })

      console.log('Signup response status:', response.status)
      const data = await response.json()
      console.log('Signup response data:', data)

      if (!response.ok) {
        console.error('Signup response not OK:', response.status, data)
        throw new Error(data.error || `Server error: ${response.status}`)
      }

      setSuccess('Account created successfully! Welcome to BittieTasks!')
      
      // Redirect to dashboard or call onSuccess
      setTimeout(() => {
        if (onSuccess) {
          onSuccess()
        } else {
          router.push('/dashboard')
        }
      }, 2000)
      
    } catch (err: any) {
      console.error('Create account error:', err)
      setError(err.message || 'Network error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (step === 'phone') {
      sendVerificationCode()
    } else if (step === 'verify') {
      verifyPhoneCode()
    } else if (step === 'profile') {
      createAccount()
    }
  }

  const isPhoneValid = phoneNumber.replace(/\D/g, '').length === 10
  const isCodeValid = verificationCode.length === 6
  const isProfileValid = firstName.trim() && lastName.trim() && password.length >= 8

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2">
          {step === 'phone' && <Phone className="w-5 h-5" />}
          {step === 'verify' && <Shield className="w-5 h-5" />}
          {step === 'profile' && <User className="w-5 h-5" />}
          Join BittieTasks
        </CardTitle>
        <CardDescription>
          {step === 'phone' && 'Enter your phone number to get started'}
          {step === 'verify' && 'Enter the 6-digit code sent to your phone'}
          {step === 'profile' && 'Complete your profile to start earning'}
        </CardDescription>
      </CardHeader>
      
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {/* Phone Number Step */}
          {step === 'phone' && (
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="(555) 123-4567"
                value={phoneNumber}
                onChange={handlePhoneChange}
                data-testid="input-phone"
                required
              />
              <p className="text-sm text-gray-600">
                We'll send you a verification code via text message
              </p>
            </div>
          )}

          {/* Verification Code Step */}
          {step === 'verify' && (
            <div className="space-y-2">
              <Label htmlFor="code">Verification Code</Label>
              <Input
                id="code"
                type="text"
                placeholder="123456"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                data-testid="input-verification-code"
                maxLength={6}
                required
              />
              <p className="text-sm text-gray-600">
                Enter the 6-digit code sent to {phoneNumber}
              </p>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setStep('phone')}
                className="text-sm"
              >
                Wrong number? Go back
              </Button>
            </div>
          )}

          {/* Profile Creation Step */}
          {step === 'profile' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    data-testid="input-first-name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    data-testid="input-last-name"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="At least 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  data-testid="input-password"
                  minLength={8}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email (Optional)</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  data-testid="input-email"
                />
                <p className="text-xs text-gray-500">
                  Add email for notifications and receipts (you can skip this)
                </p>
              </div>
            </div>
          )}

          {error && (
            <Alert className="border-red-200 bg-red-50">
              <AlertDescription className="text-red-700">
                {error}
              </AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="border-green-200 bg-green-50">
              <AlertDescription className="text-green-700">
                {success}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>

        <CardFooter>
          <Button
            type="submit"
            className="w-full"
            disabled={
              isLoading || 
              (step === 'phone' && !isPhoneValid) ||
              (step === 'verify' && !isCodeValid) ||
              (step === 'profile' && !isProfileValid)
            }
            data-testid="button-submit"
          >
            {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {step === 'phone' && 'Send Verification Code'}
            {step === 'verify' && 'Verify Phone Number'}
            {step === 'profile' && 'Create Account'}
          </Button>
        </CardFooter>
      </form>

      {/* Progress indicator */}
      <div className="px-6 pb-4">
        <div className="flex justify-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${step === 'phone' ? 'bg-primary' : 'bg-gray-300'}`} />
          <div className={`w-2 h-2 rounded-full ${step === 'verify' ? 'bg-primary' : 'bg-gray-300'}`} />
          <div className={`w-2 h-2 rounded-full ${step === 'profile' ? 'bg-primary' : 'bg-gray-300'}`} />
        </div>
      </div>
    </Card>
  )
}