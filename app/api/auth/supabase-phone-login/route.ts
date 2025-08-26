import { NextRequest, NextResponse } from 'next/server'
import { phoneVerificationService } from '@/lib/phone-verification'

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

    // Check if phone is verified (user exists)
    const isVerified = await phoneVerificationService.isPhoneVerified(phoneNumber)
    if (!isVerified) {
      return NextResponse.json(
        { error: 'No account found with this phone number. Please sign up first.' },
        { status: 400 }
      )
    }

    // Send verification code for login
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
    console.error('Phone login API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}