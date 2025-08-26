import { NextRequest, NextResponse } from 'next/server'
import { createServerClient, createServiceClient } from '../../../../../lib/supabase'

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = createServerClient(request)
    const supabaseDb = createServiceClient()
    const { id: taskId } = await context.params
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    console.log('Task completion auth check:', {
      hasUser: !!user,
      userEmail: user?.email,
      authError: authError?.message,
      taskId
    })
    
    if (authError || !user) {
      console.error('POST /api/tasks/[id]/complete auth error:', authError?.message)
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const { verificationPhoto, completionNotes } = await request.json()

    // Get user's participation in this task
    const { data: participant, error: participantError } = await supabaseDb
      .from('task_participants')
      .select(`
        id, status, user_id,
        task:tasks!inner(id, title, type, earning_potential, created_by)
      `)
      .eq('task_id', taskId)
      .eq('user_id', user.id)
      .single()

    if (participantError || !participant) {
      return NextResponse.json({ error: 'You are not a participant of this task' }, { status: 403 })
    }

    if (participant.status !== 'accepted') {
      return NextResponse.json({ 
        error: 'Invalid status',
        message: `You must be accepted to complete this task. Current status: ${participant.status}`
      }, { status: 400 })
    }

    // Update participant status to completed
    const { data: updatedParticipant, error: updateError } = await supabaseDb
      .from('task_participants')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        verification_photo: verificationPhoto || null,
        completion_notes: completionNotes || null
      })
      .eq('id', participant.id)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating participant to completed:', updateError)
      return NextResponse.json({ error: 'Failed to mark task as completed' }, { status: 500 })
    }

    // If verification photo provided, use AI verification
    if (verificationPhoto) {
      try {
        // Import AI verification function dynamically
        const { verifyTaskCompletion } = await import('../../../../../lib/ai-verification')
        
        const verificationResult = await verifyTaskCompletion({
          taskId,
          userId: user.id,
          afterPhoto: verificationPhoto,
          notes: completionNotes || 'Task completed'
        })

        // Update participant status based on AI verification
        const finalStatus = verificationResult.approved ? 'verified' : 'completed'
        const verifiedAt = verificationResult.approved ? new Date().toISOString() : null

        const { data: finalParticipant, error: finalUpdateError } = await supabaseDb
          .from('task_participants')
          .update({
            status: finalStatus,
            verified_at: verifiedAt
          })
          .eq('id', participant.id)
          .select()
          .single()

        if (finalUpdateError) {
          console.warn('Error updating verification status:', finalUpdateError)
        }

        return NextResponse.json({
          success: true,
          participant: finalParticipant || updatedParticipant,
          verification: verificationResult,
          message: verificationResult.approved 
            ? 'Task completed and automatically verified! Payment will be processed.'
            : 'Task completion submitted for manual review.'
        })

      } catch (verificationError) {
        console.error('AI verification failed:', verificationError)
        // Continue without AI verification
        return NextResponse.json({
          success: true,
          participant: updatedParticipant,
          message: 'Task completion submitted for manual review.'
        })
      }
    }

    return NextResponse.json({
      success: true,
      participant: updatedParticipant,
      message: 'Task marked as completed! Waiting for verification review.'
    })

  } catch (error: any) {
    console.error('Error completing task:', error)
    return NextResponse.json(
      { error: 'Failed to complete task' },
      { status: 500 }
    )
  }
}