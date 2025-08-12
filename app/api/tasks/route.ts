import { NextRequest, NextResponse } from 'next/server'
import { createServerClient, createServiceClient } from '../../../lib/supabase'
import { TaskApprovalService } from '../../../lib/taskApproval'

export async function GET(request: NextRequest) {
  try {
    const supabase = createServiceClient()
    const { searchParams } = new URL(request.url)
    
    const category = searchParams.get('category')
    const taskType = searchParams.get('taskType')
    const search = searchParams.get('search')

    // Try the database first, if it fails, return sample data
    let query = supabase
      .from('tasks')
      .select(`
        id,
        title,
        description,
        earning_potential,
        location,
        duration,
        max_participants,
        current_participants,
        scheduled_date,
        type,
        approval_status,
        created_at,
        category_id
      `)
      .eq('status', 'open')
      .order('created_at', { ascending: false })

    if (category && category !== 'all') {
      // First get category ID, then filter tasks
      const { data: categoryData } = await supabase
        .from('categories')
        .select('id')
        .eq('name', category)
        .single()
      
      if (categoryData) {
        query = query.eq('category_id', categoryData.id)
      }
    }

    if (taskType && taskType !== 'all') {
      query = query.eq('task_type', taskType)
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`)
    }

    const { data: tasks, error } = await query

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ tasks: [] })
    }

    return NextResponse.json({ tasks })
  } catch (error: any) {
    console.error('Error fetching tasks:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tasks' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createServiceClient()
    
    // Get user from authentication header
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json({ error: 'Authorization required' }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const taskData = await request.json()

    // Validate required fields
    const { title, description, category_id, earningPotential, location, max_participants = 1 } = taskData

    if (!title || !description || !category_id || !earningPotential || !location) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Create task with approval fields
    const { data: task, error } = await supabase
      .from('tasks')
      .insert({
        host_id: user.id,
        category_id,
        title: title.trim(),
        description: description.trim(),
        type: taskData.type || 'shared',
        earning_potential: parseFloat(earningPotential),
        max_participants: parseInt(max_participants),
        current_participants: 0,
        location: location.trim(),
        duration: taskData.duration || null,
        scheduled_date: taskData.scheduledDate || null,
        requirements: taskData.requirements || null,
        status: 'open',
        // Approval system fields - default to pending
        approval_status: 'pending',
        review_tier: 'standard_review',
        risk_score: 0
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    // Process task approval using our approval system
    let approvalResult
    try {
      // Only run approval if not in build mode
      if (process.env.NODE_ENV !== 'production' || process.env.DATABASE_URL) {
        approvalResult = await TaskApprovalService.processTaskApproval(task.id)
      } else {
        // Default to manual review in production without database
        approvalResult = {
          approved: false,
          reviewTier: 'manual_review',
          riskScore: 50,
          reasons: ['Pending manual review']
        }
      }
      
      // Update task status based on approval result
      if (approvalResult.approved) {
        await supabase
          .from('tasks')
          .update({ 
            approval_status: 'auto_approved',
            approved_at: new Date().toISOString(),
            approved_by: 'system'
          })
          .eq('id', task.id)
      }
    } catch (approvalError) {
      console.error('Approval process failed:', approvalError)
      // Task creation succeeded but approval failed - mark for manual review
      await supabase
        .from('tasks')
        .update({ 
          approval_status: 'manual_review',
          review_tier: 'enhanced_review'
        })
        .eq('id', task.id)
      
      approvalResult = {
        approved: false,
        reviewTier: 'enhanced_review',
        riskScore: 50,
        reasons: ['Approval system error - requires manual review']
      }
    }

    return NextResponse.json({ 
      task,
      approvalStatus: approvalResult.approved ? 'auto_approved' : 'manual_review',
      reviewTier: approvalResult.reviewTier,
      riskScore: approvalResult.riskScore,
      reasons: approvalResult.reasons
    })
  } catch (error: any) {
    console.error('Error creating task:', error)
    return NextResponse.json(
      { error: 'Failed to create task' },
      { status: 500 }
    )
  }
}