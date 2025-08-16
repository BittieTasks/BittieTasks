import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

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
    const { userId } = await request.json()
    const supabaseAdmin = getSupabaseAdmin()

    // Get user by ID
    const { data: userData, error: userError } = await supabaseAdmin.auth.admin.getUserById(userId)
    
    if (userError) {
      console.error('Error getting user by ID:', userError)
      return NextResponse.json({
        found: false,
        error: userError.message,
        userId: userId
      })
    }

    // Also check if user is in the general user list
    const { data: allUsers } = await supabaseAdmin.auth.admin.listUsers()
    const userInList = allUsers.users.find(u => u.id === userId)

    return NextResponse.json({
      found: !!userData.user,
      user: userData.user,
      userInList: !!userInList,
      debug: {
        userId: userId,
        userExists: !!userData.user,
        email: userData.user?.email,
        created_at: userData.user?.created_at,
        email_confirmed_at: userData.user?.email_confirmed_at
      }
    })

  } catch (error: any) {
    console.error('Debug user error:', error)
    return NextResponse.json(
      { error: 'Internal server error: ' + error.message },
      { status: 500 }
    )
  }
}