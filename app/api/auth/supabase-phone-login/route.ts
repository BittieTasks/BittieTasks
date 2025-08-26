import { NextRequest, NextResponse } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { supabasePhoneAuth } from '@/lib/supabase-phone-auth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { phoneNumber, password, useOTP } = body

    if (!phoneNumber) {
      return NextResponse.json(
        { error: 'Phone number is required' },
        { status: 400 }
      )
    }

    // If requesting OTP-based login (passwordless)
    if (useOTP) {
      const verificationResult = await supabasePhoneAuth.sendVerificationCode(phoneNumber)
      
      if (!verificationResult.success) {
        return NextResponse.json(
          { error: verificationResult.error },
          { status: 400 }
        )
      }

      return NextResponse.json({
        success: true,
        message: 'Verification code sent! Please check your messages.',
        needsOTPVerification: true
      })
    }

    // Password-based login
    if (!password) {
      return NextResponse.json(
        { error: 'Password is required for login' },
        { status: 400 }
      )
    }

    // Sign in with phone and password
    const loginResult = await supabasePhoneAuth.signInWithPhone(phoneNumber, password)

    if (!loginResult.success) {
      // Handle phone not confirmed error specifically
      if (loginResult.error?.includes('verify your phone number')) {
        return NextResponse.json(
          { 
            error: loginResult.error,
            needsVerification: true,
            phoneNumber: phoneNumber
          },
          { status: 400 }
        )
      }
      
      return NextResponse.json(
        { error: loginResult.error },
        { status: 400 }
      )
    }

    console.log('User logged in successfully:', loginResult.user?.id)

    // Create the response with session cookies
    const response = NextResponse.json({
      success: true,
      user: loginResult.user,
      session: loginResult.session,
      message: 'Login successful'
    })

    // Set session cookies for persistence
    if (loginResult.session) {
      const maxAge = 30 * 24 * 60 * 60 // 30 days
      
      response.cookies.set({
        name: 'sb-access-token',
        value: loginResult.session.access_token,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge,
        path: '/',
      })

      response.cookies.set({
        name: 'sb-refresh-token', 
        value: loginResult.session.refresh_token,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge,
        path: '/',
      })
    }

    return response

  } catch (error) {
    console.error('Supabase phone login API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}