import { NextRequest, NextResponse } from 'next/server'
import { supabasePhoneAuth } from '@/lib/supabase-phone-auth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { phoneNumber, code } = body

    if (!phoneNumber || !code) {
      return NextResponse.json(
        { error: 'Phone number and verification code are required' },
        { status: 400 }
      )
    }

    // Verify the code using Supabase
    const verificationResult = await supabasePhoneAuth.verifyCode(phoneNumber, code)
    
    if (!verificationResult.success) {
      return NextResponse.json(
        { error: verificationResult.error },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Phone number verified successfully! You can now sign in.',
      session: verificationResult.session,
      redirectUrl: '/auth?tab=signin'
    })
    
  } catch (error: any) {
    console.error('Supabase phone verification error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}