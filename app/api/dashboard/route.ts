import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { everydayTasks } from '@/lib/everydayTasks'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
  try {
    // Get authenticated user
    const authHeader = request.headers.get('Authorization')
    console.log('Dashboard API: Auth header:', authHeader ? 'Bearer token present' : 'No auth header')
    
    if (!authHeader?.startsWith('Bearer ')) {
      console.log('Dashboard API: Missing or invalid Authorization header')
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const token = authHeader.split(' ')[1]
    console.log('Dashboard API: Extracted token length:', token?.length || 0)
    
    if (!token || token.length < 20) {
      console.log('Dashboard API: Token is too short or empty')
      return NextResponse.json({ error: 'Invalid token format' }, { status: 401 })
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      console.log('Dashboard API: Auth error:', authError?.message || 'Unknown auth error')
      return NextResponse.json({ error: 'Invalid authentication', details: authError?.message }, { status: 401 })
    }
    
    console.log('Dashboard API: Successfully authenticated user:', user.email)

    // Try to get user stats - gracefully handle if table doesn't exist
    let userData = null
    let userError = null
    try {
      const result = await supabase
        .from('users')
        .select('totalEarnings, tasksCompleted')
        .eq('id', user.id)
        .single()
      userData = result.data
      userError = result.error
    } catch (error: any) {
      console.log('Dashboard API: Users table query failed:', error.message)
      userError = error
    }

    // Try to get active task participants - gracefully handle if table doesn't exist
    let activeParticipants = []
    let activeError = null
    try {
      const result = await supabase
        .from('task_participants')
        .select('id, task_id, status, joined_at, deadline')
        .eq('user_id', user.id)
        .in('status', ['auto_approved', 'pending_verification'])
        .order('joined_at', { ascending: false })
      activeParticipants = result.data || []
      activeError = result.error
    } catch (error: any) {
      console.log('Dashboard API: Task participants query failed:', error.message)
      activeError = error
    }

    // Try to get completed task participants - gracefully handle if table doesn't exist  
    let completedParticipants = []
    let completedError = null
    try {
      const result = await supabase
        .from('task_participants')
        .select('id, task_id, status, joined_at, completed_at')
        .eq('user_id', user.id)
        .eq('status', 'completed')
        .order('completed_at', { ascending: false })
        .limit(20)
      completedParticipants = result.data || []
      completedError = result.error
    } catch (error: any) {
      console.log('Dashboard API: Completed participants query failed:', error.message)
      completedError = error
    }

    // Try to get recent transactions - gracefully handle if table doesn't exist
    let transactions = []
    let transactionError = null
    try {
      const result = await supabase
        .from('transactions')
        .select('id, amount, fee_amount, gross_amount, processed_at, description, status')
        .eq('user_id', user.id)
        .order('processed_at', { ascending: false })
        .limit(20)
      transactions = result.data || []
      transactionError = result.error
    } catch (error: any) {
      console.log('Dashboard API: Transactions query failed:', error.message)
      transactionError = error
    }

    console.log('Dashboard API: Query results:', {
      userDataExists: !!userData,
      activeCount: activeParticipants.length,
      completedCount: completedParticipants.length,
      transactionCount: transactions.length,
      hasErrors: !!(activeError || completedError || userError || transactionError)
    })

    // Enhance participants with task details from everydayTasks
    const enhanceWithTaskData = (participants: any[]) => {
      return participants.map(participant => {
        const taskData = everydayTasks.find(task => task.id === participant.task_id)
        return {
          ...participant,
          task: taskData ? {
            id: taskData.id,
            title: taskData.title,
            category: taskData.category,
            payout: taskData.payout,
            time_estimate: taskData.time_estimate,
            difficulty: taskData.difficulty
          } : {
            id: participant.task_id,
            title: 'Unknown Task',
            category: 'Unknown',
            payout: 0,
            time_estimate: 'Unknown',
            difficulty: 'unknown'
          }
        }
      })
    }

    const enhancedActiveTasks = enhanceWithTaskData(activeParticipants)
    const enhancedCompletedTasks = enhanceWithTaskData(completedParticipants)

    // Calculate stats - handle database field name variations
    const totalEarnings = userData?.totalEarnings || userData?.total_earnings || 0
    const tasksCompleted = userData?.tasksCompleted || userData?.tasks_completed || 0
    const activeTasks = enhancedActiveTasks.length
    const avgEarning = tasksCompleted > 0 ? totalEarnings / tasksCompleted : 0

    return NextResponse.json({
      success: true,
      activeTasks: enhancedActiveTasks,
      completedTasks: enhancedCompletedTasks,
      transactions: transactions || [],
      stats: {
        totalEarnings: parseFloat(totalEarnings.toString()),
        tasksCompleted,
        activeTasks,
        avgEarning: parseFloat(avgEarning.toFixed(2))
      }
    })

  } catch (error: any) {
    console.error('Dashboard API error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch dashboard data',
      details: error.message
    }, { status: 500 })
  }
}