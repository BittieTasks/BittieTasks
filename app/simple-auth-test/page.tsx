'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function SimpleAuthTest() {
  const [status, setStatus] = useState('Ready to test')
  const [email] = useState('test@example.com')
  const [password] = useState('testpass123')

  const runTest = async () => {
    setStatus('Testing authentication...')
    
    try {
      // Test 1: Try to sign up
      setStatus('Step 1: Testing signup...')
      const { data: signupData, error: signupError } = await supabase.auth.signUp({
        email,
        password
      })
      
      if (signupError) {
        setStatus(`Signup Error: ${signupError.message}`)
        console.error('Signup failed:', signupError)
        return
      }
      
      setStatus('Step 2: Signup successful, testing signin...')
      
      // Test 2: Try to sign in  
      const { data: signinData, error: signinError } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      
      if (signinError) {
        setStatus(`Signin Error: ${signinError.message}`)
        console.error('Signin failed:', signinError)
        return
      }
      
      setStatus(`SUCCESS! Authentication working. User: ${signinData.user?.email}`)
      
    } catch (err: any) {
      setStatus(`Error: ${err.message}`)
      console.error('Test failed:', err)
    }
  }

  return (
    <div className="p-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">Simple Authentication Test</h1>
      
      <div className="bg-blue-50 p-4 rounded mb-4">
        <p><strong>Test Email:</strong> {email}</p>
        <p><strong>Test Password:</strong> {password}</p>
      </div>
      
      <button 
        onClick={runTest}
        className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-lg font-medium mb-4"
      >
        Test Authentication Now
      </button>
      
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="font-bold mb-2">Status:</h3>
        <p className="font-mono text-sm">{status}</p>
      </div>
      
      <div className="mt-4 text-sm text-gray-600">
        <p>This test will show exactly what error occurs during authentication.</p>
      </div>
    </div>
  )
}