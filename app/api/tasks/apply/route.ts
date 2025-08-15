import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { db } from '../../../../server/db'
import { taskParticipants } from '@shared/schema'
import { eq, and } from 'drizzle-orm'

export async function POST(request: NextRequest) {
  try {
    // Get authenticated user from Supabase
    const supabase = createServerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

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

    // Create new application in database
    const [newApplication] = await db
      .insert(taskParticipants)
      .values({
        taskId: taskId,
        userId: user.id,
        status: 'joined'
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
    // Get authenticated user from Supabase
    const supabase = createServerClient()
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