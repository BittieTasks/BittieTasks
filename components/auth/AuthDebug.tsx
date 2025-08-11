'use client'

import { useAuth } from './AuthProvider'
import { supabase } from '../../lib/supabase'
import { useEffect, useState } from 'react'

export function AuthDebug() {
  const { user, session, loading, isAuthenticated } = useAuth()
  const [envCheck, setEnvCheck] = useState<any>({})

  useEffect(() => {
    // Check environment variables
    setEnvCheck({
      hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      url: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 30) + '...',
      keyPrefix: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 10) + '...'
    })

    // Test Supabase connection
    supabase.auth.getSession().then(({ data, error }) => {
      console.log('Auth session check:', { data: data?.session ? 'Session exists' : 'No session', error })
    })
  }, [])

  if (process.env.NODE_ENV === 'production') {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white p-4 border rounded-lg shadow-lg text-xs max-w-xs z-50">
      <h4 className="font-bold mb-2">Auth Debug</h4>
      <div className="space-y-1">
        <div>Loading: {loading ? 'Yes' : 'No'}</div>
        <div>User: {user ? user.email : 'None'}</div>
        <div>Session: {session ? 'Exists' : 'None'}</div>
        <div>Authenticated: {isAuthenticated ? 'Yes' : 'No'}</div>
        <div>URL: {envCheck.hasUrl ? '✓' : '✗'}</div>
        <div>Key: {envCheck.hasKey ? '✓' : '✗'}</div>
      </div>
    </div>
  )
}