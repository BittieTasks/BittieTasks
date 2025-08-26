import { NextRequest, NextResponse } from 'next/server'
import { createServerClient, createServiceClient } from '../../../../../lib/supabase'

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // Get authenticated user from Supabase with request context
    const supabase = createServerClient(request)
    const supabaseDb = createServiceClient()
    const { id: taskId } = await context.params
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    console.log('Task [id] apply auth check:', {
      hasUser: !!user,
      userEmail: user?.email,
      authError: authError?.message,
      taskId
    })
    
    if (authError || !user) {
      console.error('POST /api/tasks/[id]/apply auth error:', authError?.message)
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const { applicationResponses } = await request.json()

    // Check if user already applied
    const { data: existingApplication } = await supabaseDb
      .from('task_participants')
      .select('id, status')
      .eq('task_id', taskId)
      .eq('user_id', user.id)
      .single()

    if (existingApplication) {
      return NextResponse.json(
        { 
          error: 'Already applied',
          message: `You have already applied to this task (Status: ${existingApplication.status})`
        },
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
        application_responses: applicationResponses || null,
        joined_at: new Date().toISOString()
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

    return NextResponse.json({
      success: true,
      application,
      message: 'Application submitted successfully! The task creator will review your application.'
    })
  } catch (error: any) {
    console.error('Error applying to task:', error)
    return NextResponse.json(
      { error: 'Failed to apply to task' },
      { status: 500 }
    )
  }
}