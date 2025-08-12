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

    console.log('Debug: Attempting sign in for:', email)

    // Try signing in first
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    console.log('Sign in result:', { signInData, signInError })

    if (signInError) {
      // If sign in fails, try to resend confirmation
      const { error: resendError } = await supabase.auth.resend({
        type: 'signup',
        email,
      })

      console.log('Resend confirmation result:', { resendError })

      return NextResponse.json({
        signInError: signInError.message,
        resendError: resendError?.message,
        suggestion: 'Try clicking the verification link in your email, or the account may need manual verification'
      })
    }

    return NextResponse.json({
      success: true,
      user: signInData.user,
      session: signInData.session
    })

  } catch (error) {
    console.error('Debug error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}