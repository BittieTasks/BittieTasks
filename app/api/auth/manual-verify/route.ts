import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Admin client with service role key
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
    const { userId, email } = await request.json()

    if (!userId || !email) {
      return NextResponse.json(
        { error: 'User ID and email are required' },
        { status: 400 }
      )
    }

    const supabaseAdmin = getSupabaseAdmin()

    // Manually verify the user by updating their email_confirmed_at timestamp
    const { error } = await supabaseAdmin.auth.admin.updateUserById(
      userId,
      {
        email_confirm: true,
        user_metadata: {
          email_verified: true,
          email_confirmed_at: new Date().toISOString()
        }
      }
    )

    if (error) {
      console.error('Error manually verifying user:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    // Clean up any existing verification tokens for this user
    await supabaseAdmin
      .from('verification_tokens')
      .delete()
      .eq('user_id', userId)

    return NextResponse.json({
      success: true,
      message: `User ${email} has been manually verified`
    })
  } catch (error) {
    console.error('Manual verification error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}