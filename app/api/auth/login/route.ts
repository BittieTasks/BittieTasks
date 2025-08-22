import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Sign in with email and password
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) {
      console.error('Login error:', error)
      
      // Handle email not confirmed error specifically
      if (error.message === 'Email not confirmed') {
        return NextResponse.json(
          { 
            error: 'Please verify your email address first. Check your inbox (including spam folder) for the verification link.',
            needsVerification: true 
          },
          { status: 400 }
        )
      }
      
      return NextResponse.json(
        { error: error.message || 'Invalid email or password' },
        { status: 400 }
      )
    }

    if (!data.user) {
      return NextResponse.json(
        { error: 'Login failed' },
        { status: 400 }
      )
    }

    console.log('User logged in successfully:', data.user.id)

    // Set session cookie for client persistence
    const response = NextResponse.json({
      success: true,
      user: data.user,
      session: data.session,
      message: 'Login successful'
    })

    // Set httpOnly cookie for session persistence
    if (data.session) {
      response.cookies.set('sb-session', JSON.stringify({
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
        expires_at: data.session.expires_at
      }), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7 // 7 days
      })
    }

    return response

  } catch (error) {
    console.error('Login API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}