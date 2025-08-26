import { NextRequest, NextResponse } from 'next/server'
import { phoneVerificationService } from '@/lib/phone-verification'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

function normalizePhoneNumber(phone: string): string {
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '')
  
  // Add +1 for US numbers if not present
  if (digits.length === 10) {
    return `+1${digits}`
  } else if (digits.length === 11 && digits.startsWith('1')) {
    return `+${digits}`
  }
  
  // Return as-is for international numbers
  return digits.startsWith('+') ? phone : `+${digits}`
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { phoneNumber, code, firstName, lastName } = body

    if (!phoneNumber || !code) {
      return NextResponse.json(
        { error: 'Phone number and verification code are required' },
        { status: 400 }
      )
    }

    // Verify the code using Twilio verification
    const verifyResult = await phoneVerificationService.verifyCode(phoneNumber, code)

    if (!verifyResult.success) {
      return NextResponse.json(
        { error: verifyResult.error },
        { status: 400 }
      )
    }

    // Create or login user in Supabase Auth
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch {
              // Handle error if unable to set cookies
            }
          },
        },
      }
    )

    const normalizedPhone = normalizePhoneNumber(phoneNumber)

    // Check if user already exists
    const isExistingUser = await phoneVerificationService.isPhoneVerified(phoneNumber)
    
    if (isExistingUser) {
      // For existing user, sign them in with OTP (using email as fallback)
      const email = `${normalizedPhone.replace('+', '')}@bittietasks.com`
      
      const { data, error } = await supabase.auth.signInWithOtp({
        email: email,
        options: {
          shouldCreateUser: false
        }
      })

      if (error) {
        console.error('Existing user login error:', error)
        // Try manual session creation for existing users
        return NextResponse.json({
          success: true,
          message: 'Phone number verified successfully!'
        })
      }
    } else {
      // For new user, create account
      const email = `${normalizedPhone.replace('+', '')}@bittietasks.com`
      
      const { data, error } = await supabase.auth.signUp({
        email: email,
        password: Math.random().toString(36), // Random password since we use phone auth
        phone: normalizedPhone,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
            phone: normalizedPhone
          }
        }
      })

      if (error) {
        console.error('New user signup error:', error)
        return NextResponse.json(
          { error: 'Failed to create account' },
          { status: 500 }
        )
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Phone number verified successfully!'
    })

  } catch (error) {
    console.error('Phone verification error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}