import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { verifyTaskCompletion, VERIFICATION_THRESHOLDS, TASK_TYPE_MAPPING } from '@/lib/ai-verification'
import type { VerificationPrompt } from '@/lib/ai-verification'

function createSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      taskId, 
      beforePhoto, 
      afterPhoto, 
      notes,
      userId 
    } = body

    if (!taskId || !afterPhoto || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields: taskId, afterPhoto, userId' },
        { status: 400 }
      )
    }

    const supabase = createSupabaseClient()

    // Get task details
    const { data: task, error: taskError } = await supabase
      .from('tasks')
      .select('*')
      .eq('id', taskId)
      .single()

    if (taskError || !task) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      )
    }

    // Verify user is assigned to this task
    const { data: application } = await supabase
      .from('task_applications')
      .select('*')
      .eq('task_id', taskId)
      .eq('user_id', userId)
      .eq('status', 'accepted')
      .single()

    if (!application) {
      return NextResponse.json(
        { error: 'User not authorized for this task' },
        { status: 403 }
      )
    }

    // Map task category to AI verification type
    const taskType = TASK_TYPE_MAPPING[task.category as keyof typeof TASK_TYPE_MAPPING] || 'other'

    // Prepare verification request
    const verificationRequest: VerificationPrompt = {
      taskType,
      taskDescription: task.description,
      beforePhoto: beforePhoto || undefined,
      afterPhoto,
      location: task.location,
      additionalInstructions: notes
    }

    // Run AI verification
    const verificationResult = await verifyTaskCompletion(verificationRequest)

    // Store verification record
    const { data: verification, error: verificationError } = await supabase
      .from('task_verifications')
      .insert([{
        task_id: taskId,
        user_id: userId,
        verification_type: 'ai_photo',
        status: verificationResult.verified && verificationResult.confidence >= VERIFICATION_THRESHOLDS.AUTO_APPROVE 
          ? 'approved' 
          : verificationResult.requiresManualReview 
            ? 'pending_review' 
            : 'rejected',
        ai_confidence: verificationResult.confidence,
        ai_reasoning: verificationResult.reasoning,
        ai_details: verificationResult.details,
        before_photo_url: beforePhoto ? await storeImage(beforePhoto, `${taskId}_before`) : null,
        after_photo_url: await storeImage(afterPhoto, `${taskId}_after`),
        verification_notes: notes,
        created_at: new Date().toISOString()
      }])
      .select()
      .single()

    if (verificationError) {
      console.error('Error storing verification:', verificationError)
      return NextResponse.json(
        { error: 'Failed to store verification record' },
        { status: 500 }
      )
    }

    // Update task status based on verification result
    let taskStatus = task.status
    let paymentStatus = task.payment_status

    if (verificationResult.verified && verificationResult.confidence >= VERIFICATION_THRESHOLDS.AUTO_APPROVE) {
      taskStatus = 'verified_complete'
      paymentStatus = 'ready_for_release'
      
      // Auto-release escrow for high-confidence verifications
      if (task.payment_status === 'escrowed') {
        // Trigger escrow release
        await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:5000'}/api/payments/release-escrow`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            paymentId: task.payment_id,
            taskId: taskId,
            reason: 'ai_verification_approved'
          })
        })
        paymentStatus = 'released'
      }
    } else if (verificationResult.requiresManualReview) {
      taskStatus = 'pending_verification'
      paymentStatus = 'held_for_review'
    } else {
      taskStatus = 'verification_failed'
    }

    // Update task
    const { error: updateError } = await supabase
      .from('tasks')
      .update({
        status: taskStatus,
        payment_status: paymentStatus,
        verification_id: verification.id,
        updated_at: new Date().toISOString()
      })
      .eq('id', taskId)

    if (updateError) {
      console.error('Error updating task:', updateError)
    }

    return NextResponse.json({
      success: true,
      verification: {
        id: verification.id,
        verified: verificationResult.verified,
        confidence: verificationResult.confidence,
        reasoning: verificationResult.reasoning,
        suggestions: verificationResult.suggestions,
        requiresManualReview: verificationResult.requiresManualReview,
        status: verification.status,
        qualityScore: verificationResult.details.qualityScore
      },
      taskStatus: taskStatus,
      paymentStatus: paymentStatus,
      autoReleased: taskStatus === 'verified_complete' && paymentStatus === 'released'
    })

  } catch (error: any) {
    console.error('AI verification error:', error)
    return NextResponse.json(
      { error: 'AI verification failed. Please try manual verification.' },
      { status: 500 }
    )
  }
}

async function storeImage(base64Image: string, filename: string): Promise<string> {
  const supabase = createSupabaseClient()
  
  try {
    // Convert base64 to buffer
    const imageBuffer = Buffer.from(base64Image.replace(/^data:image\/\w+;base64,/, ''), 'base64')
    
    // Upload to Supabase storage
    const { data, error } = await supabase.storage
      .from('task-verifications')
      .upload(`${filename}_${Date.now()}.jpg`, imageBuffer, {
        contentType: 'image/jpeg',
        cacheControl: '3600'
      })

    if (error) {
      console.error('Error uploading image:', error)
      return `local_storage_${filename}` // Fallback for development
    }

    return data.path
  } catch (error) {
    console.error('Error processing image:', error)
    return `local_storage_${filename}` // Fallback
  }
}