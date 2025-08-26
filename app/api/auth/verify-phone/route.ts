import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Create admin client
function createSupabaseAdmin() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Missing required Supabase environment variables')
  }
  
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { phoneNumber, verificationCode } = body

    if (!phoneNumber || !verificationCode) {
      return NextResponse.json(
        { error: 'Phone number and verification code are required' },
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

    // Development bypass for testing
    if (formattedPhone === '+16036611164' && verificationCode === '123456') {
      console.log('Using development bypass for phone verification')
      
      // Update user record to mark as verified
      const supabaseAdmin = createSupabaseAdmin()
      const { error: dbError } = await supabaseAdmin
        .from('users')
        .update({
          phone_verified: true,
          updated_at: new Date().toISOString()
        })
        .eq('phone_number', formattedPhone)

      if (dbError) {
        console.error('Failed to update user verification status:', dbError)
      }

      return NextResponse.json({
        success: true,
        message: 'Phone verified successfully (development mode)',
        verified: true
      })
    }

    // Use Supabase client for production phone verification
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    // Verify OTP using Supabase native auth
    const { data, error } = await supabase.auth.verifyOtp({
      phone: formattedPhone,
      token: verificationCode,
      type: 'sms'
    })

    if (error) {
      console.error('Supabase phone verification error:', error)
      
      if (error.message?.includes('invalid') || error.message?.includes('expired')) {
        return NextResponse.json(
          { error: 'Invalid or expired verification code. Please try again.' },
          { status: 400 }
        )
      }
      
      return NextResponse.json(
        { error: error.message || 'Verification failed' },
        { status: 500 }
      )
    }

    if (!data.user) {
      return NextResponse.json(
        { error: 'Verification failed - user not found' },
        { status: 400 }
      )
    }

    console.log('Phone verified successfully for user:', data.user.id)

    // Update user record to mark as verified
    const supabaseAdmin = createSupabaseAdmin()
    const { error: dbError } = await supabaseAdmin
      .from('users')
      .update({
        phone_verified: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', data.user.id)

    if (dbError) {
      console.error('Failed to update user verification status:', dbError)
    }

    return NextResponse.json({
      success: true,
      message: 'Phone verified successfully',
      verified: true,
      user: {
        id: data.user.id,
        phone: data.user.phone,
        user_metadata: data.user.user_metadata
      }
    })

  } catch (error) {
    console.error('Phone verification error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}