'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function TestAuthPage() {
  const [sessionInfo, setSessionInfo] = useState<any>(null)
  const [apiTest, setApiTest] = useState<string>('Not tested')
  const [loading, setLoading] = useState(false)

  const checkSession = async () => {
    setLoading(true)
    try {
      const { data: { session }, error } = await supabase.auth.getSession()
      
      setSessionInfo({
        hasSession: !!session,
        hasUser: !!session?.user,
        userEmail: session?.user?.email || 'No user',
        hasAccessToken: !!session?.access_token,
        tokenLength: session?.access_token?.length || 0,
        tokenStart: session?.access_token?.substring(0, 20) || 'No token',
        error: error?.message || 'No error'
      })
    } catch (err: any) {
      setSessionInfo({ error: err.message })
    }
    setLoading(false)
  }

  const testDashboardApi = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session?.access_token) {
        setApiTest('❌ No access token found')
        return
      }

      const response = await fetch('/api/dashboard', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      })

      if (response.ok) {
        setApiTest('✅ Dashboard API works!')
      } else {
        const error = await response.text()
        setApiTest(`❌ API failed: ${response.status} - ${error}`)
      }
    } catch (err: any) {
      setApiTest(`❌ Request failed: ${err.message}`)
    }
  }

  useEffect(() => {
    checkSession()
  }, [])

  return (
    <div className="container mx-auto p-8 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Authentication Debug Panel</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Button onClick={checkSession} disabled={loading}>
              {loading ? 'Checking...' : 'Check Session'}
            </Button>
            
            <Button onClick={testDashboardApi} className="ml-2">
              Test Dashboard API
            </Button>
          </div>

          {sessionInfo && (
            <div className="bg-gray-100 p-4 rounded-md">
              <h3 className="font-bold mb-2">Session Information:</h3>
              <pre className="text-sm whitespace-pre-wrap">
                {JSON.stringify(sessionInfo, null, 2)}
              </pre>
            </div>
          )}

          <div className="bg-blue-100 p-4 rounded-md">
            <h3 className="font-bold mb-2">API Test Result:</h3>
            <p>{apiTest}</p>
          </div>

          <div className="text-sm text-gray-600">
            <p><strong>How to use:</strong></p>
            <ol className="list-decimal list-inside space-y-1">
              <li>Make sure you're signed in</li>
              <li>Click "Check Session" to see session details</li>
              <li>Click "Test Dashboard API" to test authentication</li>
              <li>Look for token length (should be 800+ characters)</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}