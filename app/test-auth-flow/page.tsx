'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { CheckCircle, AlertTriangle, Mail } from 'lucide-react'
import { useAuth } from '@/components/auth/AuthProvider'
import { useToast } from '@/hooks/use-toast'

export default function TestAuthFlow() {
  const [email, setEmail] = useState('test@bittietasks.com')
  const [password, setPassword] = useState('TestPassword123!')
  const [firstName, setFirstName] = useState('Test')
  const [lastName, setLastName] = useState('User')
  const [loading, setLoading] = useState(false)
  const [testResults, setTestResults] = useState<Array<{step: string, status: 'success' | 'error' | 'pending', message: string}>>([])
  
  const { signUp, signIn, user, isAuthenticated, isVerified } = useAuth()
  const { toast } = useToast()
  
  const addTestResult = (step: string, status: 'success' | 'error' | 'pending', message: string) => {
    setTestResults(prev => [...prev, { step, status, message }])
  }
  
  const testSignUpFlow = async () => {
    setLoading(true)
    setTestResults([])
    
    try {
      addTestResult('Starting Signup', 'pending', 'Creating new user account...')
      
      await signUp(email, password, { firstName, lastName })
      
      addTestResult('Signup Complete', 'success', 'Account created! Check your email for verification link.')
      
    } catch (error: any) {
      if (error.message.includes('Account created successfully')) {
        addTestResult('Signup Success', 'success', error.message)
      } else {
        addTestResult('Signup Failed', 'error', error.message)
      }
    }
    
    setLoading(false)
  }
  
  const testSignInFlow = async () => {
    setLoading(true)
    setTestResults([])
    
    try {
      addTestResult('Starting Sign In', 'pending', 'Attempting to sign in...')
      
      await signIn(email, password)
      
      addTestResult('Sign In Complete', 'success', 'Successfully signed in!')
      
    } catch (error: any) {
      addTestResult('Sign In Failed', 'error', error.message)
    }
    
    setLoading(false)
  }
  
  const testVerificationEmail = async () => {
    setLoading(true)
    setTestResults([])
    
    try {
      addTestResult('Sending Verification', 'pending', 'Sending test verification email...')
      
      const response = await fetch('/api/auth/send-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId: 'test-user-123',
          email: email 
        })
      })
      
      const data = await response.json()
      
      if (response.ok) {
        addTestResult('Email Sent', 'success', 'Verification email sent successfully!')
      } else {
        addTestResult('Email Failed', 'error', data.error || 'Failed to send email')
      }
      
    } catch (error: any) {
      addTestResult('Email Error', 'error', error.message)
    }
    
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-emerald-100 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Email Verification Flow Test</CardTitle>
            <CardDescription>
              Test the complete email signup, verification, and sign-in flow
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              {/* Test Controls */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Test Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter test email"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password">Test Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter test password"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="First name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Last name"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Button 
                    onClick={testSignUpFlow} 
                    disabled={loading}
                    className="w-full bg-teal-600 hover:bg-teal-700"
                  >
                    Test Sign Up Flow
                  </Button>
                  
                  <Button 
                    onClick={testSignInFlow} 
                    disabled={loading}
                    variant="outline"
                    className="w-full"
                  >
                    Test Sign In Flow
                  </Button>
                  
                  <Button 
                    onClick={testVerificationEmail} 
                    disabled={loading}
                    variant="outline"
                    className="w-full"
                  >
                    Test Verification Email
                  </Button>
                </div>
                
                {/* Current Auth Status */}
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold mb-2">Current Auth Status</h4>
                  <div className="space-y-1 text-sm">
                    <div>Authenticated: {isAuthenticated ? '✅' : '❌'}</div>
                    <div>Email Verified: {isVerified ? '✅' : '❌'}</div>
                    <div>User Email: {user?.email || 'Not signed in'}</div>
                  </div>
                </div>
              </div>
              
              {/* Test Results */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Test Results</h3>
                
                {testResults.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Mail className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Run a test to see results here</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {testResults.map((result, index) => (
                      <div
                        key={index}
                        className={`p-3 rounded-lg border ${
                          result.status === 'success' 
                            ? 'bg-green-50 border-green-200' 
                            : result.status === 'error'
                            ? 'bg-red-50 border-red-200'
                            : 'bg-blue-50 border-blue-200'
                        }`}
                      >
                        <div className="flex items-center space-x-2">
                          {result.status === 'success' && <CheckCircle className="w-4 h-4 text-green-600" />}
                          {result.status === 'error' && <AlertTriangle className="w-4 h-4 text-red-600" />}
                          {result.status === 'pending' && (
                            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                          )}
                          <div>
                            <div className="font-medium text-sm">{result.step}</div>
                            <div className="text-sm text-gray-600">{result.message}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <h4 className="font-semibold text-yellow-800 mb-2">Manual Verification Test</h4>
                  <p className="text-sm text-yellow-700 mb-3">
                    To test email verification, check your email for the verification link and click it.
                  </p>
                  <Button 
                    onClick={() => window.open('/verify-email?token=test-token-123', '_blank')}
                    variant="outline"
                    size="sm"
                    className="text-yellow-800 border-yellow-300"
                  >
                    Preview Verification Page
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}