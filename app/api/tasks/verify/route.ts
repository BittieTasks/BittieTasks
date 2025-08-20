import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient()
    
    // Get current user using Supabase auth
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      console.error('POST /api/tasks/verify auth error:', authError?.message)
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const { taskId, verificationPhoto } = await request.json()

    if (!taskId || !verificationPhoto) {
      return NextResponse.json({ error: 'Task ID and verification photo are required' }, { status: 400 })
    }

    // Check if user is a participant of this task
    const { data: participation, error: participationError } = await supabase
      .from('task_participants')
      .select(`
        id, status,
        task:tasks!inner(id, title, type, earning_potential, creator_id)
      `)
      .eq('task_id', taskId)
      .eq('user_id', user.id)
      .single()

    if (participationError || !participation) {
      return NextResponse.json({ error: 'You are not a participant of this task' }, { status: 403 })
    }

    if (participation.status !== 'accepted') {
      return NextResponse.json({ error: 'You must be accepted to submit verification' }, { status: 400 })
    }

    // Store verification photo in Supabase Storage
    const photoBuffer = Buffer.from(verificationPhoto, 'base64')
    const fileName = `task-verification/${taskId}/${user.id}/${Date.now()}.jpg`
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('task-verifications')
      .upload(fileName, photoBuffer, {
        contentType: 'image/jpeg',
        upsert: true
      })

    if (uploadError) {
      console.error('Error uploading verification photo:', uploadError)
      return NextResponse.json({ error: 'Failed to upload verification photo' }, { status: 500 })
    }

    // Create task completion submission
    const { data: submission, error: submissionError } = await supabase
      .from('task_completion_submissions')
      .insert({
        task_id: taskId,
        user_id: user.id,
        verification_photos: [uploadData.path],
        status: 'pending_review',
        submission_notes: 'Task completed - photo verification submitted'
      })
      .select()
      .single()

    if (submissionError) {
      console.error('Error creating task submission:', submissionError)
      return NextResponse.json({ error: 'Failed to create submission' }, { status: 500 })
    }

    // Simple auto-approval logic for demo
    const autoApproved = Math.random() > 0.3 // 70% auto-approval rate

    if (autoApproved) {
      // Update submission status to approved
      const { error: approvalError } = await supabase
        .from('task_completion_submissions')
        .update({
          status: 'approved',
          reviewed_at: new Date().toISOString(),
          review_notes: 'Auto-approved by system'
        })
        .eq('id', submission.id)

      if (approvalError) {
        console.error('Error auto-approving submission:', approvalError)
      }

      // Update participant status to completed
      const { error: participantUpdateError } = await supabase
        .from('task_participants')
        .update({ status: 'completed' })
        .eq('id', participation.id)

      if (participantUpdateError) {
        console.error('Error updating participant status:', participantUpdateError)
      }

      // Create payment record for non-barter tasks
      const taskData = Array.isArray(participation.task) ? participation.task[0] : participation.task
      if (taskData && taskData.type !== 'barter' && taskData.earning_potential > 0) {
        let feeRate = 0
        switch (taskData?.type) {
          case 'solo': feeRate = 0.03; break // 3%
          case 'shared': feeRate = 0.07; break // 7%
          case 'corporate_sponsored': feeRate = 0.15; break // 15%
          default: feeRate = 0.03
        }

        const grossAmount = parseFloat(taskData?.earning_potential || '0')
        const platformFee = grossAmount * feeRate
        const netAmount = grossAmount - platformFee

        const { error: paymentError } = await supabase
          .from('payments')
          .insert({
            userId: user.id,
            amount: grossAmount.toFixed(2),
            platformFee: platformFee.toFixed(2),
            processingFee: '0.00',
            netAmount: netAmount.toFixed(2),
            taskType: taskData?.type || 'unknown',
            status: 'completed',
            feeBreakdown: {
              grossAmount,
              platformFee,
              netAmount,
              feeRate
            }
          })

        if (paymentError) {
          console.error('Error creating payment record:', paymentError)
        }
      }
    }

    return NextResponse.json({
      message: autoApproved ? 'Task verified and approved!' : 'Task submitted for review',
      submissionId: submission.id,
      autoApproved,
      status: autoApproved ? 'approved' : 'pending_review'
    })

  } catch (error) {
    console.error('Error in POST /api/tasks/verify:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}