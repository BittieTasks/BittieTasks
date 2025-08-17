import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient(request)
    
    // Get user from session
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error) {
      console.log('Auth error:', error.message)
      return NextResponse.json(null, { status: 401 })
    }

    if (!user) {
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