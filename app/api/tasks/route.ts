import { NextRequest, NextResponse } from 'next/server'
import { db } from '../../../server/db'
import { tasks } from '@shared/schema'
import { eq, desc } from 'drizzle-orm'

export async function GET(request: NextRequest) {
  try {
    // Check if database is available
    if (!process.env.DATABASE_URL) {
      console.warn('DATABASE_URL not available - returning empty array for development')
      return NextResponse.json([])
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    
    const allTasks = type 
      ? await db.select().from(tasks).where(eq(tasks.type, type as any)).orderBy(desc(tasks.createdAt))
      : await db.select().from(tasks).orderBy(desc(tasks.createdAt))
    
    return NextResponse.json(allTasks)
  } catch (error) {
    console.error('Error fetching tasks:', error)
    // Return empty array instead of error to keep UI functional
    return NextResponse.json([])
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate required fields
    if (!body.title || !body.description || !body.hostId) {
      return NextResponse.json(
        { error: 'Missing required fields: title, description, hostId' },
        { status: 400 }
      )
    }

    // Check if database is available
    if (!process.env.DATABASE_URL) {
      console.warn('DATABASE_URL not available - returning mock response for development')
      return NextResponse.json({
        id: `mock-task-${Date.now()}`,
        ...body,
        status: 'open',
        createdAt: new Date().toISOString()
      }, { status: 201 })
    }

    // For barter tasks, earningPotential should be 0
    if (body.type === 'barter' && !body.earningPotential) {
      body.earningPotential = 0
    }

    // Set default values
    const taskData = {
      ...body,
      status: 'open',
      approvalStatus: 'auto_approved', // Auto-approve user-created tasks for now
      currentParticipants: 0,
      earningPotential: body.earningPotential || 0,
      maxParticipants: body.maxParticipants || 1,
    }
    
    const [newTask] = await db
      .insert(tasks)
      .values(taskData)
      .returning()
    
    return NextResponse.json(newTask, { status: 201 })
  } catch (error) {
    console.error('Error creating task:', error)
    return NextResponse.json(
      { error: 'Failed to create task' },
      { status: 500 }
    )
  }
}