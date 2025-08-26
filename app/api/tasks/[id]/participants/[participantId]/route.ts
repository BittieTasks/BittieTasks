import { NextRequest, NextResponse } from 'next/server'
import { createServerClient, createServiceClient } from '../../../../../../lib/supabase'

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string; participantId: string }> }
) {
  try {
    // Get authenticated user from Supabase with request context
    const supabase = createServerClient(request)
    const supabaseDb = createServiceClient()
    const { id: taskId, participantId } = await context.params
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    console.log('Task participant update auth check:', {
      hasUser: !!user,
      userEmail: user?.email,
      authError: authError?.message,
      taskId,
      participantId
    })
    
    if (authError || !user) {
      console.error('PATCH /api/tasks/[id]/participants/[participantId] auth error:', authError?.message)
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const { action, rejectionReason } = await request.json()

    if (!['accept', 'reject'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action. Must be "accept" or "reject"' }, { status: 400 })
    }

    // Verify user is the task creator
    const { data: task, error: taskError } = await supabaseDb
      .from('tasks')
      .select('id, title, created_by, max_participants, current_participants')
      .eq('id', taskId)
      .single()

    if (taskError || !task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    if (task.created_by !== user.id) {
      return NextResponse.json({ error: 'Only the task creator can accept/reject applications' }, { status: 403 })
    }

    // Get participant details
    const { data: participant, error: participantError } = await supabaseDb
      .from('task_participants')
      .select(`
        id, user_id, status, joined_at,
        user:users!inner(id, first_name, last_name, email)
      `)
      .eq('id', participantId)
      .eq('task_id', taskId)
      .single()

    if (participantError || !participant) {
      return NextResponse.json({ error: 'Participant not found' }, { status: 404 })
    }

    if (participant.status !== 'applied') {
      return NextResponse.json({ 
        error: 'Invalid status',
        message: `Can only accept/reject applications with "applied" status. Current status: ${participant.status}`
      }, { status: 400 })
    }

    // Check if accepting would exceed participant limit
    if (action === 'accept') {
      const { data: acceptedParticipants, error: countError } = await supabaseDb
        .from('task_participants')
        .select('id')
        .eq('task_id', taskId)
        .eq('status', 'accepted')

      if (countError) {
        console.warn('Error counting accepted participants:', countError)
      }

      const currentAccepted = acceptedParticipants?.length || 0
      if (currentAccepted >= task.max_participants) {
        return NextResponse.json({ 
          error: 'Task is full',
          message: 'Cannot accept more participants. Task has reached maximum capacity.'
        }, { status: 400 })
      }
    }

    // Update participant status
    const updateData: any = {
      status: action === 'accept' ? 'accepted' : 'cancelled',
      accepted_at: action === 'accept' ? new Date().toISOString() : null,
      rejection_reason: action === 'reject' ? rejectionReason : null
    }

    const { data: updatedParticipant, error: updateError } = await supabaseDb
      .from('task_participants')
      .update(updateData)
      .eq('id', participantId)
      .select(`
        id, status, accepted_at, rejection_reason,
        user:users!inner(id, first_name, last_name, email)
      `)
      .single()

    if (updateError) {
      console.error('Error updating participant status:', updateError)
      return NextResponse.json({ error: 'Failed to update application status' }, { status: 500 })
    }

    // TODO: Send notification to applicant
    // This would typically trigger an email/SMS notification

    const actionPastTense = action === 'accept' ? 'accepted' : 'rejected'
    return NextResponse.json({
      success: true,
      participant: updatedParticipant,
      message: `Application ${actionPastTense} successfully!`
    })

  } catch (error: any) {
    console.error('Error updating participant status:', error)
    return NextResponse.json(
      { error: 'Failed to update application status' },
      { status: 500 }
    )
  }
}

// Get participant details for the task creator
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string; participantId: string }> }
) {
  try {
    const supabase = createServerClient(request)
    const supabaseDb = createServiceClient()
    const { id: taskId, participantId } = await context.params
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    // Verify user is the task creator
    const { data: task, error: taskError } = await supabaseDb
      .from('tasks')
      .select('id, created_by')
      .eq('id', taskId)
      .single()

    if (taskError || !task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    if (task.created_by !== user.id) {
      return NextResponse.json({ error: 'Only the task creator can view application details' }, { status: 403 })
    }

    // Get participant details with application responses
    const { data: participant, error: participantError } = await supabaseDb
      .from('task_participants')
      .select(`
        id, status, joined_at, accepted_at, rejection_reason, application_responses,
        user:users!inner(id, first_name, last_name, email, phone_number, location, bio)
      `)
      .eq('id', participantId)
      .eq('task_id', taskId)
      .single()

    if (participantError || !participant) {
      return NextResponse.json({ error: 'Participant not found' }, { status: 404 })
    }

    return NextResponse.json({ participant })

  } catch (error: any) {
    console.error('Error fetching participant details:', error)
    return NextResponse.json(
      { error: 'Failed to fetch participant details' },
      { status: 500 }
    )
  }
}