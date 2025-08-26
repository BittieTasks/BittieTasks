import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { phoneVerificationService } from '@/lib/phone-verification'

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
    const { phoneNumber, firstName, lastName, password } = body

    if (!phoneNumber || !firstName || !lastName) {
      return NextResponse.json(
        { error: 'Phone number, first name, and last name are required' },
        { status: 400 }
      )
    }

    if (!password || password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
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

    // Check if phone number already exists
    const supabaseAdmin = createSupabaseAdmin()
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers()
    const existingUser = existingUsers.users.find(u => u.phone === formattedPhone)
    
    if (existingUser) {
      return NextResponse.json(
        { error: 'An account with this phone number already exists. Please sign in instead.' },
        { status: 400 }
      )
    }

    // Create user with phone number
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      phone: formattedPhone,
      password,
      phone_confirm: false, // Require phone verification
      user_metadata: {
        first_name: firstName,
        last_name: lastName,
        phone_verified: false
      }
    })

    if (error) {
      console.error('Supabase phone signup error:', error)
      
      let errorMessage = 'Failed to create account'
      if (error.message.includes('already registered') || error.message.includes('already exists')) {
        errorMessage = 'An account with this phone number already exists. Please sign in instead.'
      } else if (error.message) {
        errorMessage = error.message
      }
      
      return NextResponse.json(
        { error: errorMessage },
        { status: 400 }
      )
    }

    // Send verification code via SMS
    if (data.user && data.user.id) {
      console.log('Sending verification code for user:', data.user.id)
      const smsResult = await phoneVerificationService.sendVerificationCode(formattedPhone)
      
      if (!smsResult.success) {
        console.error('Failed to send verification code:', smsResult.error)
        // Don't fail the signup since user is created, just log the SMS error
        return NextResponse.json({
          success: true,
          user: data.user,
          message: 'Account created successfully! Verification code sending failed - please try manual verification.',
          needsVerification: true,
          smsError: smsResult.error
        })
      } else {
        console.log('Verification code sent successfully via SMS')
      }
    }

    return NextResponse.json({
      success: true,
      user: data.user,
      message: 'Account created successfully! Please check your messages for a verification code.',
      needsVerification: true
    })

  } catch (error) {
    console.error('Phone signup error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}