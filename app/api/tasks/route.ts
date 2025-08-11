import { NextRequest, NextResponse } from 'next/server'
import { storage } from '@/server/storage'

export async function GET() {
  try {
    const tasks = await storage.getAllTasks()
    return NextResponse.json(tasks)
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
    const taskData = await request.json()
    const task = await storage.createTask(taskData)
    return NextResponse.json(task)
  } catch (error) {
    console.error('Error creating task:', error)
    return NextResponse.json(
      { error: 'Failed to create task' },
      { status: 500 }
    )
  }
}