import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    // Get authorization token from header
    const authHeader = request.headers.get('authorization') || ''
    const token = authHeader.replace('Bearer ', '')

    if (!token) {
      return NextResponse.json({ 
        user: null, 
        session: null, 
        isAuthenticated: false 
      }, { status: 200 })
    }

    // Create Supabase client and validate session
    const supabase = createServerClient(request)
    const { data: { user }, error } = await supabase.auth.getUser(token)
    
    if (error || !user) {
      console.log('Session validation failed:', error?.message)
      return NextResponse.json({ 
        user: null, 
        session: null, 
        isAuthenticated: false 
      }, { status: 200 })
    }

    // Return session information
    return NextResponse.json({ 
      user: {
        id: user.id,
        email: user.email,
        phone: user.phone,
        user_metadata: user.user_metadata || {},
        email_confirmed_at: user.email_confirmed_at,
        created_at: user.created_at
      },
      session: { 
        user_id: user.id,
        expires_at: null, // Will be handled by client-side session management
        access_token: token
      },
      isAuthenticated: true
    })

  } catch (error: any) {
    console.error('Session endpoint error:', error.message)
    return NextResponse.json({ 
      user: null, 
      session: null, 
      isAuthenticated: false 
    }, { status: 200 })
  }
}

// Handle session refresh
export async function POST(request: NextRequest) {
  try {
    const { refresh_token } = await request.json()
    
    if (!refresh_token) {
      return NextResponse.json({ error: 'Refresh token required' }, { status: 400 })
    }

    const supabase = createServerClient(request)
    const { data, error } = await supabase.auth.refreshSession({
      refresh_token
    })
    
    if (error || !data.session) {
      console.log('Token refresh failed:', error?.message)
      return NextResponse.json({ error: 'Invalid refresh token' }, { status: 401 })
    }

    return NextResponse.json({
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
      expires_at: data.session.expires_at,
      user: data.user
    })

  } catch (error: any) {
    console.error('Session refresh error:', error.message)
    return NextResponse.json({ error: 'Refresh failed' }, { status: 500 })
  }
}