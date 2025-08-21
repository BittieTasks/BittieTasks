import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    // Get authorization token from header
    const authHeader = request.headers.get('authorization') || ''
    const token = authHeader.replace('Bearer ', '')

    if (!token) {
      console.log('API /auth/user: No authorization token provided')
      return NextResponse.json({ error: 'No authorization token' }, { status: 401 })
    }

    // Create Supabase client with the token
    const supabase = createServerClient(request)
    
    // Get user using the provided token
    const { data: { user }, error } = await supabase.auth.getUser(token)
    
    if (error || !user) {
      console.log('API /auth/user: Invalid token or user not found:', error?.message)
      return NextResponse.json({ error: 'Invalid authentication' }, { status: 401 })
    }

    // Return comprehensive user data
    const userData = {
      id: user.id,
      email: user.email,
      phone: user.phone,
      email_confirmed_at: user.email_confirmed_at,
      phone_confirmed_at: user.phone_confirmed_at,
      user_metadata: user.user_metadata || {},
      app_metadata: user.app_metadata || {},
      created_at: user.created_at,
      last_sign_in_at: user.last_sign_in_at,
      // Add additional fields for the application
      isEmailVerified: !!user.email_confirmed_at,
      isPhoneVerified: !!user.phone_confirmed_at,
      firstName: user.user_metadata?.first_name || '',
      lastName: user.user_metadata?.last_name || ''
    }

    console.log('API /auth/user: User data fetched successfully:', user.email)
    return NextResponse.json(userData)

  } catch (error: any) {
    console.error('Error in /api/auth/user:', error.message)
    return NextResponse.json(
      { error: 'Failed to fetch user data' },
      { status: 500 }
    )
  }
}