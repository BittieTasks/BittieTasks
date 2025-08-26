import { NextRequest, NextResponse } from 'next/server'
import { createServerClient, createServiceClient } from '../../../../../lib/supabase'

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = createServerClient(request)
    const supabaseDb = createServiceClient()
    const { id: taskId } = await context.params
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    console.log('Task participants list auth check:', {
      hasUser: !!user,
      userEmail: user?.email,
      authError: authError?.message,
      taskId
    })
    
    if (authError || !user) {
      console.error('GET /api/tasks/[id]/participants auth error:', authError?.message)
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    // Verify user is the task creator
    const { data: task, error: taskError } = await supabaseDb
      .from('tasks')
      .select('id, title, created_by, max_participants')
      .eq('id', taskId)
      .single()

    if (taskError || !task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    if (task.created_by !== user.id) {
      return NextResponse.json({ error: 'Only the task creator can view participants' }, { status: 403 })
    }

    // Get all participants for this task
    const { data: participants, error: participantsError } = await supabaseDb
      .from('task_participants')
      .select(`
        id, 
        status, 
        joined_at, 
        accepted_at, 
        completed_at,
        verified_at,
        rejection_reason,
        application_responses,
        user:users!inner(
          id, 
          first_name, 
          last_name, 
          email, 
          phone_number, 
          location, 
          bio,
          profile_image_url
        )
      `)
      .eq('task_id', taskId)
      .order('joined_at', { ascending: false })

    if (participantsError) {
      console.error('Error fetching participants:', participantsError)
      return NextResponse.json({ error: 'Failed to fetch participants' }, { status: 500 })
    }

    // Group participants by status for easier management
    const participantsByStatus = {
      applied: participants?.filter(p => p.status === 'applied') || [],
      accepted: participants?.filter(p => p.status === 'accepted') || [],
      completed: participants?.filter(p => p.status === 'completed') || [],
      verified: participants?.filter(p => p.status === 'verified') || [],
      cancelled: participants?.filter(p => p.status === 'cancelled') || [],
      expired: participants?.filter(p => p.status === 'expired') || []
    }

    return NextResponse.json({
      task: {
        id: task.id,
        title: task.title,
        max_participants: task.max_participants
      },
      participants: participants || [],
      participantsByStatus,
      summary: {
        total: participants?.length || 0,
        applied: participantsByStatus.applied.length,
        accepted: participantsByStatus.accepted.length,
        completed: participantsByStatus.completed.length,
        verified: participantsByStatus.verified.length,
        cancelled: participantsByStatus.cancelled.length,
        expired: participantsByStatus.expired.length
      }
    })

  } catch (error: any) {
    console.error('Error fetching task participants:', error)
    return NextResponse.json(
      { error: 'Failed to fetch task participants' },
      { status: 500 }
    )
  }
}