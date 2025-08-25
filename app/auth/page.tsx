'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/app/hooks/use-toast'
import { useAuth } from '../../components/auth/SimpleAuthProvider'
import { Loader2, Mail, Lock, User, Eye, EyeOff } from 'lucide-react'

export default function AuthPage() {
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
  })
  const [activeTab, setActiveTab] = useState('signin')
  const [resendEmail, setResendEmail] = useState('')
  const [resendLoading, setResendLoading] = useState(false)
  
  const { signIn, signUp, isAuthenticated, loading: authLoading } = useAuth()
  const { toast } = useToast()
  const router = useRouter()

  // Redirect authenticated users away from auth page
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      const urlParams = new URLSearchParams(window.location.search)
      const redirectTo = urlParams.get('redirectTo') || '/dashboard'
      console.log('AuthPage: Authenticated user detected, redirecting to:', redirectTo)
      router.replace(redirectTo)
    }
  }, [authLoading, isAuthenticated, router])

  // Show loading state while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    )
  }

  // Don't render auth form if user is already authenticated
  if (isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Redirecting to dashboard...</p>
        </div>
      </div>
    )
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleResendVerification = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!resendEmail) {
      toast({
        title: 'Email Required',
        description: 'Please enter your email address to resend verification.',
        variant: 'destructive',
      })
      return
    }
    
    setResendLoading(true)
    
    try {
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resendEmail }),
      })
      
      if (response.ok) {
        toast({
          title: 'Verification Email Sent',
          description: 'Please check your email for the verification link.',
        })
        setResendEmail('')
      } else {
        toast({
          title: 'Failed to Send Email',
          description: 'Please try again or contact support if the problem persists.',
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
      setResendLoading(false)
    }
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    console.log('handleSignIn called with:', formData.email)

    // Add timeout safety mechanism
    const timeoutId = setTimeout(() => {
      setLoading(false)
      toast({
        title: 'Sign In Timeout',
        description: 'Sign in is taking too long. Please try again.',
        variant: 'destructive',
      })
    }, 30000) // 30 second timeout

    try {
      await signIn(formData.email, formData.password)
      clearTimeout(timeoutId)
      toast({
        title: 'Success!',
        description: 'You have been signed in successfully.',
      })
      
      // Check for redirect parameter from URL
      const urlParams = new URLSearchParams(window.location.search)
      const redirectTo = urlParams.get('redirectTo') || '/dashboard'
      
      // Redirect to intended destination immediately - no timeout needed
      console.log('Redirecting authenticated user to:', redirectTo)
      router.replace(redirectTo)
    } catch (error: any) {
      clearTimeout(timeoutId)
      console.error('handleSignIn error:', error)
      toast({
        title: 'Sign In Failed',
        description: error.message || 'An error occurred during sign in.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const validatePassword = (password: string) => {
    const requirements = {
      length: password.length >= 8,
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(password),
    }
    
    const isValid = Object.values(requirements).every(req => req)
    return { isValid, requirements }
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // Validate password requirements
    const { isValid, requirements } = validatePassword(formData.password)
    
    if (!isValid) {
      const missing = []
      if (!requirements.length) missing.push('at least 8 characters')
      if (!requirements.lowercase) missing.push('lowercase letters (a-z)')
      if (!requirements.uppercase) missing.push('uppercase letters (A-Z)')
      if (!requirements.number) missing.push('numbers (0-9)')
      if (!requirements.special) missing.push('special characters (!@#$%^&*)')
      
      toast({
        title: 'Password Requirements Not Met',
        description: `Password must contain: ${missing.join(', ')}`,
        variant: 'destructive',
      })
      setLoading(false)
      return
    }

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: 'Password Mismatch',
        description: 'Passwords do not match.',
        variant: 'destructive',
      })
      setLoading(false)
      return
    }

    try {
      const result = await signUp(formData.email, formData.password, {
        firstName: formData.firstName,
        lastName: formData.lastName,
      }) as any
      
      if (result?.user) {
        // Send custom verification email
        try {
          const verificationResponse = await fetch('/api/auth/send-verification', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              userId: result.user.id, 
              email: formData.email 
            }),
          })
          
          if (verificationResponse.ok) {
            toast({
              title: 'Account Created!',
              description: 'Please check your email for a verification link to complete your registration.',
            })
          } else {
            toast({
              title: 'Account Created',
              description: 'Account created but verification email failed. You can request a new one below.',
              variant: 'destructive',
            })
          }
        } catch (emailError) {
          console.error('Verification email error:', emailError)
          toast({
            title: 'Account Created',
            description: 'Account created but verification email failed. You can request a new one below.',
            variant: 'destructive',
          })
        }
      }
      
      setActiveTab('signin')
      setFormData(prev => ({ ...prev, password: '', confirmPassword: '' }))
    } catch (error: any) {
      toast({
        title: 'Sign Up Failed',
        description: error.message || 'An error occurred during sign up.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-teal-600 rounded-xl flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold text-2xl">B</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome to BittieTasks</h1>
            <p className="text-lg text-gray-600">
              Start earning from neighborhood tasks today
            </p>
          </div>

          {/* Auth Form */}
          <Card className="bg-white shadow-lg border border-gray-200">
            <CardContent className="p-6">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="signin">Sign In</TabsTrigger>
                  <TabsTrigger value="signup">Sign Up</TabsTrigger>
                </TabsList>

                <TabsContent value="signin">
                  <form onSubmit={handleSignIn} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          placeholder="Enter your email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className="pl-10 input-clean"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="password"
                          name="password"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Enter your password"
                          value={formData.password}
                          onChange={handleInputChange}
                          className="pl-10 pr-10 input-clean"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    <Button type="submit" className="w-full button-clean" disabled={loading}>
                      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Welcome Back
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="signup">
                  <form onSubmit={handleSignUp} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name</Label>
                        <div className="relative">
                          <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="firstName"
                            name="firstName"
                            type="text"
                            placeholder="First name"
                            value={formData.firstName}
                            onChange={handleInputChange}
                            className="pl-10 input-clean"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        <div className="relative">
                          <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="lastName"
                            name="lastName"
                            type="text"
                            placeholder="Last name"
                            value={formData.lastName}
                            onChange={handleInputChange}
                            className="pl-10 input-clean"
                            required
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          placeholder="Enter your email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className="pl-10 input-clean"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="password"
                          name="password"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Create password"
                          value={formData.password}
                          onChange={handleInputChange}
                          className="pl-10 pr-10 input-clean"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      <p className="text-xs text-gray-500">
                        Must be at least 8 characters with uppercase, lowercase, number, and special character
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="confirmPassword"
                          name="confirmPassword"
                          type={showConfirmPassword ? 'text' : 'password'}
                          placeholder="Confirm password"
                          value={formData.confirmPassword}
                          onChange={handleInputChange}
                          className="pl-10 pr-10 input-clean"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                        >
                          {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    <Button type="submit" className="w-full button-clean" disabled={loading}>
                      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Join Community
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Resend Verification */}
          <Card className="bg-white shadow-lg border border-gray-200 mt-6">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Need to Resend Verification Email?</CardTitle>
              <CardDescription>
                If you didn't receive your verification email, enter your email below to request a new one.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleResendVerification} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="resendEmail">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="resendEmail"
                      type="email"
                      placeholder="Enter your email"
                      value={resendEmail}
                      onChange={(e) => setResendEmail(e.target.value)}
                      className="pl-10 input-clean"
                      required
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full" variant="outline" disabled={resendLoading}>
                  {resendLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Resend Verification Email
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Footer */}
          <div className="text-center mt-8">
            <p className="text-small text-muted-foreground">
              By continuing, you agree to our Terms of Service and Privacy Policy
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}