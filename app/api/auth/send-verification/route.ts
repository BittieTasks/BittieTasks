import { NextRequest, NextResponse } from 'next/server'
import { emailVerification } from '@/lib/email-verification'

export async function POST(request: NextRequest) {
  try {
    const { userId, email } = await request.json()

    if (!userId || !email) {
      return NextResponse.json(
        { error: 'User ID and email are required' },
        { status: 400 }
      )
    }

    const result = await emailVerification.sendVerificationEmail(userId, email)

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Verification email sent successfully'
      })
    } else {
      return NextResponse.json(
        { error: result.error || 'Failed to send verification email' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Send verification error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}