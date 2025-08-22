'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Mail } from "lucide-react"
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [error, setError] = useState('')
  const [needsVerification, setNeedsVerification] = useState(false)
  const [resendMessage, setResendMessage] = useState('')
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        // Special handling for email verification needed
        if (result.needsVerification) {
          setError(result.error)
          setNeedsVerification(true)
        } else {
          setError(result.error || 'Login failed')
        }
        return
      }

      // Store session data from API response
      if (result.session) {
        // Store session tokens in localStorage for client persistence
        localStorage.setItem('sb-access-token', result.session.access_token)
        localStorage.setItem('sb-refresh-token', result.session.refresh_token)
        localStorage.setItem('sb-session', JSON.stringify(result.session))
      }
      
      console.log('Login successful, user:', result.user?.email)
      
      // Force full page reload to trigger middleware session detection
      window.location.replace('/dashboard')
      
    } catch (err: any) {
      console.error('Login error:', err)
      setError(err.message || 'Failed to log in')
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendVerification = async () => {
    if (!email) {
      setError('Please enter your email address first')
      return
    }

    setIsResending(true)
    setResendMessage('')
    
    try {
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to resend verification email')
      }

      setResendMessage('Verification email sent! Check your inbox and spam folder.')
      setError('')
      
    } catch (err: any) {
      console.error('Resend verification error:', err)
      setError(err.message || 'Failed to resend verification email')
    } finally {
      setIsResending(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 to-blue-50 p-4">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <Mail className="w-5 h-5" />
            Welcome Back
          </CardTitle>
          <CardDescription>
            Sign in to your BittieTasks account
          </CardDescription>
        </CardHeader>
        
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            {resendMessage && (
              <Alert>
                <AlertDescription className="text-green-700">{resendMessage}</AlertDescription>
              </Alert>
            )}
            
            {needsVerification && (
              <Alert>
                <AlertDescription className="space-y-2">
                  <p>Email verification required. Check your inbox (including spam folder).</p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleResendVerification}
                    disabled={isResending}
                    className="w-full"
                  >
                    {isResending ? (
                      <>
                        <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      'Resend Verification Email'
                    )}
                  </Button>
                </AlertDescription>
              </Alert>
            )}
            
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
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                data-testid="input-password"
                required
              />
            </div>
          </CardContent>
          
          <CardFooter className="flex flex-col space-y-4">
            <Button 
              type="submit" 
              className="w-full bg-teal-600 hover:bg-teal-700"
              disabled={isLoading}
              data-testid="button-login"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Signing In...
                </>
              ) : (
                'Sign In'
              )}
            </Button>
            
            <div className="text-center text-sm text-gray-600 space-y-2">
              <div>
                Don't have an account?{' '}
                <Link href="/auth/email-signup" className="text-teal-600 hover:text-teal-700 font-medium">
                  Sign up here
                </Link>
              </div>
              <div className="text-xs text-gray-500">
                ⚠️ You must verify your email before signing in. Check your inbox (including spam folder).
              </div>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}