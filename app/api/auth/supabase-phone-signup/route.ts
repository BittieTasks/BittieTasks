import { NextRequest, NextResponse } from 'next/server'
import { supabasePhoneAuth } from '@/lib/supabase-phone-auth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { phoneNumber, firstName, lastName, password } = body

    if (!phoneNumber || !firstName || !lastName) {
      return NextResponse.json(
        { error: 'Phone number, first name, and last name are required' },
        { status: 400 }
      )
    }

    if (!password || password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      )
    }

    // Create user with phone and password
    const signupResult = await supabasePhoneAuth.signUpWithPhone(phoneNumber, password, {
      firstName,
      lastName
    })

    if (!signupResult.success) {
      return NextResponse.json(
        { error: signupResult.error },
        { status: 400 }
      )
    }

    // Send verification code
    const verificationResult = await supabasePhoneAuth.sendVerificationCode(phoneNumber)
    
    if (!verificationResult.success) {
      console.error('Failed to send verification code:', verificationResult.error)
      // Don't fail the signup since user is created, just log the SMS error
      return NextResponse.json({
        success: true,
        user: signupResult.user,
        message: 'Account created successfully! Verification code sending failed - please try manual verification.',
        needsVerification: true,
        smsError: verificationResult.error
      })
    }

    return NextResponse.json({
      success: true,
      user: signupResult.user,
      message: 'Account created successfully! Please check your messages for a verification code.',
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