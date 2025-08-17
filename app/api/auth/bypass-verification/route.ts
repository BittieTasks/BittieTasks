import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

// TEMPORARY: Development bypass for SendGrid email verification limitations
// This should be removed once SendGrid is properly configured

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()
    
    if (!email) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 })
    }

    const supabase = createServerClient(request)

    // Manually confirm the user's email in development
    const { data, error } = await supabase.auth.admin.updateUserById(
      email, // Using email as ID for lookup
      { email_confirm: true }
    )

    if (error) {
      console.error('Bypass verification error:', error)
      return NextResponse.json({ 
        error: 'Failed to bypass verification',
        details: error.message 
      }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true,
      message: 'Email verification bypassed for development',
      user: data 
    })

  } catch (error) {
    console.error('Bypass verification endpoint error:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}