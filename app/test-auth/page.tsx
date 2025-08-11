'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function TestAuthPage() {
  const [result, setResult] = useState('')
  
  const testDirectAuth = async () => {
    setResult('Testing...')
    
    try {
      console.log('Direct Supabase test starting...')
      
      // Test 1: Basic connection
      setResult('Testing connection...')
      const { data: testData, error: testError } = await supabase
        .from('profiles')
        .select('count')
        .limit(1)
        
      if (testError) {
        setResult(`Connection failed: ${testError.message}`)
        return
      }
      
      // Test 2: Sign up
      setResult('Testing signup...')
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: 'test' + Date.now() + '@example.com',
        password: 'testpass123'
      })
      
      if (signUpError) {
        setResult(`Signup failed: ${signUpError.message}`)
        return
      }
      
      setResult(`Success! User created: ${JSON.stringify(signUpData, null, 2)}`)
      
    } catch (err: any) {
      setResult(`Exception: ${err.message}`)
      console.error('Test error:', err)
    }
  }
  
  return (
    <div className="p-8">
      <h1 className="text-2xl mb-4">Direct Auth Test</h1>
      
      <button 
        onClick={testDirectAuth}
        className="bg-blue-500 text-white px-4 py-2 rounded mb-4"
      >
        Test Authentication
      </button>
      
      <pre className="bg-gray-100 p-4 rounded overflow-auto">
        {result || 'Click button to test...'}
      </pre>
    </div>
  )
}