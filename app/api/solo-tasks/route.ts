import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { soloTasks } from '@/lib/taskData'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const difficulty = searchParams.get('difficulty')
    const search = searchParams.get('search')
    const featured = searchParams.get('featured')

    let filteredTasks = [...soloTasks]

    // Apply filters
    if (category && category !== 'all') {
      filteredTasks = filteredTasks.filter(task => task.category === category)
    }

    if (difficulty && difficulty !== 'all') {
      filteredTasks = filteredTasks.filter(task => task.difficulty === difficulty)
    }

    if (search) {
      const searchLower = search.toLowerCase()
      filteredTasks = filteredTasks.filter(task =>
        task.title.toLowerCase().includes(searchLower) ||
        task.description.toLowerCase().includes(searchLower) ||
        task.category.toLowerCase().includes(searchLower)
      )
    }

    if (featured === 'true') {
      // Return highest paying and sponsored tasks
      filteredTasks = filteredTasks
        .filter(task => task.is_sponsored || task.payout >= 100)
        .sort((a, b) => b.payout - a.payout)
        .slice(0, 6)
    }

    // Calculate net payouts (3% platform fee for solo tasks)
    const tasksWithNetPayout = filteredTasks.map(task => ({
      ...task,
      net_payout: Math.round(task.payout * 0.97), // 97% after 3% fee
      gross_payout: task.payout,
      platform_fee: Math.round(task.payout * 0.03)
    }))

    return NextResponse.json({
      success: true,
      tasks: tasksWithNetPayout,
      total: tasksWithNetPayout.length,
      categories: Array.from(new Set(soloTasks.map(task => task.category))),
      filters: {
        category,
        difficulty,
        search,
        featured
      }
    })

  } catch (error: any) {
    console.error('Solo tasks fetch error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch solo tasks',
      details: error.message
    }, { status: 500 })
  }
}

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
    const { task_id, application_message } = body

    // Validate task exists
    const task = soloTasks.find(t => t.id === task_id)
    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    // Check if user already applied
    const { data: existingApplication } = await supabase
      .from('task_participants')
      .select('id')
      .eq('task_id', task_id)
      .eq('user_id', user.id)
      .single()

    if (existingApplication) {
      return NextResponse.json({ error: 'Already applied to this task' }, { status: 400 })
    }

    // Create task application
    const { data: application, error: applicationError } = await supabase
      .from('task_participants')
      .insert({
        task_id,
        user_id: user.id,
        status: 'auto_approved', // Solo tasks are auto-approved
        application_message: application_message || 'Solo task application',
        approved_at: new Date().toISOString(),
        approved_by: 'system'
      })
      .select()
      .single()

    if (applicationError) {
      console.error('Application creation error:', applicationError)
      return NextResponse.json({ 
        error: 'Failed to apply to task',
        details: applicationError.message 
      }, { status: 500 })
    }

    // Calculate earnings and fees
    const grossPayout = task.payout
    const platformFee = Math.round(grossPayout * 0.03)
    const netPayout = grossPayout - platformFee

    return NextResponse.json({
      success: true,
      application,
      task: {
        ...task,
        gross_payout: grossPayout,
        platform_fee: platformFee,
        net_payout: netPayout
      },
      message: 'Successfully applied to solo task! You can now start working.'
    })

  } catch (error: any) {
    console.error('Solo task application error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to apply to task',
      details: error.message
    }, { status: 500 })
  }
}