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

    // Generate a magic link for auto-signin
    const { data: sessionData, error: sessionError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'magiclink',
      email: `${existingUser.id}@phone.local`, // Temporary email for session
      options: {
        redirectTo: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:5000'
      }
    })

    return NextResponse.json({
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

  } catch (error) {
    console.error('Phone signin error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}