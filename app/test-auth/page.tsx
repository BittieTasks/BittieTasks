'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, XCircle, AlertCircle, Loader2 } from 'lucide-react'
import { SimpleSupabaseAuth } from '@/lib/simple-supabase-auth'
import { apiClient } from '@/lib/api-client'

interface TestResult {
  name: string
  status: 'pending' | 'success' | 'error' | 'warning'
  message: string
  details?: string
}

export default function AuthTestPage() {
  const [testResults, setTestResults] = useState<TestResult[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [overallStatus, setOverallStatus] = useState<'pending' | 'success' | 'error' | 'warning'>('pending')

  const updateTest = (name: string, status: TestResult['status'], message: string, details?: string) => {
    setTestResults(prev => {
      const newResults = prev.filter(r => r.name !== name)
      return [...newResults, { name, status, message, details }]
    })
  }

  const runAuthenticationTests = async () => {
    setIsRunning(true)
    setTestResults([])
    
    const tests: TestResult[] = [
      { name: 'Environment Variables', status: 'pending', message: 'Checking...' },
      { name: 'Supabase Connection', status: 'pending', message: 'Checking...' },
      { name: 'Session Management', status: 'pending', message: 'Checking...' },
      { name: 'API Authentication', status: 'pending', message: 'Checking...' },
      { name: 'Token Management', status: 'pending', message: 'Checking...' },
      { name: 'URL Configuration', status: 'pending', message: 'Checking...' }
    ]
    
    setTestResults(tests)

    // Test 1: Environment Variables
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      
      if (!supabaseUrl || !supabaseAnonKey) {
        updateTest('Environment Variables', 'error', 'Missing required environment variables', 
          `NEXT_PUBLIC_SUPABASE_URL: ${supabaseUrl ? '✓' : '✗'}\nNEXT_PUBLIC_SUPABASE_ANON_KEY: ${supabaseAnonKey ? '✓' : '✗'}`)
      } else if (!supabaseUrl.includes('supabase.co')) {
        updateTest('Environment Variables', 'warning', 'Supabase URL format looks incorrect', 
          `URL should be https://xxx.supabase.co, got: ${supabaseUrl}`)
      } else {
        updateTest('Environment Variables', 'success', 'All environment variables present', 
          `Supabase URL: ${supabaseUrl}\nAnon Key: ${supabaseAnonKey.substring(0, 20)}...`)
      }
    } catch (error) {
      updateTest('Environment Variables', 'error', 'Failed to check environment variables', String(error))
    }

    // Test 2: Supabase Connection
    try {
      const session = await SimpleSupabaseAuth.getSession()
      const user = await SimpleSupabaseAuth.getCurrentUser()
      
      updateTest('Supabase Connection', 'success', 'Supabase client initialized successfully', 
        `Current session: ${session ? 'Active' : 'None'}\nCurrent user: ${user ? user.email || 'Anonymous' : 'None'}`)
    } catch (error: any) {
      updateTest('Supabase Connection', 'error', 'Failed to connect to Supabase', error.message)
    }

    // Test 3: Session Management
    try {
      const isAuth = await SimpleSupabaseAuth.isAuthenticated()
      const token = await SimpleSupabaseAuth.getAccessToken()
      
      updateTest('Session Management', isAuth ? 'success' : 'warning', 
        isAuth ? 'User is authenticated' : 'No active session (expected if not signed in)',
        `Token present: ${token ? 'Yes' : 'No'}\nAuthenticated: ${isAuth ? 'Yes' : 'No'}`)
    } catch (error: any) {
      updateTest('Session Management', 'error', 'Session management error', error.message)
    }

    // Test 4: API Authentication
    try {
      const response = await apiClient.get('/api/auth/session')
      updateTest('API Authentication', 'success', 'API authentication endpoint working', 
        `Response: ${JSON.stringify(response, null, 2)}`)
    } catch (error: any) {
      if (error.message.includes('401') || error.message.includes('Unauthorized')) {
        updateTest('API Authentication', 'warning', 'API returns unauthorized (expected without login)', error.message)
      } else {
        updateTest('API Authentication', 'error', 'API authentication test failed', error.message)
      }
    }

    // Test 5: Token Management
    try {
      // Test token refresh capability
      const session = await SimpleSupabaseAuth.getSession()
      if (session && session.expires_at) {
        const expiryTime = new Date(session.expires_at * 1000)
        const now = new Date()
        const timeUntilExpiry = expiryTime.getTime() - now.getTime()
        
        updateTest('Token Management', 'success', 'Token expiry management configured', 
          `Token expires: ${expiryTime.toLocaleString()}\nTime until expiry: ${Math.round(timeUntilExpiry / 1000 / 60)} minutes`)
      } else {
        updateTest('Token Management', 'warning', 'No active token to test expiry', 'Sign in to test token management')
      }
    } catch (error: any) {
      updateTest('Token Management', 'error', 'Token management test failed', error.message)
    }

    // Test 6: URL Configuration
    try {
      const currentURL = window.location.origin
      const isLocalhost = currentURL.includes('localhost')
      const isProduction = currentURL.includes('bittietasks.com')
      
      updateTest('URL Configuration', 'success', 'URL configuration detected', 
        `Current URL: ${currentURL}\nEnvironment: ${isProduction ? 'Production' : isLocalhost ? 'Development' : 'Unknown'}\nRedirect URL should be configured in Supabase`)
    } catch (error: any) {
      updateTest('URL Configuration', 'error', 'URL configuration test failed', error.message)
    }

    // Determine overall status
    setTimeout(() => {
      setIsRunning(false)
      const hasErrors = testResults.some(r => r.status === 'error')
      const hasWarnings = testResults.some(r => r.status === 'warning')
      
      if (hasErrors) {
        setOverallStatus('error')
      } else if (hasWarnings) {
        setOverallStatus('warning')
      } else {
        setOverallStatus('success')
      }
    }, 1000)
  }

  const testSignUp = async () => {
    const testEmail = `test-${Date.now()}@example.com`
    const testPassword = 'TestPassword123!'
    
    try {
      updateTest('Sign Up Test', 'pending', 'Testing sign up...')
      const result = await SimpleSupabaseAuth.signUp(testEmail, testPassword)
      
      if (result.needsEmailConfirmation) {
        updateTest('Sign Up Test', 'success', 'Sign up successful - email confirmation required', 
          `Test email: ${testEmail}\nCheck your email settings in Supabase`)
      } else {
        updateTest('Sign Up Test', 'success', 'Sign up successful - no email confirmation needed', 
          `User created: ${result.user?.email}`)
      }
    } catch (error: any) {
      updateTest('Sign Up Test', 'error', 'Sign up failed', error.message)
    }
  }

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />
      default:
        return <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
    }
  }

  const getStatusBadge = (status: TestResult['status']) => {
    const variants = {
      success: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100',
      error: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100',
      warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100',
      pending: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100'
    }
    
    return (
      <Badge className={variants[status]}>
        {status.toUpperCase()}
      </Badge>
    )
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">BittieTasks Authentication Test</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Verify your Supabase and Vercel configuration is working correctly
        </p>
      </div>

      <div className="grid gap-6">
        {/* Overall Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {getStatusIcon(overallStatus)}
              Overall Status
            </CardTitle>
            <CardDescription>
              {overallStatus === 'success' && 'All tests passed! Your authentication is ready for production.'}
              {overallStatus === 'warning' && 'Tests completed with warnings. Check the details below.'}
              {overallStatus === 'error' && 'Some tests failed. Fix the errors below before deploying.'}
              {overallStatus === 'pending' && 'Run the tests to check your configuration.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Button 
                onClick={runAuthenticationTests}
                disabled={isRunning}
                className="flex items-center gap-2"
              >
                {isRunning && <Loader2 className="h-4 w-4 animate-spin" />}
                Run Authentication Tests
              </Button>
              <Button 
                onClick={testSignUp}
                variant="outline"
                className="flex items-center gap-2"
              >
                Test Sign Up Flow
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Test Results */}
        {testResults.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Test Results</CardTitle>
              <CardDescription>
                Detailed results of your authentication configuration
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {testResults.map((test, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(test.status)}
                        <h3 className="font-medium">{test.name}</h3>
                      </div>
                      {getStatusBadge(test.status)}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      {test.message}
                    </p>
                    {test.details && (
                      <pre className="text-xs bg-gray-100 dark:bg-gray-800 p-2 rounded overflow-x-auto">
                        {test.details}
                      </pre>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Setup Guide */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Setup Checklist</CardTitle>
            <CardDescription>
              Essential configuration for Supabase and Vercel
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-medium">Supabase Settings:</h4>
              <ul className="text-sm space-y-1 text-gray-600 dark:text-gray-400">
                <li>• Authentication → URL Configuration → Add your domain</li>
                <li>• Authentication → Settings → Enable email confirmations</li>
                <li>• Settings → API → Copy environment variables</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Vercel Settings:</h4>
              <ul className="text-sm space-y-1 text-gray-600 dark:text-gray-400">
                <li>• Environment Variables → Add all Supabase keys</li>
                <li>• Domains → Configure www.bittietasks.com</li>
                <li>• Deploy → Test authentication flow</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}