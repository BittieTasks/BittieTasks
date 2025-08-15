import { NextRequest, NextResponse } from 'next/server'
import { db } from '../../../../server/db'
import { tasks, taskParticipants } from '@shared/schema'
import { eq, desc } from 'drizzle-orm'

export async function GET(request: NextRequest) {
  try {
    // TODO: Get actual user ID from authentication
    const userId = 'demo-user' // Replace with actual auth
    
    // Fetch user's task applications
    const userApplications = await db
      .select({
        id: tasks.id,
        title: tasks.title,
        status: taskParticipants.status,
        payout: tasks.earningPotential,
        location: tasks.location,
        applied_at: taskParticipants.joinedAt,
        task_type: tasks.type,
      })
      .from(taskParticipants)
      .innerJoin(tasks, eq(taskParticipants.taskId, tasks.id))
      .where(eq(taskParticipants.userId, userId))
      .orderBy(desc(taskParticipants.joinedAt))
    
    // Transform to match expected interface
    const formattedApplications = userApplications.map((app: any) => ({
      id: app.id,
      title: app.title,
      status: app.status as 'applied' | 'accepted' | 'completed' | 'verified',
      payout: Number(app.payout || 0),
      location: app.location || 'Location TBD',
      applied_at: app.applied_at?.toISOString() || new Date().toISOString(),
      task_type: app.task_type as 'shared' | 'solo' | 'sponsored',
    }))
    
    return NextResponse.json(formattedApplications)
  } catch (error) {
    console.error('Error fetching task applications:', error)
    return NextResponse.json(
      { error: 'Failed to fetch task applications' },
      { status: 500 }
    )
  }
}