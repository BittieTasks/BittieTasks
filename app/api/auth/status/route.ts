import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET(request: NextRequest) {
  try {
    // Test Supabase connection
    const { data: authTest, error: authError } = await supabase.auth.getSession()
    
    // Get basic project info
    const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/`, {
      headers: {
        'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      }
    })

    return NextResponse.json({
      status: 'Authentication system operational',
      supabase_connected: !authError,
      sendgrid_configured: !!process.env.SENDGRID_API_KEY,
      api_endpoints: {
        signin: '/api/auth/signin',
        signup: '/api/auth/signup', 
        profile: '/api/auth/profile'
      },
      next_steps: [
        'Visit /auth to test signup/signin',
        'Use strong password with mixed case, numbers, symbols',
        'Email verification required for full access'
      ]
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'System status check failed', details: error },
      { status: 500 }
    )
  }
}