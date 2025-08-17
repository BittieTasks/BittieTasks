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

    const body = await request.json()
    console.log('API: Creating task with data:', body)
    
    // Validate the task data with proper location fields
    const taskData = {
      ...body,
      creatorId: user.id, // Ensure creator is current user
      creator_id: user.id, // Supabase field name
      status: 'open',
      currentParticipants: 0,
      current_participants: 0,
      // Ensure location fields are properly mapped
      earning_potential: body.earningPotential || 0,
      max_participants: body.maxParticipants || 1,
      zip_code: body.zipCode,
      radius_miles: body.radiusMiles || 25,
    }

    // Use task data as is for now (schema validation will be added later)
    const validatedData = taskData
    console.log('API: Final task data for insertion:', validatedData)

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
      console.error('Task data that failed:', validatedData)
      return NextResponse.json({ 
        error: 'Failed to create task', 
        details: error.message,
        data: validatedData 
      }, { status: 500 })
    }

    return NextResponse.json(newTask, { status: 201 })
  } catch (error) {
    console.error('Error in POST /api/tasks:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}