// Test script to check if Supabase auth tokens work
const { createClient } = require('@supabase/supabase-js')

async function testAuth() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  console.log('Testing Supabase auth with:', {
    url: supabaseUrl,
    hasKey: !!supabaseKey
  })
  
  const supabase = createClient(supabaseUrl, supabaseKey)
  
  // Try to get session
  const { data, error } = await supabase.auth.getSession()
  
  console.log('Session check:', {
    hasData: !!data,
    hasSession: !!data.session,
    hasUser: !!data.session?.user,
    hasToken: !!data.session?.access_token,
    error: error?.message
  })
  
  return data.session
}

testAuth().catch(console.error)