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

// Regular client for general operations - only create when needed
function getSupabaseClient() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL is required')
  }
  if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    throw new Error('NEXT_PUBLIC_SUPABASE_ANON_KEY is required')
  }
  
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )
}

// Admin client with service role key for bypassing restrictions
function getSupabaseAdmin() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL is required')
  }
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is required')
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
    
    // For testing - create user with admin client and mark as verified immediately
    const supabaseAdmin = getSupabaseAdmin()
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
      return NextResponse.json(
        { error: error.message || 'Failed to create account' },
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