import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { db } from '../../../../server/db'
import { taskParticipants } from '@shared/schema'
import { eq, and } from 'drizzle-orm'

export async function POST(request: NextRequest) {
  try {
    // Get authenticated user from Supabase with request context
    const supabase = createServerClient(request)
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    console.log('Task apply auth check:', {
      hasUser: !!user,
      userEmail: user?.email,
      authError: authError?.message,
      hasAuthHeader: !!request.headers.get('authorization'),
      hasCookies: !!request.headers.get('cookie')
    })

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { taskId } = await request.json()

    if (!taskId) {
      return NextResponse.json(
        { error: 'Task ID is required' },
        { status: 400 }
      )
    }

    // Check if database is available
    if (!process.env.DATABASE_URL) {
      return NextResponse.json(
        { error: 'Database not available' },
        { status: 503 }
      )
    }

    // Check if user already applied for this task
    const existingApplication = await db
      .select()
      .from(taskParticipants)
      .where(and(
        eq(taskParticipants.taskId, taskId),
        eq(taskParticipants.userId, user.id)
      ))
      .limit(1)

    if (existingApplication.length > 0) {
      return NextResponse.json(
        { error: 'You have already applied for this task' },
        { status: 400 }
      )
    }

    // Calculate deadline (24 hours for solo tasks, 48 hours for others)
    const now = new Date()
    const hoursToAdd = taskId.startsWith('platform-') ? 24 : 48 // Solo tasks vs others
    const deadline = new Date(now.getTime() + (hoursToAdd * 60 * 60 * 1000))

    // Create new application in database
    const [newApplication] = await db
      .insert(taskParticipants)
      .values({
        taskId: taskId,
        userId: user.id,
        status: 'joined',
        deadline: deadline
      })
      .returning()

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
    // Get authenticated user from Supabase with request context
    const supabase = createServerClient(request)
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Check if database is available
    if (!process.env.DATABASE_URL) {
      return NextResponse.json({ applications: [] })
    }

    // Get user's applications from database
    const userApplications = await db
      .select()
      .from(taskParticipants)
      .where(eq(taskParticipants.userId, user.id))

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