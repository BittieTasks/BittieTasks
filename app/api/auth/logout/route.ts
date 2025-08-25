import { NextRequest, NextResponse } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'

export async function POST(request: NextRequest) {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          // We'll handle cookies in the response
        },
        remove(name: string, options: CookieOptions) {
          // We'll handle cookie removal in the response
        },
      },
    }
  )

  try {
    // Sign out from Supabase
    const { error } = await supabase.auth.signOut()
    
    if (error) {
      console.error('Sign out error:', error)
    }

    // Create response and clear session cookies
    const response = NextResponse.json({ message: 'Signed out successfully' })

    // Clear the session cookies
    response.cookies.set({
      name: 'sb-access-token',
      value: '',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/'
    })

    response.cookies.set({
      name: 'sb-refresh-token',
      value: '',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/'
    })

    return response
    
  } catch (error) {
    console.error('Error in /api/auth/logout:', error)
    
    // Create error response but still clear cookies
    const response = NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    
    response.cookies.set({
      name: 'sb-access-token',
      value: '',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/'
    })

    response.cookies.set({
      name: 'sb-refresh-token',
      value: '',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/'
    })

    return response
  }
}