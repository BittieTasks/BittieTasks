import { NextRequest, NextResponse } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'

// Simple in-memory rate limiting (upgrade to Redis for production)
const requestCounts = new Map<string, { count: number; lastReset: number }>()

function isRateLimited(identifier: string, limit: number = 5, windowMs: number = 15 * 60 * 1000): boolean {
  const now = Date.now()
  const current = requestCounts.get(identifier)
  
  if (!current || now - current.lastReset > windowMs) {
    requestCounts.set(identifier, { count: 1, lastReset: now })
    return false
  }
  
  if (current.count >= limit) {
    return true
  }
  
  current.count++
  return false
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting by IP
    const clientIP = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
    
    if (isRateLimited(`signup:${clientIP}`, 5, 15 * 60 * 1000)) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      )
    }
    
    const body = await request.json()
    const { phoneNumber, firstName, lastName, otp } = body

    if (!phoneNumber || !firstName || !lastName) {
      return NextResponse.json(
        { error: 'Phone number, first name, and last name are required' },
        { status: 400 }
      )
    }

    // Validate and normalize phone number
    const normalizedPhone = phoneNumber.replace(/\D/g, '')
    let formattedPhone: string
    
    // Must be valid US phone number (10 digits, or 11 starting with 1)
    if (normalizedPhone.length === 10) {
      // Validate area code and exchange code
      const areaCode = normalizedPhone.substring(0, 3)
      const exchangeCode = normalizedPhone.substring(3, 6)
      
      if (areaCode.startsWith('0') || areaCode.startsWith('1') || 
          exchangeCode.startsWith('0') || exchangeCode.startsWith('1')) {
        return NextResponse.json(
          { error: 'Please enter a valid US phone number' },
          { status: 400 }
        )
      }
      
      // Reject obvious test numbers
      if (areaCode === '555' || areaCode === '000' || areaCode === '111') {
        return NextResponse.json(
          { error: 'Please enter a real phone number, not a test number' },
          { status: 400 }
        )
      }
      
      formattedPhone = `+1${normalizedPhone}`
    } else if (normalizedPhone.length === 11 && normalizedPhone.startsWith('1')) {
      const areaCode = normalizedPhone.substring(1, 4)
      const exchangeCode = normalizedPhone.substring(4, 7)
      
      if (areaCode.startsWith('0') || areaCode.startsWith('1') || 
          exchangeCode.startsWith('0') || exchangeCode.startsWith('1')) {
        return NextResponse.json(
          { error: 'Please enter a valid US phone number' },
          { status: 400 }
        )
      }
      
      if (areaCode === '555' || areaCode === '000' || areaCode === '111') {
        return NextResponse.json(
          { error: 'Please enter a real phone number, not a test number' },
          { status: 400 }
        )
      }
      
      formattedPhone = `+${normalizedPhone}`
    } else {
      return NextResponse.json(
        { error: 'Please enter a valid 10-digit US phone number' },
        { status: 400 }
      )
    }

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value
          },
          set(name: string, value: string, options: CookieOptions) {
            // Cannot set cookies in POST request without response
          },
          remove(name: string, options: CookieOptions) {
            // Cannot remove cookies in POST request without response
          },
        },
      }
    )

    if (!otp) {
      // Step 1: Send OTP for signup
      console.log('Sending OTP to phone:', formattedPhone.replace(/\d/g, 'X')) // Privacy: mask digits
      
      // Generate a strong password that meets Supabase requirements (we won't use it for phone auth)
      const strongPassword = 'TempPass123!@#' + Math.random().toString(36).slice(-8).toUpperCase()
      
      const { data, error } = await supabase.auth.signUp({
        phone: formattedPhone,
        password: strongPassword, // Strong password to satisfy Supabase requirements
        options: {
          data: {
            first_name: firstName,
            last_name: lastName
          }
        }
      })

      if (error) {
        console.error('Phone signup OTP error:', error)
        
        // Always return identical response to prevent enumeration
        return NextResponse.json(
          { 
            success: true,
            message: 'If eligible, a verification code will be sent.'
          },
          { status: 200 }
        )
      }

      return NextResponse.json({
        success: true,
        message: 'If eligible, a verification code will be sent.'
      })
    } else {
      // Step 2: Verify OTP and complete signup
      console.log('Verifying OTP for phone:', formattedPhone.replace(/\d/g, 'X')) // Privacy: mask digits
      
      const { data, error } = await supabase.auth.verifyOtp({
        phone: formattedPhone,
        token: otp,
        type: 'sms'
      })

      if (error || !data.session || !data.user) {
        // Log specific error server-side only, never expose to client
        if (error) console.error('OTP verification error:', error)
        if (!data.session || !data.user) console.error('OTP verification failed: no session/user')
        
        // Always return identical generic error
        return NextResponse.json(
          { error: 'Invalid or expired verification code' },
          { status: 400 }
        )
      }

      console.log('User created and verified successfully:', data.user.id)

      // Create user record in our users table (if needed)
      try {
        const userCreateSupabase = createServerClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          {
            global: {
              headers: {
                Authorization: `Bearer ${data.session.access_token}`
              }
            },
            cookies: {
              get() { return undefined },
              set() {},
              remove() {},
            },
          }
        )

        const { error: dbError } = await userCreateSupabase
          .from('users')
          .insert({
            id: data.user.id,
            phone_number: formattedPhone,
            first_name: firstName,
            last_name: lastName,
            phone_verified: true,
            verified: true
          })

        if (dbError) {
          console.log('User table insertion skipped (table may not exist or have different structure):', dbError.message)
        }
      } catch (e) {
        console.log('User table insertion skipped - continuing with authentication')
      }

      // Create the response with session cookies
      const response = NextResponse.json({
        success: true,
        verified: true,
        userId: data.user.id,
        message: 'Account created and verified successfully!',
        user: {
          id: data.user.id,
          phone: data.user.phone,
          user_metadata: data.user.user_metadata
        }
      })

      // Set session cookies
      response.cookies.set('sb-access-token', data.session.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/'
      })

      response.cookies.set('sb-refresh-token', data.session.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: '/'
      })

      return response
    }

  } catch (error) {
    console.error('Phone signup error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}