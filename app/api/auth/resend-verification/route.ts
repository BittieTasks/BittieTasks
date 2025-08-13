import { NextRequest, NextResponse } from 'next/server'
import { emailVerification } from '@/lib/email-verification'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    const result = await emailVerification.resendVerificationEmail(email)

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Verification email sent successfully'
      })
    } else {
      return NextResponse.json(
        { error: result.error || 'Failed to send verification email. Please try again.' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Resend verification error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}