import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// This endpoint can be called by a cron job to expire overdue tasks
export async function POST(request: NextRequest) {
  try {
    const now = new Date()

    // Find all tasks that are past their deadline and not completed
    const { data: expiredTasks, error: findError } = await supabase
      .from('task_participants')
      .select('id, task_id, user_id, deadline, joined_at')
      .in('status', ['auto_approved', 'pending_verification'])
      .lt('deadline', now.toISOString())

    if (findError) {
      console.error('Error finding expired tasks:', findError)
      return NextResponse.json({ 
        error: 'Failed to find expired tasks',
        details: findError.message 
      }, { status: 500 })
    }

    if (!expiredTasks || expiredTasks.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No expired tasks found',
        expired_count: 0
      })
    }

    // Update expired tasks to 'expired' status
    const { error: updateError } = await supabase
      .from('task_participants')
      .update({
        status: 'expired',
        completed_at: null,
        deadline: null // Clear deadline since task is now expired
      })
      .in('id', expiredTasks.map(task => task.id))

    if (updateError) {
      console.error('Error updating expired tasks:', updateError)
      return NextResponse.json({ 
        error: 'Failed to update expired tasks',
        details: updateError.message 
      }, { status: 500 })
    }

    console.log(`Expired ${expiredTasks.length} overdue tasks`)

    return NextResponse.json({
      success: true,
      message: `Successfully expired ${expiredTasks.length} overdue tasks`,
      expired_count: expiredTasks.length,
      expired_tasks: expiredTasks.map(task => ({
        id: task.id,
        task_id: task.task_id,
        user_id: task.user_id,
        was_deadline: task.deadline,
        hours_overdue: Math.round((now.getTime() - new Date(task.deadline).getTime()) / (1000 * 60 * 60))
      }))
    })

  } catch (error: any) {
    console.error('Task expiration error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to expire tasks',
      details: error.message
    }, { status: 500 })
  }
}

// Manual endpoint to check which tasks would be expired (for testing)
export async function GET(request: NextRequest) {
  try {
    const now = new Date()

    const { data: expiredTasks, error } = await supabase
      .from('task_participants')
      .select('id, task_id, user_id, deadline, joined_at, status')
      .in('status', ['auto_approved', 'pending_verification'])
      .lt('deadline', now.toISOString())

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      expired_tasks: expiredTasks || [],
      count: expiredTasks?.length || 0
    })

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}