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
    
    if (isRateLimited(`signin:${clientIP}`, 5, 15 * 60 * 1000)) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      )
    }
    
    const body = await request.json()
    const { phoneNumber, otp } = body

    if (!phoneNumber) {
      return NextResponse.json(
        { error: 'Phone number is required' },
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
      // Step 1: Send OTP for signin using our custom SMS service
      console.log('Sending OTP to phone:', formattedPhone.replace(/\d/g, 'X')) // Privacy: mask digits
      
      // Use our custom SMS service instead of Supabase's broken SMS
      const smsResult = await smsService.sendOtp(formattedPhone)
      
      // Always return identical response regardless of outcome (prevents enumeration)
      return NextResponse.json({
        success: true,
        message: 'If eligible, a verification code will be sent.'
      })
    } else {
      // Step 2: Verify OTP and complete signin
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

      // OTP verified! Now sign in the existing user
      console.log('OTP verified, signing in user')
      
      // Use the service role client to find and sign in the user
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

      // Find user by phone number
      const { data: users, error: findError } = await serviceRoleSupabase.auth.admin.listUsers({
        page: 1,
        perPage: 1000 // Get all users to search for phone
      })

      if (findError || !users) {
        console.error('Error finding user by phone:', findError)
        return NextResponse.json(
          { error: 'Invalid or expired verification code' },
          { status: 400 }
        )
      }

      // Find user with matching phone number
      const user = users.users.find(u => u.phone === formattedPhone)
      
      if (!user) {
        console.log('User not found for phone:', formattedPhone.replace(/\d/g, 'X'))
        return NextResponse.json(
          { error: 'Invalid or expired verification code' },
          { status: 400 }
        )
      }

      // Create a proper Supabase session using signInWithPassword
      // First, we need to generate a temporary password for this user
      const tempPassword = 'TempOTP_' + Math.random().toString(36).slice(-12) + '!'
      
      // Update user with temporary password
      const { error: updateError } = await serviceRoleSupabase.auth.admin.updateUserById(
        user.id,
        { password: tempPassword }
      )

      if (updateError) {
        console.error('Password update error:', updateError)
        return NextResponse.json(
          { error: 'Sign in failed. Please try again.' },
          { status: 500 }
        )
      }

      // Now sign in with the temporary password to create a real session
      const { data: sessionData, error: sessionError } = await supabase.auth.signInWithPassword({
        phone: formattedPhone,
        password: tempPassword
      })

      if (sessionError || !sessionData.session || !sessionData.user) {
        console.error('Session creation error:', sessionError)
        return NextResponse.json(
          { error: 'Sign in failed. Please try again.' },
          { status: 500 }
        )
      }

      console.log('User signed in successfully:', sessionData.user.id)

      // Create the response with session cookies
      const response = NextResponse.json({
        success: true,
        verified: true,
        userId: sessionData.user.id,
        message: 'Signed in successfully!',
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
    console.error('Phone signin error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}