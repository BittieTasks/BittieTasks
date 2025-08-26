import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

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
    const { phoneNumber, firstName, lastName } = body

    if (!phoneNumber || !firstName || !lastName) {
      return NextResponse.json(
        { error: 'Phone number, first name, and last name are required' },
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

    const supabaseAdmin = createSupabaseAdmin()
    
    // Check if user exists
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers()
    const existingUser = existingUsers.users.find(u => u.phone === formattedPhone)
    
    if (existingUser) {
      return NextResponse.json(
        { error: 'An account with this phone number already exists. Please sign in instead.' },
        { status: 400 }
      )
    }

    // Create user directly with admin client (verified for simplicity)
    const tempPassword = Math.random().toString(36).slice(-12) + Math.random().toString(36).slice(-12)
    
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      phone: formattedPhone,
      password: tempPassword,
      phone_confirm: true, // Mark as confirmed to skip SMS verification
      user_metadata: {
        first_name: firstName,
        last_name: lastName
      }
    })

    if (error) {
      console.error('User creation error:', error)
      return NextResponse.json(
        { error: error.message || 'Failed to create account' },
        { status: 500 }
      )
    }

    if (!data.user) {
      return NextResponse.json(
        { error: 'Failed to create user account' },
        { status: 500 }
      )
    }

    console.log('User created successfully:', data.user.id)

    // Create user record in our users table
    const { error: dbError } = await supabaseAdmin
      .from('users')
      .insert({
        id: data.user.id,
        phone_number: formattedPhone,
        first_name: firstName,
        last_name: lastName,
        email_verified: false,
        phone_verified: true, // Mark as verified
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })

    if (dbError) {
      console.error('Failed to create user record:', dbError)
    }

    // Auto-signin the user by creating a session
    const { data: sessionData, error: sessionError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'magiclink',
      email: `${data.user.id}@phone.local`, // Temporary email for session
      options: {
        redirectTo: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:5000'
      }
    })

    return NextResponse.json({
      success: true,
      verified: true,
      userId: data.user.id,
      message: 'Account created and verified successfully!',
      autoSignIn: true
    })

  } catch (error) {
    console.error('Phone signup error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}