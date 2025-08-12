import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    console.log('Bypass verification attempt for:', email)

    // First, try normal sign in
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (!signInError && signInData.user) {
      return NextResponse.json({
        success: true,
        message: 'Sign in successful',
        user: signInData.user,
        session: signInData.session
      })
    }

    // If sign in fails due to unconfirmed email, try to manually confirm
    if (signInError?.message.includes('Email not confirmed') || 
        signInError?.message.includes('Invalid login credentials')) {
      
      // Try to resend confirmation and then attempt sign in again
      const { error: resendError } = await supabase.auth.resend({
        type: 'signup',
        email,
      })

      // Wait a moment and try sign in again
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const { data: retryData, error: retryError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (!retryError && retryData.user) {
        return NextResponse.json({
          success: true,
          message: 'Sign in successful after retry',
          user: retryData.user,
          session: retryData.session
        })
      }

      return NextResponse.json({
        error: 'Account exists but email verification is required. Check your email for verification link.',
        details: {
          originalError: signInError.message,
          retryError: retryError?.message,
          resendError: resendError?.message
        }
      }, { status: 401 })
    }

    return NextResponse.json({
      error: signInError.message
    }, { status: 401 })

  } catch (error) {
    console.error('Bypass verification error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}