import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    
    const supabase = createServerClient(request)
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    let query = supabase
      .from('tasks')
      .select(`
        *,
        creator:users!tasks_creator_id_fkey(id, email, phone),
        category:categories(id, name)
      `)
      .eq('status', 'open')
      .order('created_at', { ascending: false })

    // Filter by type if specified
    if (type && type !== 'all') {
      query = query.eq('type', type)
    }

    const { data: tasks, error } = await query

    if (error) {
      console.error('Error fetching tasks:', error)
      return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 })
    }

    return NextResponse.json(tasks || [])
  } catch (error) {
    console.error('Error in GET /api/tasks:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient(request)
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const body = await request.json()
    
    // Validate the task data
    const taskData = {
      ...body,
      creatorId: user.id, // Ensure creator is current user
      status: 'open',
      currentParticipants: 0
    }

    // Use task data as is for now (schema validation will be added later)
    const validatedData = taskData

    // Insert the task
    const { data: newTask, error } = await supabase
      .from('tasks')
      .insert(validatedData)
      .select(`
        *,
        creator:users!tasks_creator_id_fkey(id, email, phone),
        category:categories(id, name)
      `)
      .single()

    if (error) {
      console.error('Error creating task:', error)
      return NextResponse.json({ error: 'Failed to create task' }, { status: 500 })
    }

    return NextResponse.json(newTask, { status: 201 })
  } catch (error) {
    console.error('Error in POST /api/tasks:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}