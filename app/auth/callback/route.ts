import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') || '/dashboard'

  if (code) {
    const supabase = createServerClient(request)

    try {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)
      
      if (error) {
        console.error('Error exchanging code for session:', error)
        return NextResponse.redirect(`${requestUrl.origin}/auth?error=verification_failed`)
      }

      if (data.user && data.session) {
        console.log('Email verification successful for user:', data.user.email)
        
        // Check for intended destination or use default redirect
        const intendedUrl = request.cookies.get('intended_url')?.value
        const destination = intendedUrl || next || '/dashboard'
        
        // Create a response that will set the session cookies
        const response = NextResponse.redirect(`${requestUrl.origin}${destination}`)
        
        // Clear the intended URL cookie if it exists
        if (intendedUrl) {
          response.cookies.delete('intended_url')
        }
        
        // Set session cookies manually for better persistence
        response.cookies.set('sb-access-token', data.session.access_token, {
          path: '/',
          maxAge: data.session.expires_in,
          sameSite: 'lax',
          secure: process.env.NODE_ENV === 'production',
        })
        
        response.cookies.set('sb-refresh-token', data.session.refresh_token, {
          path: '/',
          maxAge: 30 * 24 * 60 * 60, // 30 days
          sameSite: 'lax', 
          secure: process.env.NODE_ENV === 'production',
        })

        console.log('Set session cookies for user:', data.user.email)
        return response
      }
    } catch (error) {
      console.error('Email verification callback error:', error)
      return NextResponse.redirect(`${requestUrl.origin}/auth?error=verification_error`)
    }
  }

  // No code present or verification failed
  return NextResponse.redirect(`${requestUrl.origin}/auth?error=no_code`)
}