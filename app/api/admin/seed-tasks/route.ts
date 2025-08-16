import { NextRequest, NextResponse } from 'next/server'
import { db } from '../../../../server/db'
import { tasks } from '@shared/schema'
import { eq, and } from 'drizzle-orm'

export async function POST(request: NextRequest) {
  try {
    // Check if database is available
    if (!process.env.DATABASE_URL) {
      return NextResponse.json(
        { error: 'Database not available' },
        { status: 503 }
      )
    }

    // Clear existing platform tasks
    await db
      .delete(tasks)
      .where(and(
        eq(tasks.type, 'solo'),
        eq(tasks.creatorId, 'platform')
      ))

    // Insert real solo tasks for production
    const soloTasksData = [
      {
        id: 'platform-001',
        title: 'Laundry Day',
        description: 'Complete a full load of laundry from start to finish: wash, dry, fold, and put away. Take photos showing your clean, folded, and organized clothes.',
        earningPotential: '20.00',
        location: 'Your Home',
        duration: '2 hours',
        difficulty: 'easy',
        requirements: 'Access to washer/dryer, Photo verification',
        maxParticipants: 2,
        type: 'solo',
        status: 'open',
        approvalStatus: 'approved',
        creatorId: 'platform',
        reviewTier: 'auto_approved'
      },
      {
        id: 'platform-002',
        title: 'Kitchen Clean-Up',
        description: 'Wash all dishes and clean kitchen counters thoroughly. Take before/after photos showing your sparkling clean kitchen transformation.',
        earningPotential: '15.00',
        location: 'Your Home',
        duration: '30 minutes',
        difficulty: 'easy',
        requirements: 'Kitchen access, Before/after photos',
        maxParticipants: 2,
        type: 'solo',
        status: 'open',
        approvalStatus: 'approved',
        creatorId: 'platform',
        reviewTier: 'auto_approved'
      },
      {
        id: 'platform-003',
        title: 'Pilates Session',
        description: 'Complete a 30-minute pilates workout session. Share a photo or video of you doing pilates poses and your post-workout state.',
        earningPotential: '12.00',
        location: 'Your Home or Studio',
        duration: '30 minutes',
        difficulty: 'easy',
        requirements: 'Exercise mat, Workout verification photo/video',
        maxParticipants: 2,
        type: 'solo',
        status: 'open',
        approvalStatus: 'approved',
        creatorId: 'platform',
        reviewTier: 'auto_approved'
      },
      {
        id: 'platform-004',
        title: 'Grocery Run',
        description: 'Pick up essential groceries for the week from your local store. Share a photo of your grocery haul or receipt as verification.',
        earningPotential: '25.00',
        location: 'Local Grocery Store',
        duration: '1 hour',
        difficulty: 'easy',
        requirements: 'Transportation to store, Receipt or grocery photo',
        maxParticipants: 2,
        type: 'solo',
        status: 'open',
        approvalStatus: 'approved',
        creatorId: 'platform',
        reviewTier: 'auto_approved'
      },
      {
        id: 'platform-005',
        title: 'Room Organization',
        description: 'Organize and tidy one room in your home completely. Take before and after photos showing the amazing transformation.',
        earningPotential: '30.00',
        location: 'Your Home',
        duration: '1 hour',
        difficulty: 'easy',
        requirements: 'Before/after photos, Room access',
        maxParticipants: 2,
        type: 'solo',
        status: 'open',
        approvalStatus: 'approved',
        creatorId: 'platform',
        reviewTier: 'auto_approved'
      }
    ]

    const insertedTasks = await db
      .insert(tasks)
      .values(soloTasksData)
      .returning()

    return NextResponse.json({
      success: true,
      message: `Seeded ${insertedTasks.length} solo tasks`,
      tasks: insertedTasks
    })

  } catch (error) {
    console.error('Error seeding tasks:', error)
    return NextResponse.json(
      { error: 'Failed to seed tasks' },
      { status: 500 }
    )
  }
}