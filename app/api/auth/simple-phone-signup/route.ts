import { NextRequest, NextResponse } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { smsService } from '@/lib/sms-service'

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
      // Step 1: Send OTP for signup using our custom SMS service
      console.log('Sending OTP to phone:', formattedPhone.replace(/\d/g, 'X')) // Privacy: mask digits
      
      // Use our custom SMS service instead of Supabase's broken SMS
      const smsResult = await smsService.sendOtp(formattedPhone)
      
      // Always return identical response regardless of outcome (prevents enumeration)
      return NextResponse.json({
        success: true,
        message: 'If eligible, a verification code will be sent.'
      })
    } else {
      // Step 2: Verify OTP and complete signup
      console.log('Verifying OTP for phone:', formattedPhone.replace(/\d/g, 'X')) // Privacy: mask digits
      
      // Verify OTP using our custom service
      const otpResult = smsService.verifyOtp(formattedPhone, otp)
      
      if (!otpResult.success) {
        console.log('OTP verification failed for phone:', formattedPhone.replace(/\d/g, 'X'))
        
        // Always return identical generic error
        return NextResponse.json(
          { error: 'Invalid or expired verification code' },
          { status: 400 }
        )
      }

      // OTP verified! Now create the user in Supabase with a strong password
      console.log('OTP verified, creating user account')
      const strongPassword = 'TempPass123!@#' + Math.random().toString(36).slice(-8).toUpperCase()
      
      const { data, error } = await supabase.auth.signUp({
        phone: formattedPhone,
        password: strongPassword,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName
          }
        }
      })

      if (error || !data.user) {
        console.error('User creation error after OTP verification:', error)
        
        // Return generic error - don't expose specific creation issues
        return NextResponse.json(
          { error: 'Account creation failed. Please try again.' },
          { status: 500 }
        )
      }

      // Use service role client to confirm the phone number
      const serviceRoleSupabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        {
          cookies: {
            get(name: string) {
              return request.cookies.get(name)?.value
            },
            set(name: string, value: string, options: CookieOptions) {
              // Cannot set cookies here
            },
            remove(name: string, options: CookieOptions) {
              // Cannot remove cookies here  
            },
          },
        }
      )

      const { error: confirmError } = await serviceRoleSupabase.auth.admin.updateUserById(
        data.user.id,
        { phone_confirm: true }
      )

      if (confirmError) {
        console.error('Phone confirmation error:', confirmError)
      }

      console.log('User created and verified successfully:', data.user.id)
      
      // After phone confirmation, sign in the user to create a proper session
      const { data: sessionData, error: sessionError } = await supabase.auth.signInWithPassword({
        phone: formattedPhone,
        password: strongPassword
      })

      if (sessionError || !sessionData.session || !sessionData.user) {
        console.error('Session creation after signup error:', sessionError)
        // User is created but not logged in - still return success
        return NextResponse.json({
          success: true,
          verified: true,
          userId: data.user.id,
          message: 'Account created successfully! Please try signing in.',
          user: {
            id: data.user.id,
            phone: data.user.phone,
            user_metadata: data.user.user_metadata
          }
        })
      }

      console.log('User session created successfully after signup')

      // Create user record in our users table (if needed) using the new session
      try {
        const userCreateSupabase = createServerClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          {
            global: {
              headers: {
                Authorization: `Bearer ${sessionData.session.access_token}`
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
            id: sessionData.user.id,
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
        userId: sessionData.user.id,
        message: 'Account created and verified successfully!',
        user: {
          id: sessionData.user.id,
          phone: sessionData.user.phone,
          user_metadata: sessionData.user.user_metadata
        }
      })

      // Set proper Supabase session cookies
      response.cookies.set('sb-access-token', sessionData.session.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/'
      })

      response.cookies.set('sb-refresh-token', sessionData.session.refresh_token, {
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