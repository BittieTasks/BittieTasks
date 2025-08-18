'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'

export default function DebugAuth() {
  const [authState, setAuthState] = useState<any>(null)
  const [testResult, setTestResult] = useState<string>('')

  useEffect(() => {
    const checkAuth = async () => {
      const { supabase } = await import('@/lib/supabase')
      const { data: { session }, error } = await supabase.auth.getSession()
      
      setAuthState({
        hasSession: !!session,
        hasToken: !!session?.access_token,
        tokenLength: session?.access_token?.length,
        userEmail: session?.user?.email,
        userId: session?.user?.id,
        error: error?.message
      })
    }
    
    checkAuth()
  }, [])

  const testSubscriptionAPI = async () => {
    try {
      const { apiRequest } = await import('@/lib/queryClient')
      const response = await apiRequest('POST', '/api/create-subscription', {
        planType: 'pro',
        price: 9.99
      })
      
      const result = await response.json()
      setTestResult(`SUCCESS: ${JSON.stringify(result, null, 2)}`)
    } catch (error: any) {
      setTestResult(`ERROR: ${error.message}`)
    }
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Authentication Debug</h1>
      
      <div className="bg-gray-100 p-4 rounded mb-4">
        <h2 className="font-semibold mb-2">Auth State:</h2>
        <pre className="text-sm">{JSON.stringify(authState, null, 2)}</pre>
      </div>
      
      <Button onClick={testSubscriptionAPI} className="mb-4">
        Test Subscription API
      </Button>
      
      {testResult && (
        <div className="bg-gray-100 p-4 rounded">
          <h2 className="font-semibold mb-2">Test Result:</h2>
          <pre className="text-sm whitespace-pre-wrap">{testResult}</pre>
        </div>
      )}
    </div>
  )
}