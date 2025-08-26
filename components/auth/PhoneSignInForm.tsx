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
  const [formData, setFormData] = useState({
    phoneNumber: '',
    password: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [needsVerification, setNeedsVerification] = useState(false)
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
    setNeedsVerification(false)

    try {
      // Basic validation
      if (!formData.phoneNumber || !formData.password) {
        setError('Phone number and password are required')
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
          phoneNumber: phoneDigits,
          password: formData.password
        })
      })

      const data = await response.json()

      if (!response.ok) {
        if (data.needsVerification) {
          setNeedsVerification(true)
          setError('Please verify your phone number first. Check your messages for the verification code.')
        } else {
          setError(data.error || 'Sign in failed')
        }
        return
      }

      if (data.success) {
        toast({
          title: "Welcome back!",
          description: "You've successfully signed in.",
        })
        
        // Refresh auth state
        await refreshAuth()
        onSuccess?.()
      }

    } catch (error) {
      console.error('Sign in error:', error)
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordlessSignIn = async () => {
    setLoading(true)
    setError('')

    try {
      const phoneDigits = formData.phoneNumber.replace(/\D/g, '')
      if (phoneDigits.length !== 10) {
        setError('Please enter a valid 10-digit phone number')
        return
      }

      // Request SMS verification code for passwordless login
      const response = await fetch('/api/auth/supabase-phone-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber: phoneDigits,
          verificationCode: 'request' // Special flag for passwordless
        })
      })

      const data = await response.json()

      if (data.needsOTPVerification) {
        toast({
          title: "Verification Code Sent",
          description: "Check your messages for the login code.",
        })
        // Could add verification step here
      } else if (data.error) {
        setError(data.error)
      }

    } catch (error) {
      console.error('Passwordless sign in error:', error)
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-1">
        <div className="flex items-center gap-2">
          <Phone className="h-6 w-6 text-blue-600" />
          <CardTitle className="text-2xl">Welcome Back</CardTitle>
        </div>
        <CardDescription>
          Sign in with your phone number and password
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSignIn} className="space-y-4">
          {error && (
            <div className="flex items-center gap-2 p-3 text-sm text-red-600 bg-red-50 rounded-md">
              <AlertCircle className="h-4 w-4" />
              {error}
              {needsVerification && (
                <Button 
                  type="button" 
                  variant="link" 
                  className="p-0 h-auto text-red-600 underline"
                  onClick={onSwitchToSignUp}
                  data-testid="link-verify-phone"
                >
                  Verify now
                </Button>
              )}
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

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
              data-testid="input-password"
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading} data-testid="button-sign-in">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing In...
              </>
            ) : (
              'Sign In'
            )}
          </Button>

          <div className="text-center">
            <Button 
              type="button" 
              variant="link"
              onClick={handlePasswordlessSignIn}
              disabled={loading || !formData.phoneNumber}
              data-testid="button-passwordless-signin"
            >
              Sign in with SMS code instead
            </Button>
          </div>

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