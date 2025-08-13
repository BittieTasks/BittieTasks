import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Admin client with service role key
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

export async function GET() {
  try {
    // Get all users from Supabase auth
    const { data: users, error } = await supabaseAdmin.auth.admin.listUsers()

    if (error) {
      console.error('Error fetching users:', error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    // Filter for unconfirmed users (no email_confirmed_at)
    const unconfirmedUsers = users.users.filter(user => 
      !user.email_confirmed_at && user.email
    )

    // Also check verification tokens table
    const { data: tokens, error: tokenError } = await supabaseAdmin
      .from('verification_tokens')
      .select('*')
      .order('created_at', { ascending: false })

    const response = {
      unconfirmedUsers: unconfirmedUsers.map(user => ({
        id: user.id,
        email: user.email,
        created_at: user.created_at,
        last_sign_in_at: user.last_sign_in_at,
        user_metadata: user.user_metadata
      })),
      verificationTokens: tokens || [],
      totalUsers: users.users.length,
      unconfirmedCount: unconfirmedUsers.length
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Database error:', error)
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { userIds } = await request.json()

    if (!userIds || !Array.isArray(userIds)) {
      return NextResponse.json({ error: 'userIds array required' }, { status: 400 })
    }

    const results = []

    for (const userId of userIds) {
      try {
        // Delete user from Supabase auth
        const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userId)
        
        if (deleteError) {
          console.error(`Error deleting user ${userId}:`, deleteError)
          results.push({ userId, success: false, error: deleteError.message })
        } else {
          // Also clean up any verification tokens
          await supabaseAdmin
            .from('verification_tokens')
            .delete()
            .eq('user_id', userId)
          
          results.push({ userId, success: true })
        }
      } catch (error) {
        console.error(`Error processing user ${userId}:`, error)
        results.push({ userId, success: false, error: 'Processing failed' })
      }
    }

    return NextResponse.json({ 
      results,
      message: `Processed ${userIds.length} user deletion requests`
    })
  } catch (error) {
    console.error('Delete operation error:', error)
    return NextResponse.json({ error: 'Failed to delete users' }, { status: 500 })
  }
}