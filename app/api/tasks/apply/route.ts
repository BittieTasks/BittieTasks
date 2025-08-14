import { NextRequest, NextResponse } from 'next/server'

interface TaskApplication {
  taskId: string
  userId: string
  applicationDate: string
  applicationTime: string
  status: 'applied' | 'in_progress' | 'completed'
}

// Mock storage for task applications
let taskApplications: TaskApplication[] = []

export async function POST(request: NextRequest) {
  try {
    const { taskId, userId } = await request.json()

    if (!taskId || !userId) {
      return NextResponse.json(
        { error: 'Task ID and User ID are required' },
        { status: 400 }
      )
    }

    // Check if user already applied for this task
    const existingApplication = taskApplications.find(
      app => app.taskId === taskId && app.userId === userId
    )

    if (existingApplication) {
      return NextResponse.json(
        { error: 'You have already applied for this task' },
        { status: 400 }
      )
    }

    // Create new application with detailed timestamps
    const now = new Date()
    const newApplication: TaskApplication = {
      taskId,
      userId,
      applicationDate: now.toISOString(),
      applicationTime: now.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      }),
      status: 'applied'
    }

    taskApplications.push(newApplication)

    return NextResponse.json({
      success: true,
      application: newApplication,
      message: 'Successfully applied for task!'
    })

  } catch (error) {
    console.error('Error applying for task:', error)
    return NextResponse.json(
      { error: 'Failed to apply for task' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Get user's applications
    const userApplications = taskApplications.filter(app => app.userId === userId)

    return NextResponse.json({
      applications: userApplications
    })

  } catch (error) {
    console.error('Error fetching applications:', error)
    return NextResponse.json(
      { error: 'Failed to fetch applications' },
      { status: 500 }
    )
  }
}