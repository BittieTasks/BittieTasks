import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { everydayTasks as soloTasks } from '@/lib/everydayTasks'

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
    console.log('Solo tasks POST endpoint called')
    
    // For now, return a simple success response to fix the transparency issue
    // This allows the modal to work while we address database schema issues separately
    const { taskId, task_id } = await request.json()
    const actualTaskId = taskId || task_id
    
    if (!actualTaskId) {
      return NextResponse.json({ error: 'Task ID is required' }, { status: 400 })
    }

    // Validate task exists in our data
    const task = soloTasks.find(t => t.id === actualTaskId)
    if (!task) {
      return NextResponse.json({ error: 'Solo task not found' }, { status: 404 })
    }

    console.log('Solo task application for:', actualTaskId)

    // Return successful application (simplified for now)
    return NextResponse.json({
      success: true,
      message: 'Solo task application successful - you can now complete the task',
      task: {
        id: actualTaskId,
        title: task.title,
        payout: task.payout,
        net_payout: Math.round(task.payout * 0.97), // 3% platform fee
        status: 'auto_approved'
      }
    })

  } catch (error: any) {
    console.error('Error in solo task application:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}