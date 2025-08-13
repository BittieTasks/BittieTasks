import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { emailVerification } from '@/lib/email-verification'

// Regular client for general operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Admin client with service role key for bypassing restrictions
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, firstName, lastName } = body

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Create user using admin client to bypass email confirmation
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Mark as confirmed so user can sign in immediately
      user_metadata: {
        first_name: firstName,
        last_name: lastName,
      }
    })

    if (error) {
      console.error('Supabase admin auth error:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    // Send custom verification email via SendGrid
    if (data.user && data.user.id) {
      console.log('Sending custom verification email for user:', data.user.id)
      const emailResult = await emailVerification.sendVerificationEmail(data.user.id, email)
      
      if (!emailResult.success) {
        console.error('Failed to send verification email:', emailResult.error)
        // Don't fail the signup since user is created, just log the email error
      } else {
        console.log('Custom verification email sent successfully via SendGrid')
      }
    }

    return NextResponse.json({
      success: true,
      user: data.user,
      message: 'Account created successfully! Please check your email for verification.',
      needsVerification: true
    })
  } catch (error) {
    console.error('Sign up error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}