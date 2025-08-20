import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { everydayTasks } from '@/lib/everydayTasks'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    // Get authenticated user
    const authHeader = request.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const token = authHeader.split(' ')[1]
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid authentication' }, { status: 401 })
    }

    const body = await request.json()
    const { task_id, taskId, afterPhoto, notes } = body
    const actualTaskId = task_id || taskId

    // Validate task exists
    const task = everydayTasks.find(t => t.id === actualTaskId)
    if (!task) {
      return NextResponse.json({ error: 'Solo task not found' }, { status: 404 })
    }

    // Check if user has applied to this task
    const { data: existingApplication, error: applicationError } = await supabase
      .from('task_participants')
      .select('id, status, joined_at')
      .eq('task_id', actualTaskId)
      .eq('user_id', user.id)
      .single()

    if (applicationError || !existingApplication) {
      return NextResponse.json({ 
        error: 'Application not found',
        details: 'You must apply to this task first before verifying completion'
      }, { status: 404 })
    }

    if (existingApplication.status === 'completed') {
      return NextResponse.json({ 
        error: 'Task already completed',
        details: 'You have already completed this task today'
      }, { status: 400 })
    }

    // Use AI verification service
    const aiVerification = await verifyTaskWithAI({
      taskTitle: task.title,
      taskDescription: task.description,
      afterPhoto,
      notes: notes || 'Task completed successfully'
    })

    // Update task participant record with completion
    const { error: completionError } = await supabase
      .from('task_participants')
      .update({
        status: 'completed',
        verification_photo: afterPhoto,
        completion_notes: notes || 'Task completed successfully',
        completed_at: new Date().toISOString(),
        ai_confidence: aiVerification.confidence,
        ai_approved: aiVerification.approved
      })
      .eq('id', existingApplication.id)

    if (completionError) {
      console.error('Error updating task completion:', completionError)
      return NextResponse.json({ 
        error: 'Failed to record task completion',
        details: completionError.message
      }, { status: 500 })
    }

    // Calculate payment (97% after 3% platform fee)
    const grossPayout = task.payout
    const platformFee = Math.round(grossPayout * 0.03)
    const netPayout = grossPayout - platformFee

    // Create payment record in transactions table
    const { error: paymentError } = await supabase
      .from('transactions')
      .insert({
        user_id: user.id,
        task_id: actualTaskId,
        amount: netPayout,
        gross_amount: grossPayout,
        platform_fee: platformFee,
        type: 'earning',
        status: 'completed',
        description: `Solo task completed: ${task.title}`,
        stripe_payment_intent_id: null // Platform-funded, no Stripe needed
      })

    if (paymentError) {
      console.error('Error creating payment record:', paymentError)
      // Don't fail the verification, but log the issue
    }

    return NextResponse.json({
      success: true,
      verification: {
        approved: aiVerification.approved,
        confidence: aiVerification.confidence,
        requiresManualReview: !aiVerification.approved
      },
      payment: {
        gross_amount: grossPayout,
        platform_fee: platformFee,
        net_amount: netPayout,
        status: 'completed'
      },
      task: {
        id: actualTaskId,
        title: task.title,
        status: 'completed'
      }
    })

  } catch (error: any) {
    console.error('Solo task verification error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to verify solo task',
      details: error.message
    }, { status: 500 })
  }
}

// Simple AI verification function for solo tasks
async function verifyTaskWithAI({ taskTitle, taskDescription, afterPhoto, notes }: {
  taskTitle: string
  taskDescription: string
  afterPhoto: string
  notes: string
}): Promise<{ approved: boolean; confidence: number }> {
  try {
    // For now, simple heuristic verification
    // In production, this would use OpenAI vision API
    const hasPhoto = afterPhoto && afterPhoto.length > 100
    const hasNotes = notes && notes.trim().length > 5
    
    // Basic verification scoring
    let confidence = 70 // Base confidence
    
    if (hasPhoto) confidence += 20
    if (hasNotes) confidence += 10
    
    // Simple approval logic
    const approved = confidence >= 85
    
    return {
      approved,
      confidence: Math.min(confidence, 95) // Cap at 95%
    }
    
  } catch (error) {
    console.error('AI verification error:', error)
    return { approved: false, confidence: 0 }
  }
}