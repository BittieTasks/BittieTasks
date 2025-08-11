import { NextRequest, NextResponse } from 'next/server'
import { createServerClient, createServiceClient } from '../../../lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const supabase = createServiceClient()
    const { searchParams } = new URL(request.url)
    
    const category = searchParams.get('category')
    const taskType = searchParams.get('taskType')
    const search = searchParams.get('search')

    let query = supabase
      .from('tasks')
      .select(`
        id,
        title,
        description,
        payout,
        location,
        time_commitment,
        max_participants,
        current_participants,
        deadline,
        task_type,
        is_sponsored,
        sponsor_name,
        created_at,
        categories:category_id(id, name, color, icon),
        profiles:creator_id(id, first_name, last_name)
      `)
      .eq('status', 'open')
      .order('created_at', { ascending: false })

    if (category && category !== 'all') {
      // First get category ID, then filter tasks
      const { data: categoryData } = await supabase
        .from('categories')
        .select('id')
        .eq('name', category)
        .single()
      
      if (categoryData) {
        query = query.eq('category_id', categoryData.id)
      }
    }

    if (taskType && taskType !== 'all') {
      query = query.eq('task_type', taskType)
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`)
    }

    const { data: tasks, error } = await query

    if (error) {
      throw error
    }

    return NextResponse.json({ tasks })
  } catch (error: any) {
    console.error('Error fetching tasks:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tasks' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createServiceClient()
    
    // Get user from authentication header
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json({ error: 'Authorization required' }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const taskData = await request.json()

    // Validate required fields
    const { title, description, category_id, payout, location, max_participants = 1 } = taskData

    if (!title || !description || !category_id || !payout || !location) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Create task
    const { data: task, error } = await supabase
      .from('tasks')
      .insert({
        creator_id: user.id,
        category_id,
        title: title.trim(),
        description: description.trim(),
        task_type: taskData.task_type || 'shared',
        payout: parseFloat(payout),
        max_participants: parseInt(max_participants),
        current_participants: 0,
        location: location.trim(),
        time_commitment: taskData.time_commitment || null,
        deadline: taskData.deadline || null,
        requirements: taskData.requirements ? [taskData.requirements.trim()] : [],
        status: 'open'
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json({ task })
  } catch (error: any) {
    console.error('Error creating task:', error)
    return NextResponse.json(
      { error: 'Failed to create task' },
      { status: 500 }
    )
  }
}