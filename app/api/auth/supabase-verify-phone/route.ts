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

    // Create response with session cookies for automatic login
    const response = NextResponse.json({
      success: true,
      message: 'Phone number verified successfully! You are now logged in.',
      session: verificationResult.session
    })

    // Set session cookies for persistence (30 days)
    if (verificationResult.session) {
      const maxAge = 30 * 24 * 60 * 60 // 30 days
      
      response.cookies.set({
        name: 'sb-access-token',
        value: verificationResult.session.access_token,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge,
        path: '/',
      })

      response.cookies.set({
        name: 'sb-refresh-token', 
        value: verificationResult.session.refresh_token,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge,
        path: '/',
      })
    }

    return response
    
  } catch (error: any) {
    console.error('Supabase phone verification error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}