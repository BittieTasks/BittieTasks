import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

// Mock database for now - will connect to real database later
let tasks: any[] = [
  {
    id: 'task_demo_1',
    title: 'Help with grocery shopping',
    description: 'Need someone to help me carry groceries from the store to my apartment',
    type: 'community',
    category: 'shopping',
    createdBy: '+16036611164',
    createdByName: 'Demo User',
    status: 'open',
    earningPotential: 15.00,
    maxParticipants: 1,
    currentParticipants: 0,
    location: 'Manchester, NH',
    duration: '30 minutes',
    difficulty: 'easy',
    createdAt: new Date('2025-08-26')
  },
  {
    id: 'task_demo_2',
    title: 'Trade: Baking for Yard Work',
    description: 'I can bake fresh cookies and bread for someone who can help rake my yard',
    type: 'barter',
    category: 'trade',
    createdBy: '+16036611164',
    createdByName: 'Demo User',
    status: 'open',
    offering: 'Fresh baked goods (cookies, bread, muffins)',
    seeking: 'Yard work - raking leaves and basic cleanup',
    tradeType: 'service_for_service',
    maxParticipants: 1,
    currentParticipants: 0,
    location: 'Manchester, NH',
    duration: '2 hours',
    difficulty: 'medium',
    createdAt: new Date('2025-08-25')
  },
  {
    id: 'task_demo_3',
    title: 'Complete simple data entry task',
    description: 'Platform-funded task to enter product information from a list into our database',
    type: 'solo',
    category: 'data-entry',
    createdBy: 'platform',
    createdByName: 'BittieTasks Platform',
    status: 'open',
    earningPotential: 12.00,
    maxParticipants: 5,
    currentParticipants: 2,
    location: 'Remote/Online',
    duration: '45 minutes',
    difficulty: 'easy',
    createdAt: new Date('2025-08-24')
  }
]

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const location = searchParams.get('location')
    const category = searchParams.get('category')

    let filteredTasks = tasks

    // Filter by type
    if (type && type !== 'all') {
      filteredTasks = filteredTasks.filter(task => task.type === type)
    }

    // Filter by location
    if (location) {
      filteredTasks = filteredTasks.filter(task => 
        task.location?.toLowerCase().includes(location.toLowerCase())
      )
    }

    // Filter by category
    if (category) {
      filteredTasks = filteredTasks.filter(task => task.category === category)
    }

    return NextResponse.json(filteredTasks)

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
    // Check authentication using our phone auth system
    const cookieStore = await cookies()
    const phoneAuth = cookieStore.get('phone_auth')
    const userInfo = cookieStore.get('user_info')

    if (!phoneAuth || !userInfo) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const user = JSON.parse(userInfo.value)
    const body = await request.json()

    const {
      title,
      description,
      type, // 'solo', 'community', 'barter'
      category,
      earningPotential,
      maxParticipants,
      location,
      duration,
      difficulty,
      requirements,
      offering, // For barter tasks
      seeking, // For barter tasks
      tradeType, // For barter tasks
      scheduledDate,
      tags
    } = body

    // Validation
    if (!title || !description || !type) {
      return NextResponse.json(
        { error: 'Title, description, and type are required' },
        { status: 400 }
      )
    }

    // Validate task type
    if (!['solo', 'community', 'barter'].includes(type)) {
      return NextResponse.json(
        { error: 'Invalid task type. Must be solo, community, or barter' },
        { status: 400 }
      )
    }

    // For barter tasks, require offering and seeking
    if (type === 'barter' && (!offering || !seeking)) {
      return NextResponse.json(
        { error: 'Barter tasks require both offering and seeking fields' },
        { status: 400 }
      )
    }

    // For solo/community tasks, require earning potential
    if ((type === 'solo' || type === 'community') && !earningPotential) {
      return NextResponse.json(
        { error: 'Solo and community tasks require earning potential' },
        { status: 400 }
      )
    }

    const newTask = {
      id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title,
      description,
      type,
      category: category || 'general',
      createdBy: phoneAuth.value,
      createdByName: `${user.firstName} ${user.lastName}`.trim(),
      status: 'open',
      earningPotential: type === 'barter' ? null : parseFloat(earningPotential),
      maxParticipants: maxParticipants || 1,
      currentParticipants: 0,
      location,
      duration,
      difficulty: difficulty || 'medium',
      requirements,
      offering: type === 'barter' ? offering : null,
      seeking: type === 'barter' ? seeking : null,
      tradeType: type === 'barter' ? tradeType : null,
      scheduledDate: scheduledDate ? new Date(scheduledDate) : null,
      tags: tags || [],
      createdAt: new Date(),
      updatedAt: new Date()
    }

    tasks.push(newTask)

    return NextResponse.json({ 
      success: true, 
      task: newTask,
      message: 'Task created successfully!' 
    })

  } catch (error) {
    console.error('Error creating task:', error)
    return NextResponse.json(
      { error: 'Failed to create task' },
      { status: 500 }
    )
  }
}