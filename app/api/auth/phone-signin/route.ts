import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { phoneNumber } = body

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

    // Development bypass for testing
    if (formattedPhone === '+16036611164') {
      console.log('Using development bypass for phone signin')
      return NextResponse.json({
        success: true,
        message: 'Development signin initiated. Use code 123456 to verify.',
        needsVerification: true
      })
    }

    // Use Supabase client for production phone signin
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    // Send OTP to existing phone number
    const { data, error } = await supabase.auth.signInWithOtp({
      phone: formattedPhone
    })

    if (error) {
      console.error('Supabase phone signin error:', error)
      
      if (error.message?.includes('not found') || error.message?.includes('No user found')) {
        return NextResponse.json(
          { error: 'No account found with this phone number. Please sign up first.' },
          { status: 404 }
        )
      }
      
      return NextResponse.json(
        { error: error.message || 'Failed to send verification code' },
        { status: 500 }
      )
    }

    console.log('Signin OTP sent to:', formattedPhone)

    return NextResponse.json({
      success: true,
      message: 'Verification code sent to your phone.',
      needsVerification: true
    })

  } catch (error) {
    console.error('Phone signin error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}