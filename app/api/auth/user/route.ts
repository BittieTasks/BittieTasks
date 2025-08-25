import { NextRequest, NextResponse } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'

export async function GET(request: NextRequest) {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          // Cannot set cookies in GET request
        },
        remove(name: string, options: CookieOptions) {
          // Cannot remove cookies in GET request
        },
      },
    }
  )

  try {
    // Get the current session and user using SSR cookies
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError) {
      console.error('Error getting session:', sessionError)
      return NextResponse.json({ error: 'Session error' }, { status: 401 })
    }

    if (!session || !session.user) {
      return NextResponse.json({ error: 'No authenticated user' }, { status: 401 })
    }

    const user = session.user

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