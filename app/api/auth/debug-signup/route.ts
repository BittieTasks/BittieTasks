import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, firstName, lastName } = body

    console.log('Debug signup attempt:', { email, firstName, lastName })

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    // Check if user already exists first
    const { data: existingUsers, error: listError } = await supabase.auth.admin.listUsers()
    if (!listError) {
      const existingUser = existingUsers.users.find(u => u.email === email)
      if (existingUser) {
        return NextResponse.json({
          error: 'User already exists',
          user_id: existingUser.id,
          email_confirmed: existingUser.email_confirmed_at ? true : false,
          created_at: existingUser.created_at
        })
      }
    }

    // Attempt signup with minimal options
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

    console.log('Signup result:', { 
      user: data.user ? 'Created' : 'Not created',
      session: data.session ? 'Active' : 'None',
      error: error ? error.message : 'None'
    })

    if (error) {
      return NextResponse.json({
        error: error.message,
        error_code: error.status,
        details: {
          message: error.message,
          status: error.status
        }
      }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      user_created: !!data.user,
      session_created: !!data.session,
      user_id: data.user?.id,
      email_confirmed: data.user?.email_confirmed_at ? true : false,
      requires_verification: !data.session && data.user
    })

  } catch (error) {
    console.error('Debug signup error:', error)
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}