'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function SimpleAuthTest() {
  const [email, setEmail] = useState('test@bittietasks.com')
  const [password, setPassword] = useState('BittieTasks2025!')
  const [status, setStatus] = useState('')
  const [result, setResult] = useState<any>(null)

  const testDirectSignIn = async () => {
    setStatus('Testing manual authentication...')
    
    try {
      console.log('Manual auth sign-in attempt for:', email)
      
      // Use manual auth system
      const { ManualAuthManager } = await import('@/lib/manual-auth')
      const data = await ManualAuthManager.signIn(email, password)
      
      console.log('Manual sign-in response:', {
        hasUser: !!data.user,
        hasSession: !!data.session,
        hasAccessToken: !!data.session?.access_token,
        hasRefreshToken: !!data.session?.refresh_token
      })
      
      if (!data.session) {
        setStatus('Sign-in failed: No session returned')
        setResult({ error: 'No session returned' })
        return
      }
      
      // Check manual storage immediately
      const manualSession = ManualAuthManager.getStoredSession()
      const isAuthenticated = ManualAuthManager.isAuthenticated()
      
      // Also check Supabase storage (for comparison)
      setTimeout(async () => {
        const { data: sessionCheck } = await supabase.auth.getSession()
        const supabaseStorage = localStorage.getItem('sb-ttgbotlcbzmmyqawnjpj-auth-token')
        
        console.log('Post sign-in storage comparison:', {
          manualSession: !!manualSession,
          supabaseSession: !!sessionCheck.session,
          manualAuth: isAuthenticated,
          supabaseStorage: !!supabaseStorage
        })
        
        setResult({
          success: true,
          method: 'Manual Authentication',
          user: data.user?.email,
          manualSessionSaved: !!manualSession,
          manualAuthWorking: isAuthenticated,
          supabaseSessionPersisted: !!sessionCheck.session,
          supabaseStoragePersisted: !!supabaseStorage,
          accessTokenLength: data.session?.access_token?.length,
          refreshTokenExists: !!data.session?.refresh_token
        })
        setStatus('Manual authentication complete - session saved successfully!')
      }, 500)
      
    } catch (err: any) {
      console.error('Manual sign-in test failed:', err)
      setStatus(`Manual auth failed: ${err.message}`)
      setResult({ error: err.message })
    }
  }
  
  const createTestUser = async () => {
    setStatus('Creating test user...')
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: window.location.origin
        }
      })
      
      if (error) {
        setStatus(`Signup failed: ${error.message}`)
        setResult({ error: error.message })
        return
      }
      
      setStatus('Test user created - check email for verification')
      setResult({
        userCreated: true,
        needsVerification: !data.user?.email_confirmed_at
      })
      
    } catch (err: any) {
      setStatus(`Signup failed: ${err.message}`)
      setResult({ error: err.message })
    }
  }

  return (
    <div className="container mx-auto p-8 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Direct Authentication Test</h1>
      
      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>
      </div>
      
      <div className="space-y-3 mb-6">
        <button
          onClick={testDirectSignIn}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Test Direct Sign-In
        </button>
        <button
          onClick={createTestUser}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 ml-2"
        >
          Create Test User
        </button>
        <button
          onClick={() => window.location.href = '/debug-session'}
          className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 ml-2"
        >
          Go to Debug Session
        </button>
      </div>
      
      {status && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded">
          <strong>Status:</strong> {status}
        </div>
      )}
      
      {result && (
        <div className="bg-gray-100 p-4 rounded">
          <h3 className="font-semibold mb-2">Test Result:</h3>
          <pre className="text-sm whitespace-pre-wrap overflow-auto">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
      
      <div className="mt-8 text-sm text-gray-600">
        <p><strong>Purpose:</strong> Test manual authentication system that bypasses Supabase session persistence issues</p>
        <p><strong>Expected:</strong> Successful sign-in with manual session storage working correctly</p>
        <p><strong>Key:</strong> Manual auth should work even when Supabase localStorage fails</p>
      </div>
    </div>
  )
}