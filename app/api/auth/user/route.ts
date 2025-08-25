import { NextRequest, NextResponse } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'

export async function GET(request: NextRequest) {
  try {
    // Check for manual session cookies first
    const accessToken = request.cookies.get('sb-access-token')?.value
    const refreshToken = request.cookies.get('sb-refresh-token')?.value

    if (!accessToken) {
      return NextResponse.json({ error: 'No authenticated user' }, { status: 401 })
    }

    // Create Supabase client with the stored session tokens
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

    // Set the session manually using the stored tokens
    const { data, error } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken || ''
    })

    if (error || !data.session?.user) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 })
    }

    const user = data.session.user

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

    return NextResponse.json(userData)

  } catch (error: any) {
    console.error('Error in /api/auth/user:', error.message)
    return NextResponse.json(
      { error: 'Failed to fetch user data' },
      { status: 500 }
    )
  }
}