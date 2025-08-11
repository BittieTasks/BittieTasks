import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '../../../../lib/supabase'
import { supabase } from '../../../../lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const supabaseClient = createServerClient()
    
    // Get the authorization header
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')
    
    // Verify the JWT token
    const { data: { user }, error } = await supabaseClient.auth.getUser(token)
    if (error || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
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

    // Use the server client for database operations
    const serverSupabase = createServerClient()
    const { data: profile, error: profileError } = await serverSupabase
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
    
    // Get the authorization header
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')
    
    // Verify the JWT token
    const { data: { user }, error } = await supabaseClient.auth.getUser(token)
    if (error || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // Get user profile from Supabase  
    const serverSupabase = createServerClient()
    const { data: profile, error: profileError } = await serverSupabase
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