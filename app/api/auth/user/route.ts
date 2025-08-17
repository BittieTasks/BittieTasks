import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient(request)
    
    // Try multiple approaches to get the user
    let user = null
    let session = null
    
    // First try to get the session
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
    if (!sessionError && sessionData.session) {
      user = sessionData.session.user
      session = sessionData.session
      console.log('User found via session:', user.email)
    }
    
    // If no session, try to get user directly
    if (!user) {
      const { data: userData, error: userError } = await supabase.auth.getUser()
      if (!userError && userData.user) {
        user = userData.user
        console.log('User found via getUser:', user.email)
      } else if (userError) {
        console.log('Auth error:', userError.message)
        return NextResponse.json(null, { status: 401 })
      }
    }

    if (!user) {
      console.log('No user found in session or auth')
      return NextResponse.json(null, { status: 401 })
    }

    console.log('User fetched successfully:', user.email)
    return NextResponse.json({
      id: user.id,
      email: user.email,
      phone: user.phone,
      email_confirmed_at: user.email_confirmed_at,
      phone_confirmed_at: user.phone_confirmed_at,
      user_metadata: user.user_metadata,
      created_at: user.created_at
    })

  } catch (error) {
    console.error('Error in /api/auth/user:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    )
  }
}