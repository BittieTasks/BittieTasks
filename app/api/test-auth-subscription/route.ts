import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Test endpoint that creates a valid auth token for testing subscription flow

export async function POST(request: NextRequest) {
  try {
    const { email = 'test@bittietasks.com', password = 'testpass123' } = await request.json()
    
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    
    // Try to sign in with test user
    let { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    
    if (authError) {
      // Create test user if doesn't exist
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: 'Test',
            last_name: 'User'
          }
        }
      })
      
      if (signUpError) {
        return NextResponse.json({ error: 'Failed to create test user', details: signUpError }, { status: 400 })
      }
      
      authData = signUpData
    }
    
    if (!authData.session?.access_token) {
      return NextResponse.json({ error: 'No access token generated' }, { status: 400 })
    }
    
    // Now test the subscription endpoint with this token
    const subscriptionResponse = await fetch(`${request.headers.get('origin') || 'http://localhost:5000'}/api/create-subscription`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authData.session.access_token}`
      },
      body: JSON.stringify({
        planType: 'pro',
        price: 9.99
      })
    })
    
    const subscriptionResult = await subscriptionResponse.text()
    
    return NextResponse.json({
      success: true,
      auth_working: !!authData.session,
      access_token_present: !!authData.session?.access_token,
      subscription_endpoint: {
        status: subscriptionResponse.status,
        response: subscriptionResult.length > 500 ? subscriptionResult.substring(0, 500) + '...' : subscriptionResult
      }
    })
    
  } catch (error) {
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      success: false 
    }, { status: 500 })
  }
}