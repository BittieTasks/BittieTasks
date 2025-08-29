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

    const supabaseAdmin = createSupabaseAdmin()
    
    // Find user by phone number - check multiple formats
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers()
    console.log('Looking for phone:', formattedPhone)
    console.log('All users phones:', existingUsers.users.map(u => ({ id: u.id, phone: u.phone })))
    
    const existingUser = existingUsers.users.find(u => {
      const userPhone = u.phone
      if (!userPhone) return false
      
      // Try exact match first
      if (userPhone === formattedPhone) return true
      
      // Try normalized comparison
      const normalizedUserPhone = userPhone.replace(/\D/g, '')
      const normalizedSearchPhone = formattedPhone.replace(/\D/g, '')
      
      return normalizedUserPhone === normalizedSearchPhone
    })
    
    if (!existingUser) {
      return NextResponse.json(
        { error: 'No account found with this phone number. Please sign up first.' },
        { status: 404 }
      )
    }

    console.log('User found, signin successful for:', formattedPhone)

    // Create a session by signing the user in directly
    const tempPassword = Math.random().toString(36).slice(-12) + Math.random().toString(36).slice(-12)
    
    // Update user with a temp password for signin
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      existingUser.id,
      { password: tempPassword }
    )
    
    if (updateError) {
      console.error('Failed to update user password:', updateError)
      return NextResponse.json(
        { error: 'Failed to prepare signin' },
        { status: 500 }
      )
    }

    // Sign in with the temp password to get real tokens
    const { data: sessionData, error: sessionError } = await supabaseAdmin.auth.signInWithPassword({
      phone: formattedPhone,
      password: tempPassword
    })

    if (sessionError || !sessionData.session) {
      console.error('Session creation error:', sessionError)
      return NextResponse.json(
        { error: 'Failed to create session' },
        { status: 500 }
      )
    }

    const accessToken = sessionData.session.access_token
    const refreshToken = sessionData.session.refresh_token

    if (!accessToken || !refreshToken) {
      console.error('Missing tokens in session')
      return NextResponse.json(
        { error: 'Failed to create session tokens' },
        { status: 500 }
      )
    }

    // Create the response with session cookies
    const response = NextResponse.json({
      success: true,
      verified: true,
      userId: existingUser.id,
      message: 'Signed in successfully!',
      user: {
        id: existingUser.id,
        phone: existingUser.phone,
        user_metadata: existingUser.user_metadata
      }
    })

    // Set session cookies
    response.cookies.set('sb-access-token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/'
    })

    response.cookies.set('sb-refresh-token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/'
    })

    return response

  } catch (error) {
    console.error('Phone signin error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}