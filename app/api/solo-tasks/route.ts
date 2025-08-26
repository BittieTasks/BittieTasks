import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient(request)
    
    // Get current user using Supabase auth
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      console.error('GET /api/solo-tasks auth error:', authError?.message)
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    console.log('Solo tasks GET endpoint called for user:', user.id)
    
    // Query real database for solo tasks - only approved tasks
    const { data: tasks, error } = await supabase
      .from('tasks')
      .select(`
        *,
        creator:users!tasks_creator_id_fkey(id, email, first_name, last_name)
      `)
      .eq('type', 'solo')
      .eq('status', 'open')
      .eq('approval_status', 'approved')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching solo tasks from database:', error)
      return NextResponse.json({ error: 'Failed to fetch solo tasks' }, { status: 500 })
    }

    console.log(`Found ${tasks?.length || 0} real solo tasks in database`)
    
    // Return real database tasks
    const response = {
      success: true,
      tasks: tasks || [],
      total: tasks?.length || 0
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
    const supabase = createServerClient(request)
    
    // Get current user using Supabase auth
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      console.error('POST /api/solo-tasks auth error:', authError?.message)
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    // Require email verification for task applications
    if (!user.email_confirmed_at) {
      return NextResponse.json({ 
        error: 'Email verification required',
        message: 'Please verify your email address before applying to tasks',
        code: 'EMAIL_NOT_VERIFIED'
      }, { status: 403 })
    }

    const body = await request.json()
    const { taskId, task_id, applicationMessage, application_message } = body
    const actualTaskId = taskId || task_id

    if (!actualTaskId) {
      return NextResponse.json({ error: 'Task ID is required' }, { status: 400 })
    }

    console.log('Processing solo task application:', {
      userId: user.id,
      taskId: actualTaskId
    })

    // Validate task exists in database
    const { data: task, error: taskError } = await supabase
      .from('tasks')
      .select('*')
      .eq('id', actualTaskId)
      .eq('type', 'solo')
      .eq('status', 'open')
      .eq('approval_status', 'approved')
      .single()

    if (taskError || !task) {
      return NextResponse.json({ error: 'Solo task not found or not available' }, { status: 404 })
    }

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

    // Create application record using real task data
    const payoutAmount = parseFloat(task.earning_potential) || 0
    const platformFee = Math.round(payoutAmount * 0.03 * 100) / 100 // 3% fee
    const netPayout = Math.round((payoutAmount - platformFee) * 100) / 100

    const applicationData = {
      user_id: user.id,
      task_id: actualTaskId,
      task_title: task.title,
      task_type: 'solo',
      status: 'applied',
      application_message: applicationMessage || application_message || 'Applied for solo task',
      payout_amount: payoutAmount,
      platform_fee: platformFee,
      net_payout: netPayout,
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
      message: `Successfully applied for "${task.title}". Complete the task and submit verification to earn $${payoutAmount}.`,
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