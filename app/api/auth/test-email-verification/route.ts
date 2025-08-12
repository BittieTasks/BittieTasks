import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    // Test email verification flow
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${new URL(request.url).origin}/auth/callback`,
        data: {
          firstName: 'Test',
          lastName: 'User'
        }
      },
    })

    console.log('Email verification test result:', { data, error })

    if (error) {
      return NextResponse.json({
        error: error.message,
        details: error
      }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      user: data.user,
      session: data.session,
      emailSent: !data.session, // If no session, email verification is required
      message: data.session 
        ? 'User created and automatically signed in (email confirmation disabled)'
        : 'User created, email verification required'
    })

  } catch (error: any) {
    console.error('Email verification test error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Email verification test endpoint',
    usage: 'POST with { "email": "test@example.com", "password": "testpassword123" }',
    environment: {
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Missing',
      supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Missing',
      sendgridKey: process.env.SENDGRID_API_KEY ? 'Set' : 'Missing'
    }
  })
}