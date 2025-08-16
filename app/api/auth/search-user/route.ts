import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

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
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email address is required' },
        { status: 400 }
      )
    }

    console.log('Searching for user with email:', email)
    
    const supabase = createSupabaseAdmin()
    
    // Search in auth.users
    const { data: users, error: userError } = await supabase.auth.admin.listUsers()
    
    if (userError) {
      console.error('Error fetching users:', userError)
      return NextResponse.json(
        { error: 'Failed to search users' },
        { status: 500 }
      )
    }

    const user = users.users.find(u => u.email?.toLowerCase() === email.toLowerCase())
    
    if (user) {
      console.log('Found user:', user.id, 'Created:', user.created_at, 'Verified:', user.email_confirmed_at)
      
      // Check for verification tokens
      const { data: tokens } = await supabase
        .from('verification_tokens')
        .select('*')
        .eq('email', email)
        .order('created_at', { ascending: false })

      return NextResponse.json({
        found: true,
        user: {
          id: user.id,
          email: user.email,
          created_at: user.created_at,
          email_confirmed_at: user.email_confirmed_at,
          is_verified: !!user.email_confirmed_at,
          last_sign_in: user.last_sign_in_at
        },
        verification_tokens: tokens || [],
        total_tokens: tokens?.length || 0
      })
    } else {
      console.log('No user found with email:', email)
      
      // Still check for any orphaned tokens
      const { data: tokens } = await supabase
        .from('verification_tokens')
        .select('*')
        .eq('email', email)

      return NextResponse.json({
        found: false,
        message: 'No user found with that email address',
        verification_tokens: tokens || [],
        total_tokens: tokens?.length || 0
      })
    }

  } catch (error: any) {
    console.error('Search user error:', error)
    return NextResponse.json(
      { error: 'Internal server error: ' + error.message },
      { status: 500 }
    )
  }
}