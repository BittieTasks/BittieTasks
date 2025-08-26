import { NextRequest, NextResponse } from 'next/server'
import { phoneVerificationService } from '@/lib/phone-verification'

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

    // Check if phone is already verified
    const isVerified = await phoneVerificationService.isPhoneVerified(phoneNumber)
    if (isVerified) {
      return NextResponse.json(
        { error: 'An account with this phone number already exists. Please sign in instead.' },
        { status: 400 }
      )
    }

    // Send verification code via Twilio
    const result = await phoneVerificationService.sendVerificationCode(phoneNumber)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Verification code sent! Please check your messages.',
      needsVerification: true
    })

  } catch (error) {
    console.error('Phone signup error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}