import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { tasks } from '@shared/schema'
import { eq, desc } from 'drizzle-orm'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    
    let query = db.select().from(tasks)
    
    if (type) {
      query = query.where(eq(tasks.type, type as any))
    }
    
    const allTasks = await query.orderBy(desc(tasks.createdAt))
    
    return NextResponse.json(allTasks)
  } catch (error) {
    console.error('Error fetching tasks:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tasks' },
      { status: 500 }
    )
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