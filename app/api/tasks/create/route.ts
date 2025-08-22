import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient(request)
    
    // Get the authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      title,
      description,
      category,
      earning_potential,
      location,
      city,
      state,
      zip_code,
      max_participants = 1,
      difficulty = 'medium',
      requirements,
      type = 'solo'
    } = body

    // Validate required fields
    if (!title || !description || !earning_potential) {
      return NextResponse.json({ 
        error: 'Title, description, and earning potential are required' 
      }, { status: 400 })
    }

    // Create the task
    const taskData = {
      id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title,
      description,
      category: category || 'solo',
      category_id: category || 'solo',
      earning_potential: parseFloat(earning_potential),
      location: location || 'Remote',
      city,
      state,
      zip_code,
      max_participants: parseInt(max_participants),
      current_participants: 0,
      difficulty,
      requirements,
      type,
      status: 'open',
      approval_status: 'approved', // Auto-approve for now
      created_by: user.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    const { data: task, error } = await supabase
      .from('tasks')
      .insert([taskData])
      .select()
      .single()

    if (error) {
      console.error('Task creation error:', error)
      return NextResponse.json({ 
        error: 'Failed to create task',
        details: error.message 
      }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      task,
      message: 'Task created successfully!' 
    })

  } catch (error) {
    console.error('Task creation error:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}