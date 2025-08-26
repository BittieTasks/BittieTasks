import { NextRequest, NextResponse } from 'next/server'
import { supabasePhoneAuth } from '@/lib/supabase-phone-auth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { phoneNumber, firstName, lastName } = body

    if (!phoneNumber || !firstName || !lastName) {
      return NextResponse.json(
        { error: 'Phone number, first name, and last name are required' },
        { status: 400 }
      )
    }

    // Sign up with phone only (passwordless) - this automatically sends OTP
    const signupResult = await supabasePhoneAuth.signUpWithPhone(phoneNumber, {
      firstName,
      lastName
    })

    if (!signupResult.success) {
      return NextResponse.json(
        { error: signupResult.error },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Verification code sent! Please check your messages.',
      needsVerification: true
    })

  } catch (error) {
    console.error('Supabase phone signup error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}