import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Resend email confirmation
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: email
    })

    if (error) {
      console.error('Resend verification error:', error)
      return NextResponse.json(
        { error: error.message || 'Failed to resend verification email' },
        { status: 400 }
      )
    }

    console.log('Verification email resent to:', email)

    return NextResponse.json({
      success: true,
      message: 'Verification email sent. Please check your inbox and spam folder.'
    })

  } catch (error) {
    console.error('Resend verification API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}