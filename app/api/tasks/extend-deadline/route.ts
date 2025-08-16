import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase-server'
import { db } from '../../db'
import { taskParticipants } from '@/shared/schema'
import { eq, and } from 'drizzle-orm'

export async function POST(request: NextRequest) {
  try {
    // Get authenticated user from Supabase
    const supabase = createServerClient(request)
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { taskId, reason } = await request.json()

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

    // Find the user's application for this task
    const [application] = await db
      .select()
      .from(taskParticipants)
      .where(and(
        eq(taskParticipants.taskId, taskId),
        eq(taskParticipants.userId, user.id),
        eq(taskParticipants.status, 'joined')
      ))
      .limit(1)

    if (!application) {
      return NextResponse.json(
        { error: 'Task application not found' },
        { status: 404 }
      )
    }

    // Check if already extended
    if (application.deadlineExtended) {
      return NextResponse.json(
        { error: 'Deadline has already been extended for this task' },
        { status: 400 }
      )
    }

    // Check if deadline has already passed
    if (application.deadline && new Date() > new Date(application.deadline)) {
      return NextResponse.json(
        { error: 'Cannot extend deadline - task has already expired' },
        { status: 400 }
      )
    }

    // Extend deadline by 12 hours
    const currentDeadline = new Date(application.deadline!)
    const newDeadline = new Date(currentDeadline.getTime() + (12 * 60 * 60 * 1000))

    // Update the application with extended deadline
    const [updatedApplication] = await db
      .update(taskParticipants)
      .set({
        deadline: newDeadline,
        deadlineExtended: true,
        extensionRequestedAt: new Date()
      })
      .where(and(
        eq(taskParticipants.taskId, taskId),
        eq(taskParticipants.userId, user.id)
      ))
      .returning()

    return NextResponse.json({
      success: true,
      newDeadline: newDeadline.toISOString(),
      message: 'Deadline extended by 12 hours',
      application: updatedApplication
    })

  } catch (error) {
    console.error('Error extending deadline:', error)
    return NextResponse.json(
      { error: 'Failed to extend deadline' },
      { status: 500 }
    )
  }
}