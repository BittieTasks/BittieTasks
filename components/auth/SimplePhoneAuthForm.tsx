'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Phone, CheckCircle, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface SimplePhoneAuthFormProps {
  onSuccess?: () => void
}

export function SimplePhoneAuthForm({ onSuccess }: SimplePhoneAuthFormProps) {
  const [mode, setMode] = useState<'signup' | 'signin'>('signup')
  const [formData, setFormData] = useState({
    phoneNumber: '',
    firstName: '',
    lastName: ''
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
      // Basic validation
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

      if (!response.ok) {
        if (response.status === 400 && data.error?.includes('already exists')) {
          // User exists, switch to signin mode
          setMode('signin')
          setError('Account exists! Please sign in instead.')
          return
        } else if (response.status === 404 && data.error?.includes('No account found')) {
          // User doesn't exist, switch to signup mode
          setMode('signup')
          setError('No account found! Please sign up first.')
          return
        }
        setError(data.error || `${mode === 'signup' ? 'Sign up' : 'Sign in'} failed`)
        return
      }

      if (data.success) {
        toast({
          title: mode === 'signup' ? "Account Created!" : "Signed In!",
          description: mode === 'signup' ? "Welcome to BittieTasks!" : "Welcome back!",
        })
        
        // Redirect to dashboard after successful authentication
        setTimeout(() => {
          window.location.href = '/dashboard'
        }, 1000)
        
        onSuccess?.()
      }

    } catch (error) {
      console.error('Auth error:', error)
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-primary/10 rounded-full">
          <Phone className="w-6 h-6 text-primary" />
        </div>
        <CardTitle className="text-2xl font-bold">
          {mode === 'signup' ? 'Create Account' : 'Sign In'}
        </CardTitle>
        <CardDescription>
          {mode === 'signup' ? 'Join BittieTasks with your phone number' : 'Sign in to your BittieTasks account'}
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <>
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
            </>
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
            data-testid={`button-${mode}`}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {mode === 'signup' ? 'Creating Account...' : 'Signing In...'}
              </>
            ) : (
              <>{mode === 'signup' ? 'Create Account' : 'Sign In'}</>
            )}
          </Button>

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
        </form>
      </CardContent>
    </Card>
  )
}