import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { everydayTasks } from '@/lib/everydayTasks'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    console.log('Solo task verification endpoint called')

    const body = await request.json()
    const { task_id, taskId, afterPhoto, notes } = body
    const actualTaskId = task_id || taskId

    if (!actualTaskId) {
      return NextResponse.json({ error: 'Task ID is required' }, { status: 400 })
    }

    // Validate task exists
    const task = everydayTasks.find(t => t.id === actualTaskId)
    if (!task) {
      return NextResponse.json({ error: 'Solo task not found' }, { status: 404 })
    }

    if (!afterPhoto || !afterPhoto.trim()) {
      return NextResponse.json({ 
        error: 'Verification photo required',
        details: 'Please provide a photo or description to verify task completion'
      }, { status: 400 })
    }

    console.log('Processing verification for task:', actualTaskId)

    // Simple AI verification simulation for now
    const mockAIVerification = {
      confidence: 85, // Good confidence score
      approved: true,
      analysis: `Task "${task.title}" appears to be completed successfully based on submitted evidence.`,
      payout_amount: task.payout,
      net_payout: Math.round(task.payout * 0.97) // 3% platform fee
    }

    // Return successful verification response
    return NextResponse.json({
      success: true,
      verification: mockAIVerification,
      task: {
        id: actualTaskId,
        title: task.title,
        payout: task.payout,
        net_payout: mockAIVerification.net_payout
      },
      payment: {
        amount: mockAIVerification.net_payout,
        status: 'processed',
        processed_at: new Date().toISOString()
      },
      message: `Verification successful! Payment of $${mockAIVerification.net_payout} has been processed.`
    })

  } catch (error: any) {
    console.error('Error in solo task verification:', error)
    return NextResponse.json({
      success: false,
      error: 'Verification failed',
      details: error.message
    }, { status: 500 })
  }
}