import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { simpleEmailVerification } from '@/lib/email-simple'

// Add CORS headers for better browser compatibility
function addCorsHeaders(response: NextResponse) {
  response.headers.set('Access-Control-Allow-Origin', '*')
  response.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type')
  return response
}

export async function OPTIONS(request: NextRequest) {
  return addCorsHeaders(new NextResponse(null, { status: 200 }))
}

// Standardized admin client function
function createSupabaseAdmin() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Missing required Supabase environment variables')
  }
  
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
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
    const body = await request.json()
    const { phoneNumber, password, firstName, lastName, email } = body

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    if (!firstName || !lastName) {
      return NextResponse.json(
        { error: 'First name and last name are required' },
        { status: 400 }
      )
    }

    // For email-first verification, skip phone verification requirement
    // Users can still provide phone for optional features later
    
    // Create user with admin client and mark as verified immediately
    const supabaseAdmin = createSupabaseAdmin()
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email: email,
      password,
      email_confirm: true, // Mark as verified immediately for testing
      user_metadata: {
        first_name: firstName,
        last_name: lastName,
        phone_number: phoneNumber || null,
        email_verified: true
      }
    })

    if (error) {
      console.error('Supabase signup error:', error)
      
      // Handle specific error cases for better UX
      let errorMessage = 'Failed to create account'
      if (error.message.includes('already registered') || error.message.includes('already exists')) {
        errorMessage = 'An account with this email already exists. Please sign in instead.'
      } else if (error.message) {
        errorMessage = error.message
      }
      
      return NextResponse.json(
        { error: errorMessage },
        { status: 400 }
      )
    }

    // Send custom verification email via SendGrid
    if (data.user && data.user.id) {
      console.log('Sending custom verification email for user:', data.user.id)
      const emailResult = await simpleEmailVerification.sendVerificationEmail(data.user.id, email)
      
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
      message: 'Account created successfully! You can now sign in.',
      needsVerification: false
    })
  } catch (error) {
    console.error('Sign up error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}