import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Create admin client for user record creation
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

    // Normalize phone number to E.164 format
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
      console.log('Using development bypass for phone:', formattedPhone)
      
      // Create admin client and create user directly
      const supabaseAdmin = createSupabaseAdmin()
      const tempPassword = 'dev-bypass-password'
      
      const { data: adminData, error: adminError } = await supabaseAdmin.auth.admin.createUser({
        phone: formattedPhone,
        password: tempPassword,
        phone_confirm: true, // Bypass verification for development
        user_metadata: {
          first_name: firstName,
          last_name: lastName
        }
      })
      
      if (adminError && !adminError.message?.includes('already been taken')) {
        console.error('Development bypass error:', adminError)
        return NextResponse.json(
          { error: adminError.message || 'Development bypass failed' },
          { status: 500 }
        )
      }

      // Create user record in our users table
      const userId = adminData?.user?.id || 'dev-user-id'
      const { error: dbError } = await supabaseAdmin
        .from('users')
        .upsert({
          id: userId,
          phone_number: formattedPhone,
          first_name: firstName,
          last_name: lastName,
          email_verified: false,
          phone_verified: true, // Mark as verified for development
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'id'
        })

      if (dbError) {
        console.error('Failed to create user record:', dbError)
      }

      return NextResponse.json({
        success: true,
        needsVerification: true, // Still show verification step in UI
        isDevelopmentBypass: true,
        userId: userId,
        message: 'Development account created. Use code 123456 to verify.'
      })
    }

    // Use Supabase client for production phone signup
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    // Generate a temporary password (required by Supabase but user won't use it)
    const tempPassword = Math.random().toString(36).slice(-12) + Math.random().toString(36).slice(-12)

    // Sign up with phone using Supabase native auth
    const { data, error } = await supabase.auth.signUp({
      phone: formattedPhone,
      password: tempPassword,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName
        }
      }
    })

    if (error) {
      console.error('Supabase phone signup error:', error)
      
      if (error.message?.includes('already registered') || error.message?.includes('already been taken')) {
        return NextResponse.json(
          { error: 'An account with this phone number already exists. Please sign in instead.' },
          { status: 400 }
        )
      }
      
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
    console.log('SMS verification sent to:', formattedPhone)

    // Create user record in our users table using admin client
    const supabaseAdmin = createSupabaseAdmin()
    const { error: dbError } = await supabaseAdmin
      .from('users')
      .insert({
        id: data.user.id,
        phone_number: formattedPhone,
        first_name: firstName,
        last_name: lastName,
        email_verified: false,
        phone_verified: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })

    if (dbError) {
      console.error('Failed to create user record:', dbError)
      // Continue anyway - auth user exists
    }

    return NextResponse.json({
      success: true,
      needsVerification: true,
      userId: data.user.id,
      message: 'Account created successfully. Verification code sent to your phone.'
    })

  } catch (error) {
    console.error('Phone signup error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}