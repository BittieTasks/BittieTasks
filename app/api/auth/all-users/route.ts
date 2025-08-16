import { NextResponse } from 'next/server'
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

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const searchEmail = url.searchParams.get('email')
    
    const supabaseAdmin = getSupabaseAdmin()
    
    // Get all users from Supabase auth
    const { data: users, error } = await supabaseAdmin.auth.admin.listUsers()

    if (error) {
      console.error('Error fetching users:', error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    // If searching for specific email
    if (searchEmail) {
      const foundUser = users.users.find(user => 
        user.email?.toLowerCase() === searchEmail.toLowerCase()
      )
      
      if (foundUser) {
        return NextResponse.json({
          found: true,
          user: {
            id: foundUser.id,
            email: foundUser.email,
            created_at: foundUser.created_at,
            email_confirmed_at: foundUser.email_confirmed_at,
            last_sign_in_at: foundUser.last_sign_in_at,
            user_metadata: foundUser.user_metadata,
            verified: !!foundUser.email_confirmed_at
          }
        })
      } else {
        return NextResponse.json({
          found: false,
          message: `No user found with email: ${searchEmail}`
        })
      }
    }

    // Return all users summary
    const allUsers = users.users.map(user => ({
      id: user.id,
      email: user.email,
      created_at: user.created_at,
      email_confirmed_at: user.email_confirmed_at,
      verified: !!user.email_confirmed_at,
      user_metadata: user.user_metadata
    }))

    return NextResponse.json({
      totalUsers: users.users.length,
      verifiedUsers: allUsers.filter(u => u.verified).length,
      unverifiedUsers: allUsers.filter(u => !u.verified).length,
      users: allUsers
    })
  } catch (error) {
    console.error('Database error:', error)
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
  }
}