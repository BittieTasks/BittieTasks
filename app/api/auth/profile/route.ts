import { NextRequest, NextResponse } from 'next/server'
import { createServerClient, createServiceClient } from '../../../../lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const supabaseClient = createServerClient()
    
    // Get current user using Supabase auth
    const { data: { user }, error } = await supabaseClient.auth.getUser()
    if (error || !user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    // Get user data from request
    const userData = await request.json()
    
    // Create or update user profile in Supabase
    const profileData = {
      id: user.id,
      email: userData.email || user.email,
      first_name: userData.firstName || '',
      last_name: userData.lastName || '',
      verified: user.email_confirmed_at ? true : false,
      subscription_tier: 'free',
      total_earnings: '0.00',
      tasks_completed: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    // Use the service role client for database operations
    const serviceSupabase = createServiceClient()
    const { data: profile, error: profileError } = await serviceSupabase
      .from('profiles')
      .upsert(profileData, { onConflict: 'id' })
      .select()
      .single()
    
    if (profileError) {
      console.error('Profile creation error:', profileError)
      return NextResponse.json({ error: 'Failed to create profile' }, { status: 500 })
    }
      
    return NextResponse.json({ user: profile })
  } catch (error) {
    console.error('Error managing user profile:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabaseClient = createServerClient()
    
    // Get current user using Supabase auth
    const { data: { user }, error } = await supabaseClient.auth.getUser()
    if (error || !user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    // Get user profile from Supabase using service client
    const serviceSupabase = createServiceClient()
    const { data: profile, error: profileError } = await serviceSupabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()
    
    if (profileError || !profile) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 })
    }

    return NextResponse.json({ user: profile })
  } catch (error) {
    console.error('Error fetching user profile:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}