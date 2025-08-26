import { NextRequest, NextResponse } from 'next/server'
import { supabasePhoneAuth } from '@/lib/supabase-phone-auth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { phoneNumber } = body

    if (!phoneNumber) {
      return NextResponse.json(
        { error: 'Phone number is required' },
        { status: 400 }
      )
    }

    // Send OTP for passwordless login
    const loginResult = await supabasePhoneAuth.signInWithPhone(phoneNumber)

    if (!loginResult.success) {
      return NextResponse.json(
        { error: loginResult.error },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Verification code sent! Please check your messages.',
      needsVerification: true
    })

  } catch (error) {
    console.error('Supabase phone login API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}