import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { db } from '../../../server/db'
import { tasks } from '@shared/schema'
import { eq, and } from 'drizzle-orm'

// Fallback solo tasks for production use when database is not available
const fallbackSoloTasks = [
  {
    id: 'platform-001',
    title: 'Laundry Day',
    description: 'Complete a full load of laundry from start to finish: wash, dry, fold, and put away. Take photos showing your clean, folded, and organized clothes.',
    price: 20,
    location: 'Your Home',
    timeEstimate: '2 hours',
    category: 'Home Organization',
    difficulty: 'Easy',
    requiredSkills: ['Access to washer/dryer', 'Photo verification'],
    rating: 4.9,
    completedCount: 0,
    maxUsers: 2,
    platform_funded: true,
    verification_type: 'photo'
  },
  {
    id: 'platform-002',
    title: 'Kitchen Clean-Up',
    description: 'Wash all dishes and clean kitchen counters thoroughly. Take before/after photos showing your sparkling clean kitchen transformation.',
    price: 15,
    location: 'Your Home',
    timeEstimate: '30 minutes',
    category: 'Home Organization',
    difficulty: 'Easy',
    requiredSkills: ['Kitchen access', 'Before/after photos'],
    rating: 4.8,
    completedCount: 0,
    maxUsers: 2,
    platform_funded: true,
    verification_type: 'photo'
  },
  {
    id: 'platform-003',
    title: 'Pilates Session',
    description: 'Complete a 30-minute pilates workout session. Share a photo or video of you doing pilates poses and your post-workout state.',
    price: 12,
    location: 'Your Home or Studio',
    timeEstimate: '30 minutes',
    category: 'Health & Fitness',
    difficulty: 'Easy',
    requiredSkills: ['Exercise mat', 'Workout verification photo/video'],
    rating: 4.7,
    completedCount: 0,
    maxUsers: 2,
    platform_funded: true,
    verification_type: 'photo'
  },
  {
    id: 'platform-004',
    title: 'Grocery Run',
    description: 'Pick up essential groceries for the week from your local store. Share a photo of your grocery haul or receipt as verification.',
    price: 25,
    location: 'Local Grocery Store',
    timeEstimate: '1 hour',
    category: 'Transportation',
    difficulty: 'Easy',
    requiredSkills: ['Transportation to store', 'Receipt or grocery photo'],
    rating: 4.6,
    completedCount: 0,
    maxUsers: 2,
    platform_funded: true,
    verification_type: 'photo'
  },
  {
    id: 'platform-005',
    title: 'Room Organization',
    description: 'Organize and tidy one room in your home completely. Take before and after photos showing the amazing transformation.',
    price: 30,
    location: 'Your Home',
    timeEstimate: '1 hour',
    category: 'Home Organization',
    difficulty: 'Easy',
    requiredSkills: ['Before/after photos', 'Room access'],
    rating: 4.5,
    completedCount: 0,
    maxUsers: 2,
    platform_funded: true,
    verification_type: 'photo'
  }
]

// Get live solo tasks from database
export async function GET(request: NextRequest) {
  try {
    // Check if database is available
    if (!process.env.DATABASE_URL) {
      console.log('DATABASE_URL not set, using fallback tasks')
      return NextResponse.json({ tasks: fallbackSoloTasks })
    }

    // Try to get platform-funded solo tasks from database
    const soloTasks = await db
      .select({
        id: tasks.id,
        title: tasks.title,
        description: tasks.description,
        price: tasks.earningPotential,
        location: tasks.location,
        timeEstimate: tasks.duration,
        category: tasks.categoryId,
        difficulty: tasks.difficulty,
        requirements: tasks.requirements,
        maxUsers: tasks.maxParticipants,
        status: tasks.status,
        type: tasks.type,
        createdAt: tasks.createdAt
      })
      .from(tasks)
      .where(and(
        eq(tasks.type, 'solo'),
        eq(tasks.status, 'open'),
        eq(tasks.approvalStatus, 'approved')
      ))
      .orderBy(tasks.createdAt)
      .limit(20)

    // Transform for frontend compatibility
    const formattedTasks = soloTasks.map((task: any) => ({
      id: task.id,
      title: task.title,
      description: task.description,
      price: Number(task.price || 0),
      location: task.location || 'Your Location',
      timeEstimate: task.timeEstimate || '1 hour',
      category: task.category || 'General',
      difficulty: (task.difficulty as 'Easy' | 'Medium' | 'Hard') || 'Easy',
      requiredSkills: task.requirements ? task.requirements.split(',').map((s: string) => s.trim()) : ['Photo verification'],
      rating: 4.8, // Default rating
      completedCount: 0, // TODO: Calculate from actual completions
      maxUsers: task.maxUsers || 2,
      platform_funded: true,
      verification_type: 'photo'
    }))

    return NextResponse.json({ tasks: formattedTasks })

  } catch (error) {
    console.error('Error fetching solo tasks from database, using fallback:', error)
    // Return fallback tasks if database fails
    return NextResponse.json({ tasks: fallbackSoloTasks })
  }
}

// Create new platform-funded solo task (Admin only)
export async function POST(request: NextRequest) {
  try {
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
      return NextResponse.json(
        { error: 'Database not available' },
        { status: 503 }
      )
    }

    const {
      title,
      description,
      earningPotential,
      location,
      duration,
      difficulty,
      requirements,
      maxParticipants
    } = await request.json()

    // Validate required fields
    if (!title || !description || !earningPotential) {
      return NextResponse.json(
        { error: 'Title, description, and earning potential are required' },
        { status: 400 }
      )
    }

    // Create new solo task
    const [newTask] = await db
      .insert(tasks)
      .values({
        title,
        description,
        earningPotential: earningPotential.toString(),
        location: location || 'Your Location',
        duration: duration || '1 hour',
        difficulty: difficulty || 'easy',
        requirements: Array.isArray(requirements) ? requirements.join(', ') : requirements,
        maxParticipants: maxParticipants || 2,
        type: 'solo',
        status: 'open',
        approvalStatus: 'approved', // Auto-approve platform tasks
        creatorId: 'platform', // Platform-created task
        reviewTier: 'auto_approved'
      })
      .returning()

    return NextResponse.json({
      success: true,
      task: newTask,
      message: 'Solo task created successfully'
    })

  } catch (error) {
    console.error('Error creating solo task:', error)
    return NextResponse.json(
      { error: 'Failed to create solo task' },
      { status: 500 }
    )
  }
}