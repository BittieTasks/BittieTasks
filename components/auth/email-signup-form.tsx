'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Mail, Shield, User } from "lucide-react"
import { useRouter } from 'next/navigation'
import { useAuth } from './SimpleAuthProvider'

interface EmailSignupFormProps {
  onSuccess?: () => void
}

type Step = 'email' | 'verify' | 'profile'

export function EmailSignupForm({ onSuccess }: EmailSignupFormProps) {
  const [step, setStep] = useState<Step>('email')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const router = useRouter()
  const { signUp } = useAuth()

  const handleEmailSignup = async () => {
    setIsLoading(true)
    setError('')
    
    try {
      if (password !== confirmPassword) {
        throw new Error('Passwords do not match')
      }
      
      if (password.length < 6) {
        throw new Error('Password must be at least 6 characters')
      }

      // Make direct API call to ensure it works
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          firstName,
          lastName
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Signup failed')
      }

      if (result.success) {
        setSuccess('Account created successfully! You must verify your email before you can sign in or use the platform.')
        setStep('verify')
      }
    } catch (err: any) {
      console.error('Email signup error:', err)
      setError(err.message || 'Failed to create account')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (step === 'email') {
      handleEmailSignup()
    }
  }

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  const isPasswordValid = password.length >= 6 && password === confirmPassword
  const isProfileValid = firstName.trim() && lastName.trim()

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2">
          {step === 'email' && <Mail className="w-5 h-5" />}
          {step === 'verify' && <Shield className="w-5 h-5" />}
          {step === 'profile' && <User className="w-5 h-5" />}
          Join BittieTasks
        </CardTitle>
        <CardDescription>
          {step === 'email' && 'Create your account to start earning'}
          {step === 'verify' && 'Check your email for verification link'}
        </CardDescription>
      </CardHeader>
      
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {/* Email Signup Step */}
          {step === 'email' && (
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
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  data-testid="input-email"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  data-testid="input-password"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  data-testid="input-confirm-password"
                  required
                />
              </div>
            </div>
          )}

          {/* Email Verification Step */}
          {step === 'verify' && (
            <div className="space-y-4 text-center">
              <div className="w-16 h-16 mx-auto bg-blue-100 rounded-full flex items-center justify-center">
                <Mail className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Check your email</h3>
                <p className="text-gray-600 mt-2">
                  We sent a verification link to <strong>{email}</strong>
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  Click the link in the email to verify your account. You must verify your email before you can sign in or use any platform features.
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep('email')}
                className="mt-4"
              >
                Use Different Email
              </Button>
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

        {step === 'email' && (
          <CardFooter>
            <Button
              type="submit"
              className="w-full"
              disabled={
                isLoading || 
                !isEmailValid ||
                !isPasswordValid ||
                !isProfileValid
              }
              data-testid="button-submit"
            >
              {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Create Account
            </Button>
          </CardFooter>
        )}
      </form>

      {/* Progress indicator */}
      {step !== 'verify' && (
        <div className="px-6 pb-4">
          <div className="flex justify-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${step === 'email' ? 'bg-primary' : 'bg-gray-300'}`} />
            <div className={`w-2 h-2 rounded-full ${step === 'profile' ? 'bg-primary' : 'bg-gray-300'}`} />
          </div>
        </div>
      )}
    </Card>
  )
}