import { NextRequest, NextResponse } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { phoneVerificationService } from '@/lib/phone-verification'

export async function POST(request: NextRequest) {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          // We'll set cookies on the final response, not here
        },
        remove(name: string, options: CookieOptions) {
          // We'll handle cookie removal on the final response
        },
      },
    }
  )

  try {
    const body = await request.json()
    const { phoneNumber, password, verificationCode } = body

    if (!phoneNumber) {
      return NextResponse.json(
        { error: 'Phone number is required' },
        { status: 400 }
      )
    }

    // Normalize phone number
    const normalizedPhone = phoneNumber.replace(/\D/g, '')
    let formattedPhone = normalizedPhone
    
    if (normalizedPhone.length === 10) {
      formattedPhone = `+1${normalizedPhone}`
    } else if (normalizedPhone.length === 11 && normalizedPhone.startsWith('1')) {
      formattedPhone = `+${normalizedPhone}`
    } else {
      formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+${normalizedPhone}`
    }

    // If verification code is provided, use passwordless login
    if (verificationCode) {
      // Verify the code first
      const verificationResult = await phoneVerificationService.verifyCode(formattedPhone, verificationCode)
      
      if (!verificationResult.success) {
        return NextResponse.json(
          { error: verificationResult.error },
          { status: 400 }
        )
      }

      // Sign in with phone using OTP (this is for phone-based login)
      const { data, error } = await supabase.auth.signInWithOtp({
        phone: formattedPhone,
      })

      if (error) {
        console.error('Phone OTP login error:', error)
        return NextResponse.json(
          { error: error.message || 'Phone verification login failed' },
          { status: 400 }
        )
      }

      return NextResponse.json({
        success: true,
        message: 'Verification code sent! Please check your messages.',
        needsOTPVerification: true
      })
    }

    // Password-based login for existing users
    if (!password) {
      return NextResponse.json(
        { error: 'Password is required for login' },
        { status: 400 }
      )
    }

    // Sign in with phone and password
    const { data, error } = await supabase.auth.signInWithPassword({
      phone: formattedPhone,
      password
    })

    if (error) {
      console.error('Phone login error:', error)
      
      // Handle phone not confirmed error specifically
      if (error.message === 'Phone not confirmed') {
        return NextResponse.json(
          { 
            error: 'Please verify your phone number first. Check your messages for the verification code.',
            needsVerification: true,
            phoneNumber: formattedPhone
          },
          { status: 400 }
        )
      }
      
      return NextResponse.json(
        { error: error.message || 'Invalid phone number or password' },
        { status: 400 }
      )
    }

    if (!data.user) {
      return NextResponse.json(
        { error: 'Login failed' },
        { status: 400 }
      )
    }

    console.log('User logged in successfully:', data.user.id)

    // Create the response with session cookies
    const response = NextResponse.json({
      success: true,
      user: data.user,
      session: data.session,
      message: 'Login successful'
    })

    // Manually set the essential session cookies for persistence
    if (data.session) {
      const maxAge = 30 * 24 * 60 * 60 // 30 days
      
      response.cookies.set({
        name: 'sb-access-token',
        value: data.session.access_token,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge,
        path: '/',
        domain: undefined // Let browser determine domain
      })

      response.cookies.set({
        name: 'sb-refresh-token', 
        value: data.session.refresh_token,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge,
        path: '/',
        domain: undefined // Let browser determine domain
      })
    }

    return response

  } catch (error) {
    console.error('Phone login API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}