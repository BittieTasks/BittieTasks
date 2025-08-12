import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    // Get the service role key for admin operations
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    
    if (!serviceRoleKey) {
      return NextResponse.json({
        error: 'Missing SUPABASE_SERVICE_ROLE_KEY',
        suggestion: 'You need the service role key to debug SMTP settings',
        getItFrom: 'Supabase Dashboard → Settings → API → service_role key'
      }, { status: 500 })
    }

    // Create admin client
    const supabase = createClient(supabaseUrl!, serviceRoleKey)
    
    // Try to get more detailed error information
    const body = await request.json()
    const { email } = body
    
    if (!email) {
      return NextResponse.json({ error: 'Email required for test' }, { status: 400 })
    }

    // Test with more detailed logging
    console.log('Testing Supabase signup with detailed logging...')
    console.log('Supabase URL:', supabaseUrl)
    console.log('Using service role key:', serviceRoleKey ? 'YES' : 'NO')
    
    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: 'VeryStrongTestPassword123!@#$%^&*()',
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:5000'}/auth/callback`
      }
    })

    if (error) {
      console.error('Detailed Supabase error:', {
        message: error.message,
        status: error.status,
        code: error.code,
        name: error.name
      })
      
      return NextResponse.json({
        error: 'Supabase signup failed',
        details: {
          message: error.message,
          status: error.status,
          code: error.code,
          name: error.name
        },
        troubleshooting: {
          likely_cause: error.code === 'unexpected_failure' ? 'SMTP Configuration Issue' : 'Authentication Error',
          next_steps: [
            'Check Supabase → Authentication → Settings → SMTP',
            'Verify sender email matches SendGrid verified email',
            'Check email templates for proper formatting',
            'Ensure Site URL includes your domain'
          ]
        }
      }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      message: 'Signup successful! Check for confirmation email.',
      user_id: data.user?.id,
      email_sent: !data.user?.email_confirmed_at
    })

  } catch (error: any) {
    console.error('Debug test error:', error)
    return NextResponse.json({
      error: 'Test failed',
      details: error.message
    }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Supabase SMTP Debug Endpoint',
    usage: 'POST with {"email": "test@example.com"}',
    requirements: [
      'SUPABASE_SERVICE_ROLE_KEY environment variable',
      'Proper SMTP configuration in Supabase dashboard',
      'Email templates configured correctly'
    ]
  })
}