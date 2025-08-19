import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { everydayTasks } from '@/lib/everydayTasks'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const taskId = searchParams.get('task_id')

    if (!taskId) {
      return NextResponse.json({ error: 'Task ID required' }, { status: 400 })
    }

    // Find task in everyday tasks
    const task = everydayTasks.find(t => t.id === taskId)
    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    // Get today's date range (00:00:00 to 23:59:59)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    // Count how many users completed this task today
    const { data: completedToday, error: completedError } = await supabase
      .from('task_participants')
      .select('id')
      .eq('task_id', taskId)
      .eq('status', 'completed')
      .gte('completed_at', today.toISOString())
      .lt('completed_at', tomorrow.toISOString())

    if (completedError) {
      console.error('Error checking completed tasks:', completedError)
      return NextResponse.json({ 
        error: 'Failed to check task availability',
        details: completedError.message 
      }, { status: 500 })
    }

    const dailyCompleted = completedToday?.length || 0
    const dailyLimit = task.daily_limit || 5
    const available = dailyCompleted < dailyLimit

    return NextResponse.json({
      success: true,
      task_id: taskId,
      available,
      daily_completed: dailyCompleted,
      daily_limit: dailyLimit,
      remaining_slots: Math.max(0, dailyLimit - dailyCompleted),
      reset_time: tomorrow.toISOString(),
      completion_time_hours: task.completion_time_hours || 24
    })

  } catch (error: any) {
    console.error('Task availability check error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to check task availability',
      details: error.message
    }, { status: 500 })
  }
}