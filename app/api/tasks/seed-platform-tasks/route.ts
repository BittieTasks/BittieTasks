import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error('Missing required Supabase environment variables')
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

// Platform-funded tasks with $8,000/month budget - using correct column names
const platformTasks = [
  {
    title: 'Organize and Photograph Kids\' Artwork Portfolio',
    description: 'Create a digital portfolio of your child\'s artwork throughout the year. Sort, photograph, and create a beautiful memory book that other parents can learn from.',
    earning_potential: 35.00,
    type: 'platform_funded',
    status: 'open',
    max_participants: 10,
    current_participants: 0,
    duration: '2-3 hours',
    difficulty: 'easy',
    requirements: 'Phone/camera, storage folders, labeling supplies. Must have children\'s artwork to organize.',
    location: 'Remote/Home',
    host_id: 'platform-system'
  },
  {
    title: 'Create Meal Prep System for Busy School Mornings',
    description: 'Develop and document a weekly meal prep routine that saves 30+ minutes every morning. Include shopping lists, prep schedules, and kid-friendly options.',
    earning_potential: 42.00,
    type: 'platform_funded',
    status: 'open',
    approval_status: 'approved',
    max_participants: 8,
    duration: '4-5 hours',
    difficulty: 'medium',
    requirements: 'Meal containers, planning notebook, kitchen supplies. Experience with family meal planning.',
    location: 'Remote/Home',
    host_id: 'platform-system'
  },
  {
    title: 'Design Budget-Friendly Birthday Party at Home',
    description: 'Plan and execute a memorable birthday party for under $50. Document decorations, activities, and timeline for other parents to replicate.',
    earning_potential: 38.00,
    type: 'platform_funded',
    status: 'open',
    approval_status: 'approved',
    max_participants: 12,
    duration: '3-4 hours',
    difficulty: 'medium',
    requirements: 'Basic party supplies, creativity, camera for documentation. Must execute actual party.',
    location: 'Remote/Home',
    host_id: 'platform-system'
  },
  {
    title: 'Document Family Fitness Routine for Small Spaces',
    description: 'Create a comprehensive fitness program that families can do together in apartments or small homes. Include modifications for different ages.',
    earning_potential: 45.00,
    type: 'platform_funded',
    status: 'open',
    approval_status: 'approved',
    max_participants: 6,
    duration: '4-5 hours',
    difficulty: 'medium',
    requirements: 'Exercise equipment (optional), camera, measurement tools. Fitness knowledge helpful.',
    location: 'Remote/Home',
    host_id: 'platform-system'
  },
  {
    title: 'Design Math Practice Games for Different Learning Styles',
    description: 'Create visual, auditory, and kinesthetic math games that make practice enjoyable. Focus on common problem areas for elementary students.',
    earning_potential: 52.00,
    type: 'platform_funded',
    status: 'open',
    approval_status: 'approved',
    max_participants: 5,
    duration: '6-7 hours',
    difficulty: 'medium',
    requirements: 'Craft supplies, math manipulatives, game boards. Education background preferred.',
    location: 'Remote/Home',
    host_id: 'platform-system'
  },
  {
    title: 'Create After-School Snack Prep Guide',
    description: 'Develop healthy, kid-approved snacks that can be prepped in advance. Include nutritional info and storage tips for busy families.',
    earning_potential: 32.00,
    type: 'platform_funded',
    status: 'open',
    approval_status: 'approved',
    max_participants: 15,
    duration: '2-3 hours',
    difficulty: 'easy',
    requirements: 'Kitchen access, various healthy ingredients, containers. Nutrition knowledge helpful.',
    location: 'Remote/Home',
    host_id: 'platform-system'
  }
]

export async function POST(request: NextRequest) {
  try {
    console.log('🌱 Seeding platform-funded tasks...')

    // First check if tasks already exist - skip check and just try to insert
    console.log('Skipping existence check, proceeding with insert...')

    // Proceeding with insert

    // Insert platform-funded tasks
    const { data: insertedTasks, error: insertError } = await supabase
      .from('tasks')
      .insert(platformTasks)
      .select()

    if (insertError) {
      console.error('Error inserting tasks:', insertError)
      return NextResponse.json({
        success: false,
        error: 'Failed to insert platform tasks',
        details: insertError
      }, { status: 500 })
    }

    console.log(`✅ Successfully seeded ${insertedTasks?.length || 0} platform-funded tasks`)

    return NextResponse.json({
      success: true,
      message: `Successfully seeded ${insertedTasks?.length || 0} platform-funded tasks`,
      tasks: insertedTasks,
      total_value: platformTasks.reduce((sum, task) => sum + task.earning_potential, 0),
      monthly_budget_impact: `$${platformTasks.reduce((sum, task) => sum + (task.earning_potential * task.max_participants), 0)} max potential (if all slots filled)`
    })

  } catch (error) {
    console.error('Platform task seeding error:', error)
    return NextResponse.json({
      success: false,
      error: 'Platform task seeding failed',
      details: error
    }, { status: 500 })
  }
}