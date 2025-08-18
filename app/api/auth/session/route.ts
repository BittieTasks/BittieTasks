import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient(request)
    
    // Get current user session
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error || !user) {
      return NextResponse.json({ user: null, session: null }, { status: 200 })
    }

    return NextResponse.json({ 
      user: {
        id: user.id,
        email: user.email,
        phone: user.phone,
        user_metadata: user.user_metadata
      },
      session: { user_id: user.id }
    })
  } catch (error) {
    console.error('Session endpoint error:', error)
    return NextResponse.json({ user: null, session: null }, { status: 200 })
  }
}