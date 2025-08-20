// Quick test to check authentication flow
import { createClient } from '@supabase/supabase-js'
import fetch from 'node-fetch'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

console.log('Testing Supabase connection...')
console.log('URL:', supabaseUrl)
console.log('Key present:', !!supabaseAnonKey)

const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Test basic connection
async function testAuth() {
  try {
    const { data, error } = await supabase.auth.getSession()
    console.log('Session test:', { hasSession: !!data.session, error: error?.message })
    
    // Test API endpoint
    const response = await fetch('http://localhost:5000/api/dashboard')
    console.log('API test status:', response.status)
    const result = await response.json()
    console.log('API response:', result)
    
  } catch (err) {
    console.error('Test failed:', err.message)
  }
}

testAuth()