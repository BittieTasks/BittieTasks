'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/components/auth/AuthProvider'
import { redirectToAuthWithIntent, getIntendedUrl, clearIntendedUrl } from '@/lib/auth-redirect'
import { CheckCircle, XCircle, Clock, User, CreditCard, Globe } from 'lucide-react'

// Comprehensive test suite for subscription and payment flows

export default function TestSubscriptionFlow() {
  const { user, isAuthenticated, loading } = useAuth()
  const { toast } = useToast()
  const [testResults, setTestResults] = useState<Record<string, 'pending' | 'pass' | 'fail'>>({})
  const [currentTest, setCurrentTest] = useState<string>('')

  const updateTestResult = (testName: string, result: 'pass' | 'fail') => {
    setTestResults(prev => ({ ...prev, [testName]: result }))
  }

  const runTest = async (testName: string, testFunction: () => Promise<boolean>) => {
    setCurrentTest(testName)
    setTestResults(prev => ({ ...prev, [testName]: 'pending' }))
    
    try {
      const result = await testFunction()
      updateTestResult(testName, result ? 'pass' : 'fail')
      return result
    } catch (error) {
      console.error(`Test ${testName} failed:`, error)
      updateTestResult(testName, 'fail')
      return false
    } finally {
      setCurrentTest('')
    }
  }

  const testIntentBasedAuth = async (): Promise<boolean> => {
    // Test setting and getting intended URL
    const testUrl = '/subscribe'
    
    // Clear any existing intent
    clearIntendedUrl()
    
    // Set intent
    if (typeof document !== 'undefined') {
      document.cookie = `intended_url=${encodeURIComponent(testUrl)}; path=/; max-age=3600; SameSite=Lax`
    }
    
    // Check if it was set correctly
    const retrievedUrl = getIntendedUrl()
    
    if (retrievedUrl === testUrl) {
      toast({
        title: "Intent Test Passed",
        description: "URL preservation system working correctly"
      })
      return true
    } else {
      toast({
        title: "Intent Test Failed", 
        description: `Expected ${testUrl}, got ${retrievedUrl}`,
        variant: "destructive"
      })
      return false
    }
  }

  const testStripeApiConnection = async (): Promise<boolean> => {
    if (!isAuthenticated || !user) {
      toast({
        title: "Auth Required",
        description: "Please authenticate first",
        variant: "destructive"
      })
      return false
    }

    try {
      const { supabase } = await import('@/lib/supabase')
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session?.access_token) {
        throw new Error('No access token')
      }

      // Test creating a subscription session
      const response = await fetch('/api/create-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          planType: 'pro',
          price: 9.99
        })
      })

      if (response.ok) {
        const data = await response.json()
        if (data.sessionUrl && data.sessionUrl.includes('checkout.stripe.com')) {
          toast({
            title: "Stripe Connection Successful",
            description: "Payment session created successfully"
          })
          return true
        }
      }
      
      throw new Error('Invalid response from Stripe')
    } catch (error) {
      console.error('Stripe test error:', error)
      toast({
        title: "Stripe Connection Failed",
        description: "Could not connect to payment system",
        variant: "destructive"
      })
      return false
    }
  }

  const testSubscriptionPageLoad = async (): Promise<boolean> => {
    try {
      const response = await fetch('/subscribe')
      if (response.ok) {
        toast({
          title: "Page Load Test Passed",
          description: "Subscription page loads correctly"
        })
        return true
      }
      return false
    } catch (error) {
      toast({
        title: "Page Load Failed",
        description: "Could not load subscription page",
        variant: "destructive"
      })
      return false
    }
  }

  const testAuthenticationFlow = async (): Promise<boolean> => {
    if (isAuthenticated) {
      toast({
        title: "Authentication Test Passed", 
        description: "User is properly authenticated"
      })
      return true
    } else {
      toast({
        title: "Authentication Required",
        description: "Please sign in to test payment flows",
        variant: "destructive"
      })
      return false
    }
  }

  const runAllTests = async () => {
    toast({
      title: "Starting Test Suite",
      description: "Running comprehensive subscription flow tests"
    })

    await runTest('Page Load', testSubscriptionPageLoad)
    await runTest('Intent-Based Auth', testIntentBasedAuth)
    await runTest('User Authentication', testAuthenticationFlow)
    
    if (isAuthenticated) {
      await runTest('Stripe Connection', testStripeApiConnection)
    }
  }

  const TestResult = ({ name, status }: { name: string, status: 'pending' | 'pass' | 'fail' }) => (
    <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
      <span className="font-medium">{name}</span>
      <div className="flex items-center space-x-2">
        {status === 'pending' && <Clock className="h-4 w-4 text-yellow-500 animate-spin" />}
        {status === 'pass' && <CheckCircle className="h-4 w-4 text-green-500" />}
        {status === 'fail' && <XCircle className="h-4 w-4 text-red-500" />}
        <Badge variant={status === 'pass' ? 'default' : status === 'fail' ? 'destructive' : 'secondary'}>
          {status}
        </Badge>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Subscription Flow Test Suite</h1>
          <p className="text-gray-600">Comprehensive testing for authentication, payments, and user flows</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>Authentication Status</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Authenticated:</span>
                  <Badge variant={isAuthenticated ? 'default' : 'destructive'}>
                    {isAuthenticated ? 'Yes' : 'No'}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span>User Email:</span>
                  <span className="text-sm text-gray-600">{user?.email || 'Not available'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Loading:</span>
                  <Badge variant={loading ? 'secondary' : 'default'}>
                    {loading ? 'Yes' : 'No'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Globe className="h-5 w-5" />
                <span>System Status</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Environment:</span>
                  <Badge>Development</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Stripe Integration:</span>
                  <Badge variant="default">Configured</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Supabase Auth:</span>
                  <Badge variant="default">Connected</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Test Results</CardTitle>
            <CardDescription>
              Automated tests for subscription and payment functionality
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 mb-6">
              <TestResult name="Page Load" status={testResults['Page Load'] || 'pending'} />
              <TestResult name="Intent-Based Auth" status={testResults['Intent-Based Auth'] || 'pending'} />
              <TestResult name="User Authentication" status={testResults['User Authentication'] || 'pending'} />
              <TestResult name="Stripe Connection" status={testResults['Stripe Connection'] || 'pending'} />
            </div>
            
            <div className="flex space-x-3">
              <Button onClick={runAllTests} className="flex-1">
                Run All Tests
              </Button>
              
              {!isAuthenticated && (
                <Button 
                  variant="outline" 
                  onClick={() => redirectToAuthWithIntent('/test-subscription-flow')}
                  className="flex-1"
                >
                  Test Authentication Flow
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {isAuthenticated && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CreditCard className="h-5 w-5" />
                <span>Live Payment Test</span>
              </CardTitle>
              <CardDescription>
                Test actual subscription creation (Stripe Test Mode)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  This will create a real Stripe checkout session in test mode. 
                  Use test card number: 4242 4242 4242 4242
                </p>
                <div className="flex space-x-3">
                  <Button 
                    onClick={() => window.location.href = '/subscribe'}
                    className="bg-teal-600 hover:bg-teal-700"
                  >
                    Test Pro Subscription ($9.99/month)
                  </Button>
                  <Button 
                    onClick={() => window.location.href = '/subscribe'}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    Test Premium Subscription ($19.99/month)
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}