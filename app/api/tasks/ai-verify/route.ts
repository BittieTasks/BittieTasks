import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient(request)
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    // Require phone verification for task completion
    if (!user.phone_confirmed_at) {
      return NextResponse.json({ 
        error: 'Phone verification required',
        message: 'Please verify your phone number before completing tasks',
        code: 'PHONE_NOT_VERIFIED'
      }, { status: 403 })
    }

    const { taskId, afterPhoto, notes } = await request.json()

    if (!taskId) {
      return NextResponse.json({ error: 'Task ID is required' }, { status: 400 })
    }

    // Verify user has applied to this task
    const { data: participant, error: participantError } = await supabase
      .from('task_participants')
      .select('id, status')
      .eq('task_id', taskId)
      .eq('user_id', user.id)
      .single()

    if (participantError || !participant) {
      return NextResponse.json({ error: 'Task participation not found' }, { status: 404 })
    }

    if (participant.status !== 'applied' && participant.status !== 'accepted') {
      return NextResponse.json({ error: 'Task not available for verification' }, { status: 400 })
    }

    // Use AI verification service
    const { verifyTaskCompletion } = await import('../../../../lib/ai-verification')
    
    const verificationResult = await verifyTaskCompletion({
      taskId,
      userId: user.id,
      afterPhoto: afterPhoto || '',
      notes: notes || 'Task completed'
    })

    // Update participant status based on verification
    const newStatus = verificationResult.approved ? 'verified' : 'pending_review'
    
    const { error: updateError } = await supabase
      .from('task_participants')
      .update({
        status: newStatus,
        verification_photo: afterPhoto,
        completion_notes: notes,
        verified_at: verificationResult.approved ? new Date().toISOString() : null
      })
      .eq('id', participant.id)

    if (updateError) {
      console.error('Error updating task participant:', updateError)
      return NextResponse.json({ error: 'Failed to update verification status' }, { status: 500 })
    }

    // If approved and this is a platform-funded task, process payment
    if (verificationResult.approved) {
      try {
        // Get task details for payment
        const { data: task } = await supabase
          .from('tasks')
          .select('earning_potential, type, platform_funded')
          .eq('id', taskId)
          .single()

        if (task?.platform_funded && task.earning_potential) {
          // Process Stripe payment here
          console.log(`Processing payment of $${task.earning_potential} for user ${user.id}`)
          // TODO: Integrate with Stripe for actual payment processing
        }
      } catch (paymentError) {
        console.error('Payment processing error:', paymentError)
        // Don't fail the verification if payment fails
      }
    }

    return NextResponse.json({
      success: verificationResult.approved,
      verification: {
        status: verificationResult.approved ? 'approved' : 'pending',
        confidence: verificationResult.confidence,
        reasoning: verificationResult.reasoning,
        requiresManualReview: !verificationResult.approved
      }
    })

  } catch (error) {
    console.error('Error in AI verification:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}