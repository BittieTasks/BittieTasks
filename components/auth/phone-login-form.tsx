'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Phone } from "lucide-react"
import { useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'

interface PhoneLoginFormProps {
  onSuccess?: () => void
}

export function PhoneLoginForm({ onSuccess }: PhoneLoginFormProps) {
  const [phoneNumber, setPhoneNumber] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )

      const formattedPhone = `+1${phoneNumber.replace(/\D/g, '')}`

      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        phone: formattedPhone,
        password: password,
      })

      if (signInError) {
        throw new Error(signInError.message)
      }

      if (data.user) {
        console.log('Login successful:', data.user.id)
        
        if (onSuccess) {
          onSuccess()
        } else {
          router.push('/dashboard')
        }
      }
    } catch (err: any) {
      console.error('Login error:', err)
      setError(err.message || 'Login failed. Please check your phone number and password.')
    } finally {
      setIsLoading(false)
    }
  }

  const isFormValid = phoneNumber.replace(/\D/g, '').length === 10 && password.length >= 8

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2">
          <Phone className="w-5 h-5" />
          Welcome Back
        </CardTitle>
        <CardDescription>
          Sign in to your BittieTasks account
        </CardDescription>
      </CardHeader>
      
      <form onSubmit={handleLogin}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="(555) 123-4567"
              value={phoneNumber}
              onChange={handlePhoneChange}
              data-testid="input-phone-login"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              data-testid="input-password-login"
              required
            />
          </div>

          {error && (
            <Alert className="border-red-200 bg-red-50">
              <AlertDescription className="text-red-700">
                {error}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>

        <CardFooter className="flex flex-col space-y-4">
          <Button
            type="submit"
            className="w-full"
            disabled={isLoading || !isFormValid}
            data-testid="button-login"
          >
            {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Sign In
          </Button>

          <div className="text-center">
            <Button
              type="button"
              variant="link"
              size="sm"
              className="text-sm text-gray-600"
              onClick={() => {
                // Handle forgot password
                alert('Password reset will be implemented soon. Please contact support if needed.')
              }}
            >
              Forgot your password?
            </Button>
          </div>
        </CardFooter>
      </form>
    </Card>
  )
}