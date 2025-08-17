import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient(request)
    
    // Get the authorization header
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authorization header required' }, { status: 401 })
    }
    
    // Set the session from the token
    const token = authHeader.split(' ')[1]
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) {
      console.error('Auth error:', authError)
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 })
    }

    // Get all tasks created by the current user
    const { data: createdTasks, error } = await supabase
      .from('tasks')
      .select(`
        *,
        creator:users!tasks_creator_id_fkey(id, email, phone),
        category:categories(id, name)
      `)
      .eq('creator_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching created tasks:', error)
      return NextResponse.json({ error: 'Failed to fetch created tasks' }, { status: 500 })
    }

    return NextResponse.json(createdTasks || [])
  } catch (error) {
    console.error('Error in GET /api/tasks/created:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}