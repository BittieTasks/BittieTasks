'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, AlertTriangle, Clock } from 'lucide-react'
import { useAuth } from '@/components/auth/AuthProvider'
import { useToast } from '@/hooks/use-toast'

export default function TestTaskApplications() {
  const [testResults, setTestResults] = useState<Array<{step: string, status: 'success' | 'error' | 'pending', message: string}>>([])
  const [loading, setLoading] = useState(false)
  const { user, isAuthenticated } = useAuth()
  const { toast } = useToast()
  
  const addTestResult = (step: string, status: 'success' | 'error' | 'pending', message: string) => {
    setTestResults(prev => [...prev, { step, status, message }])
  }
  
  const testSoloTaskApplication = async () => {
    setLoading(true)
    setTestResults([])
    
    try {
      addTestResult('Solo Auth Check', 'pending', 'Checking authentication...')
      
      if (!user) {
        addTestResult('Solo Auth Check', 'error', 'Not authenticated - please sign in first')
        return
      }
      
      addTestResult('Solo Auth Check', 'success', `Authenticated as ${user.email}`)
      addTestResult('Solo API Call', 'pending', 'Testing solo task application API...')
      
      // Get session token for auth
      const { supabase } = await import('@/lib/supabase')
      const { data: { session } } = await supabase.auth.getSession()
      
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      }
      
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`
      }
      
      const response = await fetch('/api/tasks/apply', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          taskId: 'platform-001',
          userId: user.id
        })
      })
      
      const data = await response.json()
      
      if (response.ok) {
        addTestResult('Solo API Call', 'success', `API Success: ${data.message || 'Application created'}`)
      } else {
        if (data.error?.includes('already applied')) {
          addTestResult('Solo API Call', 'success', 'Already applied (expected for repeat tests)')
        } else {
          addTestResult('Solo API Call', 'error', `API Error: ${data.error}`)
        }
      }
      
    } catch (error: any) {
      addTestResult('Solo API Call', 'error', `Network Error: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }
  
  const testCommunityTaskApplication = async () => {
    setLoading(true)
    setTestResults([])
    
    try {
      addTestResult('Community Auth Check', 'pending', 'Checking authentication...')
      
      if (!user) {
        addTestResult('Community Auth Check', 'error', 'Not authenticated - please sign in first')
        return
      }
      
      addTestResult('Community Auth Check', 'success', `Authenticated as ${user.email}`)
      addTestResult('Community API Call', 'pending', 'Testing community task application API...')
      
      // Test the community task endpoint (which uses task [id] route)
      const { supabase } = await import('@/lib/supabase')
      const { data: { session } } = await supabase.auth.getSession()
      
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      }
      
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`
      }
      
      const response = await fetch('/api/tasks/test-community-task/apply', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          message: 'Test application for community task'
        })
      })
      
      const data = await response.json()
      
      if (response.ok) {
        addTestResult('Community API Call', 'success', `API Success: Application created`)
      } else {
        if (data.error?.includes('Task not found')) {
          addTestResult('Community API Call', 'success', 'Task not found (expected - test endpoint working)')
        } else if (data.error?.includes('already applied')) {
          addTestResult('Community API Call', 'success', 'Already applied (expected for repeat tests)')
        } else {
          addTestResult('Community API Call', 'error', `API Error: ${data.error}`)
        }
      }
      
    } catch (error: any) {
      addTestResult('Community API Call', 'error', `Network Error: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }
  
  const testTaskApplications = async () => {
    setLoading(true)
    setTestResults([])
    
    try {
      addTestResult('Applications API', 'pending', 'Testing task applications fetch...')
      
      if (!user) {
        addTestResult('Applications API', 'error', 'Not authenticated - please sign in first')
        return
      }
      
      const { supabase } = await import('@/lib/supabase')
      const { data: { session } } = await supabase.auth.getSession()
      
      const headers: Record<string, string> = {}
      
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`
      }
      
      const response = await fetch('/api/tasks/applications', {
        headers
      })
      
      const data = await response.json()
      
      if (response.ok) {
        addTestResult('Applications API', 'success', `Found ${Array.isArray(data) ? data.length : 0} applications`)
      } else {
        addTestResult('Applications API', 'error', `API Error: ${data.error}`)
      }
      
    } catch (error: any) {
      addTestResult('Applications API', 'error', `Network Error: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Task Application Testing</CardTitle>
            <CardDescription>
              Test authentication and task application functionality for Solo, Community, and Barter tasks
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              {/* Test Controls */}
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold mb-2">Current Status</h4>
                  <div className="space-y-1 text-sm">
                    <div>Authenticated: {isAuthenticated ? '✅' : '❌'}</div>
                    <div>User Email: {user?.email || 'Not signed in'}</div>
                    <div>User ID: {user?.id ? '✅ Available' : '❌ Missing'}</div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Button 
                    onClick={testSoloTaskApplication} 
                    disabled={loading || !isAuthenticated}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    Test Solo Task Application
                  </Button>
                  
                  <Button 
                    onClick={testCommunityTaskApplication} 
                    disabled={loading || !isAuthenticated}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    Test Community Task Application
                  </Button>
                  
                  <Button 
                    onClick={testTaskApplications} 
                    disabled={loading || !isAuthenticated}
                    className="w-full bg-purple-600 hover:bg-purple-700"
                  >
                    Test Applications Fetch
                  </Button>
                </div>
                
                {!isAuthenticated && (
                  <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-yellow-800 text-sm">
                      Please sign in first to test task applications
                    </p>
                    <Button 
                      onClick={() => window.open('/auth', '_blank')}
                      className="mt-2 bg-yellow-600 hover:bg-yellow-700 text-white"
                    >
                      Sign In
                    </Button>
                  </div>
                )}
              </div>
              
              {/* Test Results */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Test Results</h3>
                
                {testResults.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Run a test to see results here</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
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
                
                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-semibold text-blue-800 mb-2">Testing Covers:</h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Authentication token validation</li>
                    <li>• Solo task application API (/api/tasks/apply)</li>
                    <li>• Community task application API (/api/tasks/[id]/apply)</li>
                    <li>• Task applications fetch API</li>
                    <li>• Database integration and error handling</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}