import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') || '/dashboard'

  if (code) {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    try {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)
      
      if (error) {
        console.error('Error exchanging code for session:', error)
        return NextResponse.redirect(`${requestUrl.origin}/auth?error=verification_failed`)
      }

      if (data.user) {
        console.log('Email verification successful for user:', data.user.email)
        // Redirect to dashboard after successful email verification
        return NextResponse.redirect(`${requestUrl.origin}${next}`)
      }
    } catch (error) {
      console.error('Email verification callback error:', error)
      return NextResponse.redirect(`${requestUrl.origin}/auth?error=verification_error`)
    }
  }

  // No code present or verification failed
  return NextResponse.redirect(`${requestUrl.origin}/auth?error=no_code`)
}