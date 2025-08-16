import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { simpleEmailVerification } from '@/lib/email-simple'

// Admin client with service role key for bypassing restrictions
function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )
}

export async function POST(request: NextRequest) {
  try {
    const { email, firstName, lastName, password } = await request.json()

    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json(
        { error: 'Email, password, first name, and last name are required' },
        { status: 400 }
      )
    }

    console.log('Manual signup attempt for:', email)
    
    const supabaseAdmin = getSupabaseAdmin()

    // Check if user already exists
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers()
    const existingUser = existingUsers.users.find(u => u.email?.toLowerCase() === email.toLowerCase())
    
    if (existingUser) {
      console.log('User already exists:', existingUser.id)
      
      // If user exists but not verified, resend verification
      if (!existingUser.email_confirmed_at) {
        console.log('User exists but not verified, sending verification email')
        const emailResult = await simpleEmailVerification.sendVerificationEmail(existingUser.id, email)
        
        if (emailResult.success) {
          return NextResponse.json({
            success: true,
            message: 'Account exists but was not verified. Verification email sent.',
            status: 'verification_resent'
          })
        } else {
          return NextResponse.json(
            { error: 'Failed to send verification email: ' + emailResult.error },
            { status: 500 }
          )
        }
      } else {
        return NextResponse.json(
          { error: 'Account already exists and is verified. Please sign in instead.' },
          { status: 409 }
        )
      }
    }

    // Create new user account
    console.log('Creating new user account')
    const { data: newUser, error: signUpError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: false, // Require email verification
      user_metadata: {
        first_name: firstName,
        last_name: lastName,
        full_name: `${firstName} ${lastName}`,
        signup_completed: true
      }
    })

    if (signUpError) {
      console.error('Signup error:', signUpError)
      return NextResponse.json(
        { error: 'Failed to create account: ' + signUpError.message },
        { status: 400 }
      )
    }

    if (!newUser.user) {
      return NextResponse.json(
        { error: 'Failed to create user account' },
        { status: 500 }
      )
    }

    console.log('User created successfully:', newUser.user.id)

    // Send verification email
    console.log('Sending verification email')
    const emailResult = await simpleEmailVerification.sendVerificationEmail(newUser.user.id, email)

    if (emailResult.success) {
      return NextResponse.json({
        success: true,
        message: 'Account created successfully! Please check your email for verification.',
        userId: newUser.user.id,
        status: 'account_created'
      })
    } else {
      console.error('Email verification failed:', emailResult.error)
      return NextResponse.json(
        { 
          error: 'Account created but failed to send verification email: ' + emailResult.error,
          userId: newUser.user.id,
          status: 'account_created_email_failed'
        },
        { status: 500 }
      )
    }

  } catch (error: any) {
    console.error('Manual signup error:', error)
    return NextResponse.json(
      { error: 'Internal server error: ' + error.message },
      { status: 500 }
    )
  }
}