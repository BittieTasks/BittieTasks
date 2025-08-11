import { NextRequest, NextResponse } from 'next/server'
import { createServerClient, createServiceClient } from '../../../../../lib/supabase'

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const supabaseAuth = createServerClient() 
    const supabaseDb = createServiceClient()
    const { id: taskId } = await context.params
    
    // Get user from authentication header
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json({ error: 'Authorization required' }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser(token)
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const { message } = await request.json()

    // Check if user already applied
    const { data: existingApplication } = await supabaseDb
      .from('task_participants')
      .select('id')
      .eq('task_id', taskId)
      .eq('user_id', user.id)
      .single()

    if (existingApplication) {
      return NextResponse.json(
        { error: 'You have already applied to this task' },
        { status: 400 }
      )
    }

    // Get task to check if it's still available
    const { data: task, error: taskError } = await supabaseDb
      .from('tasks')
      .select('max_participants, current_participants, creator_id')
      .eq('id', taskId)
      .single()

    if (taskError || !task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    if (task.creator_id === user.id) {
      return NextResponse.json(
        { error: 'You cannot apply to your own task' },
        { status: 400 }
      )
    }

    if (task.current_participants >= task.max_participants) {
      return NextResponse.json(
        { error: 'This task is already full' },
        { status: 400 }
      )
    }

    // Create application
    const { data: application, error } = await supabaseDb
      .from('task_participants')
      .insert({
        task_id: taskId,
        user_id: user.id,
        status: 'applied',
        application_message: message || null,
        applied_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    // Update task participant count
    await supabaseDb
      .from('tasks')
      .update({ 
        current_participants: task.current_participants + 1 
      })
      .eq('id', taskId)

    return NextResponse.json({ application })
  } catch (error: any) {
    console.error('Error applying to task:', error)
    return NextResponse.json(
      { error: 'Failed to apply to task' },
      { status: 500 }
    )
  }
}