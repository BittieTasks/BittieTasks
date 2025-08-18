import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient(request)
    
    // Get current user using fixed authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      console.error('POST /api/tasks/apply auth error:', authError?.message)
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const { taskId, applicationMessage } = await request.json()

    if (!taskId) {
      return NextResponse.json({ error: 'Task ID is required' }, { status: 400 })
    }

    // Check if task exists and is open
    const { data: task, error: taskError } = await supabase
      .from('tasks')
      .select('id, title, status, maxParticipants, currentParticipants, creatorId')
      .eq('id', taskId)
      .single()

    if (taskError || !task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    if (task.status !== 'open') {
      return NextResponse.json({ error: 'Task is no longer open for applications' }, { status: 400 })
    }

    if (task.creatorId === user.id) {
      return NextResponse.json({ error: 'Cannot apply to your own task' }, { status: 400 })
    }

    // Check if user already applied
    const { data: existingApplication, error: applicationCheckError } = await supabase
      .from('task_participants')
      .select('id')
      .eq('task_id', taskId)
      .eq('user_id', user.id)
      .single()

    if (existingApplication) {
      return NextResponse.json({ error: 'You have already applied to this task' }, { status: 400 })
    }

    // Check if task is full
    if (task.currentParticipants >= task.maxParticipants) {
      return NextResponse.json({ error: 'Task is full' }, { status: 400 })
    }

    // Create task participant record
    const { data: participation, error: participationError } = await supabase
      .from('task_participants')
      .insert({
        task_id: taskId,
        user_id: user.id,
        status: 'applied',
        application_message: applicationMessage
      })
      .select()
      .single()

    if (participationError) {
      console.error('Error creating task participation:', participationError)
      return NextResponse.json({ error: 'Failed to apply to task' }, { status: 500 })
    }

    // Update current participants count
    const { error: updateError } = await supabase
      .from('tasks')
      .update({ 
        currentParticipants: task.currentParticipants + 1 
      })
      .eq('id', taskId)

    if (updateError) {
      console.error('Error updating participant count:', updateError)
    }

    return NextResponse.json({ 
      message: 'Application submitted successfully',
      participationId: participation.id
    })

  } catch (error) {
    console.error('Error in POST /api/tasks/apply:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}