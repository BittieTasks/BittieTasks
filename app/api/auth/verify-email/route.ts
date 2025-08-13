import { NextRequest, NextResponse } from 'next/server'
import { emailVerification } from '@/lib/email-verification'

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json()

    if (!token) {
      return NextResponse.json(
        { error: 'Verification token is required' },
        { status: 400 }
      )
    }

    const result = await emailVerification.verifyEmail(token)

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: result.message,
        redirectUrl: result.redirectUrl
      })
    } else {
      return NextResponse.json(
        { error: result.message },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Email verification error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}