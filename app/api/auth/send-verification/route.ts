import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { simpleEmailVerification } from '@/lib/email-simple'

// Create admin client
function createSupabaseAdmin() {
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
    const { email, userId } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email address is required' },
        { status: 400 }
      )
    }

    console.log('Looking up user for email:', email)
    
    const supabase = createSupabaseAdmin()
    
    // Find user by email
    const { data: users, error: userError } = await supabase.auth.admin.listUsers()
    
    if (userError) {
      console.error('Error fetching users:', userError)
      return NextResponse.json(
        { error: 'Failed to lookup user' },
        { status: 500 }
      )
    }

    // Use provided userId or find by email
    let user
    if (userId) {
      user = users.users.find(u => u.id === userId)
    } else {
      user = users.users.find(u => u.email === email)
    }
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    console.log('Found user:', user.id, 'Email confirmed:', user.email_confirmed_at)
    
    // Check if already verified
    if (user.email_confirmed_at) {
      return NextResponse.json({
        success: true,
        message: 'Email is already verified',
        status: 'already_verified'
      })
    }

    // Send verification email
    const result = await simpleEmailVerification.sendVerificationEmail(user.id, email)

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: `Verification email sent to ${email}`,
        status: 'email_sent'
      })
    } else {
      return NextResponse.json(
        { error: result.error || 'Failed to send verification email' },
        { status: 500 }
      )
    }

  } catch (error: any) {
    console.error('Send verification email error:', error)
    return NextResponse.json(
      { error: 'Internal server error: ' + error.message },
      { status: 500 }
    )
  }
}