import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { emailVerification } from '@/lib/email-verification'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
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

    // Create user with email confirmation disabled (we'll handle it via SendGrid)
    // Note: Need to disable email confirmation in Supabase dashboard for this to work properly
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
        }
      }
    })

    if (error) {
      console.error('Supabase auth error:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    // Send custom verification email via SendGrid if user was created
    if (data.user && data.user.id) {
      console.log('Sending custom verification email for user:', data.user.id)
      const emailResult = await emailVerification.sendVerificationEmail(data.user.id, email)
      
      if (!emailResult.success) {
        console.error('Failed to send verification email:', emailResult.error)
        // Don't fail the signup, just log the error
      }
    }

    return NextResponse.json({
      success: true,
      user: data.user,
      session: data.session,
      message: 'Account created successfully! Please check your email for verification.',
    })
  } catch (error) {
    console.error('Sign up error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}