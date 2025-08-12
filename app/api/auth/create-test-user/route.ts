import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(request: NextRequest) {
  try {
    // Create a test user that bypasses email verification
    const testEmail = 'test@bittietasks.com'
    const testPassword = 'TestUser2025@Strong!'
    
    // Try to sign up (this will work if user doesn't exist)
    const { data, error } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          firstName: 'Test',
          lastName: 'User',
        },
        emailRedirectTo: undefined // Don't send email
      }
    })

    if (error && !error.message.includes('User already registered')) {
      console.error('Test user creation error:', error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    // Now try to sign in immediately
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword,
    })

    if (signInError) {
      return NextResponse.json({
        message: 'Test user created but sign-in failed. This is expected during development.',
        testCredentials: {
          email: testEmail,
          password: testPassword
        },
        error: signInError.message
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Test user created and signed in successfully!',
      testCredentials: {
        email: testEmail,
        password: testPassword
      },
      user: signInData.user
    })

  } catch (error) {
    console.error('Test user creation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}