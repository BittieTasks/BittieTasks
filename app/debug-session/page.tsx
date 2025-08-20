'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'

export default function DebugSessionPage() {
  const [sessionData, setSessionData] = useState<any>({})
  const [storageData, setStorageData] = useState<any>({})

  const checkEverything = () => {
    // Check localStorage
    const storageKeys = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key?.includes('supabase') || key?.includes('auth')) {
        storageKeys.push({
          key,
          value: localStorage.getItem(key)
        })
      }
    }
    
    setStorageData({
      totalKeys: localStorage.length,
      authKeys: storageKeys,
      allKeys: Object.keys(localStorage)
    })

    // Check Supabase session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      setSessionData({
        hasSession: !!session,
        sessionError: error?.message,
        user: session?.user ? {
          id: session.user.id,
          email: session.user.email,
          confirmed: !!session.user.email_confirmed_at
        } : null,
        token: session?.access_token ? {
          length: session.access_token.length,
          start: session.access_token.substring(0, 20),
          expires: session.expires_at
        } : null
      })
    })
  }

  const clearStorage = () => {
    localStorage.clear()
    location.reload()
  }

  const testSignIn = async () => {
    try {
      // This will redirect to your actual signin page
      window.location.href = '/auth'
    } catch (err) {
      console.error('Test signin failed:', err)
    }
  }

  useEffect(() => {
    checkEverything()
  }, [])

  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">Session Debug Panel</h1>
      
      <div className="space-y-4 mb-6">
        <Button onClick={checkEverything}>Refresh Data</Button>
        <Button onClick={testSignIn} variant="outline">Test Sign In</Button>
        <Button onClick={clearStorage} variant="destructive">Clear Storage</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-100 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-3">Session Data</h2>
          <pre className="text-xs whitespace-pre-wrap overflow-auto">
            {JSON.stringify(sessionData, null, 2)}
          </pre>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-3">Storage Data</h2>
          <pre className="text-xs whitespace-pre-wrap overflow-auto">
            {JSON.stringify(storageData, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  )
}