'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function AuthDebugPage() {
  const [results, setResults] = useState<any[]>([])
  const [email, setEmail] = useState('test@example.com')
  const [password, setPassword] = useState('testpass123')

  const addResult = (message: string, data?: any) => {
    const timestamp = new Date().toLocaleTimeString()
    setResults(prev => [...prev, { message, data, timestamp }])
  }

  useEffect(() => {
    addResult('Page loaded, checking Supabase client initialization')
    
    // Check if supabase client is properly initialized
    if (supabase) {
      addResult('✅ Supabase client exists')
      addResult('Config check: Supabase client initialized')
    } else {
      addResult('❌ Supabase client not initialized')
    }
    
    // Check session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        addResult('❌ Error getting session:', error)
      } else if (session) {
        addResult('✅ Existing session found:', session.user.email)
      } else {
        addResult('ℹ️ No existing session')
      }
    })
  }, [])

  const testSignUp = async () => {
    addResult('🔄 Testing sign up...')
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      })
      
      if (error) {
        addResult('❌ Sign up error:', error)
      } else {
        addResult('✅ Sign up success:', data)
      }
    } catch (err) {
      addResult('❌ Sign up exception:', err)
    }
  }

  const testSignIn = async () => {
    addResult('🔄 Testing sign in...')
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      
      if (error) {
        addResult('❌ Sign in error:', error)
      } else {
        addResult('✅ Sign in success:', data)
      }
    } catch (err) {
      addResult('❌ Sign in exception:', err)
    }
  }

  const testConnection = async () => {
    addResult('🔄 Testing Supabase connection...')
    
    try {
      // Test basic connection by trying to fetch data
      const { data, error } = await supabase
        .from('profiles')
        .select('count')
        .limit(1)
      
      if (error) {
        addResult('❌ Connection test error:', error)
      } else {
        addResult('✅ Connection successful')
      }
    } catch (err) {
      addResult('❌ Connection test exception:', err)
    }
  }

  const clearResults = () => {
    setResults([])
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>Authentication Debug Console</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="test@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Password</label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="password"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={testConnection} variant="outline">Test Connection</Button>
              <Button onClick={testSignUp} variant="outline">Test Sign Up</Button>
              <Button onClick={testSignIn} variant="outline">Test Sign In</Button>
              <Button onClick={clearResults} variant="destructive">Clear</Button>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg max-h-96 overflow-y-auto">
            <h3 className="font-bold mb-2">Debug Results:</h3>
            {results.length === 0 ? (
              <p className="text-gray-500">No results yet...</p>
            ) : (
              <div className="space-y-2">
                {results.map((result, index) => (
                  <div key={index} className="text-xs font-mono">
                    <span className="text-gray-500">[{result.timestamp}]</span> 
                    <span className="ml-2">{result.message}</span>
                    {result.data && (
                      <pre className="ml-4 mt-1 text-xs bg-gray-100 p-2 rounded overflow-x-auto">
                        {JSON.stringify(result.data, null, 2)}
                      </pre>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}