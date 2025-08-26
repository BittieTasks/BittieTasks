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

    // For phone-only auth, we'll create a simple session without Supabase auth
    // This bypasses the email signup restriction
    console.log('Phone verification successful, creating session...')
    
    // Set a simple session cookie to track authentication
    const response = NextResponse.json({
      success: true,
      message: 'Phone number verified successfully!'
    })
    
    // Set authentication cookie
    response.cookies.set('phone_auth', normalizedPhone, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7 // 7 days
    })
    
    // Also set user info cookie
    response.cookies.set('user_info', JSON.stringify({
      phone: normalizedPhone,
      firstName: firstName || 'User',
      lastName: lastName || ''
    }), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7 // 7 days
    })
    
    return response

  } catch (error) {
    console.error('Phone verification error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}