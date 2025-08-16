import { NextRequest, NextResponse } from 'next/server'
import { simpleEmailVerification } from '@/lib/email-simple'

export async function POST(request: NextRequest) {
  try {
    const { userId, email } = await request.json()

    if (!userId || !email) {
      return NextResponse.json(
        { error: 'User ID and email are required' },
        { status: 400 }
      )
    }

    const result = await simpleEmailVerification.sendVerificationEmail(userId, email)

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Verification email sent successfully'
      })
    } else {
      return NextResponse.json(
        { error: result.error || 'Failed to send verification email' },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Send verification email error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}