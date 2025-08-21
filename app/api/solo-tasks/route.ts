import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { everydayTasks } from '@/lib/everydayTasks'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
  try {
    console.log('Solo tasks GET endpoint called')
    
    // Return all available solo tasks
    const response = {
      success: true,
      tasks: everydayTasks.map(task => ({
        ...task,
        platform_funded: true,
        completion_limit: 5, // Daily limit per user
        verification_type: 'photo'
      })),
      total: everydayTasks.length
    }
    
    return NextResponse.json(response)
    
  } catch (error: any) {
    console.error('Error in solo tasks GET:', error)
    return NextResponse.json({
      error: 'Failed to fetch solo tasks',
      details: error.message
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('Solo task application endpoint called')

    const body = await request.json()
    const { taskId, task_id, applicationMessage, application_message } = body
    const actualTaskId = taskId || task_id

    if (!actualTaskId) {
      return NextResponse.json({ error: 'Task ID is required' }, { status: 400 })
    }

    // Validate task exists
    const task = everydayTasks.find(t => t.id === actualTaskId)
    if (!task) {
      return NextResponse.json({ error: 'Solo task not found' }, { status: 404 })
    }

    // Get user from authorization header
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json({ error: 'Authorization required' }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user } } = await supabase.auth.getUser(token)
    
    if (!user) {
      return NextResponse.json({ error: 'Invalid authentication' }, { status: 401 })
    }

    console.log('Processing solo task application:', {
      userId: user.id,
      taskId: actualTaskId,
      taskTitle: task.title
    })

    // Check daily completion limit
    const today = new Date().toISOString().split('T')[0]
    
    const { data: todayApplications, error: checkError } = await supabase
      .from('task_applications')
      .select('id')
      .eq('user_id', user.id)
      .eq('task_id', actualTaskId)
      .gte('created_at', `${today}T00:00:00.000Z`)
      .lte('created_at', `${today}T23:59:59.999Z`)

    if (checkError) {
      console.warn('Error checking daily limit (continuing anyway):', checkError)
    }

    const todayCount = todayApplications?.length || 0
    if (todayCount >= 5) {
      return NextResponse.json({ 
        error: 'Daily limit reached',
        details: 'You can complete this task up to 5 times per day. Try again tomorrow!' 
      }, { status: 400 })
    }

    // Create application record
    const applicationData = {
      id: `solo_${Date.now()}_${user.id.slice(-8)}`,
      user_id: user.id,
      task_id: actualTaskId,
      task_title: task.title,
      task_type: 'solo',
      status: 'applied',
      application_message: applicationMessage || application_message || 'Applied for solo task',
      payout_amount: task.payout,
      platform_fee: Math.round(task.payout * 0.03), // 3% fee
      net_payout: Math.round(task.payout * 0.97),
      created_at: new Date().toISOString(),
      deadline: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hour deadline
    }

    const { data: application, error: insertError } = await supabase
      .from('task_applications')
      .insert(applicationData)
      .select()
      .single()

    if (insertError) {
      console.error('Database insertion error:', insertError)
      return NextResponse.json({
        error: 'Failed to create application',
        details: insertError.message
      }, { status: 500 })
    }

    console.log('Solo task application created successfully:', application?.id)

    return NextResponse.json({
      success: true,
      application: application,
      message: `Successfully applied for "${task.title}". Complete the task and submit verification to earn $${task.payout}.`,
      next_step: 'verification_required'
    })

  } catch (error: any) {
    console.error('Error in solo task application:', error)
    return NextResponse.json({
      error: 'Failed to process application',
      details: error.message
    }, { status: 500 })
  }
}