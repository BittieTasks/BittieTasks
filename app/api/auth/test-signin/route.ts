import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// For testing purposes - create a test user without email verification
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action } = body

    if (action === 'create_test_user') {
      // Create a test user account for immediate testing
      const testEmail = 'testuser@bittietasks.local'
      const testPassword = 'TestBittieUser2025!'
      
      const { data, error } = await supabase.auth.signUp({
        email: testEmail,
        password: testPassword,
        options: {
          data: {
            first_name: 'Test',
            last_name: 'User',
          },
          emailRedirectTo: undefined // Skip email verification
        }
      })

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 })
      }

      return NextResponse.json({
        success: true,
        message: 'Test user created successfully',
        credentials: {
          email: testEmail,
          password: testPassword
        },
        user: data.user
      })
    }

    if (action === 'signin_test_user') {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: 'testuser@bittietasks.local',
        password: 'TestBittieUser2025!',
      })

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 401 })
      }

      return NextResponse.json({
        success: true,
        user: data.user,
        session: data.session,
      })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Test signin error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}