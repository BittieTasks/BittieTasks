import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error('Missing required Supabase environment variables')
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export async function POST(request: NextRequest) {
  try {
    console.log('🎯 Creating RLS-compliant platform tasks...')
    
    // Using Supabase client

    // Use the same pattern as the working task creation API
    const platformTasks = [
      {
        title: 'Organize Kids\' Artwork Portfolio - Platform Task',
        description: 'Create a digital portfolio of your child\'s artwork throughout the year. Earn $35 for documenting your organization system. This is a platform-funded earning opportunity.',
        earning_potential: 35.00,
        type: 'platform_funded',
        status: 'open',
        max_participants: 10,
        current_participants: 0,
        host_id: 'platform-system' // Required for RLS policy
      },
      {
        title: 'Create Meal Prep System for School Mornings',
        description: 'Develop and document a weekly meal prep routine that saves 30+ minutes every morning. Earn $42 for sharing your system with other families.',
        earning_potential: 42.00,
        type: 'platform_funded',
        status: 'open',
        max_participants: 8,
        current_participants: 0,
        host_id: 'platform-system'
      },
      {
        title: 'Design Budget Birthday Party at Home',
        description: 'Plan and execute a memorable birthday party for under $50. Earn $38 for documenting decorations, activities, and timeline.',
        earning_potential: 38.00,
        type: 'platform_funded',
        status: 'open',
        max_participants: 12,
        current_participants: 0,
        host_id: 'platform-system'
      },
      {
        title: 'Family Fitness Routine for Small Spaces',
        description: 'Create a comprehensive fitness program that families can do together in apartments or small homes. Earn $45.',
        earning_potential: 45.00,
        type: 'platform_funded',
        status: 'open',
        max_participants: 6,
        current_participants: 0,
        host_id: 'platform-system'
      },
      {
        title: 'Math Practice Games for Elementary Kids',
        description: 'Create visual, auditory, and kinesthetic math games that make practice enjoyable. Earn $52.',
        earning_potential: 52.00,
        type: 'platform_funded',
        status: 'open',
        max_participants: 5,
        current_participants: 0,
        host_id: 'platform-system'
      },
      {
        title: 'After-School Snack Prep Guide',
        description: 'Develop healthy, kid-approved snacks that can be prepped in advance. Include nutritional info. Earn $32.',
        earning_potential: 32.00,
        type: 'platform_funded',
        status: 'open',
        max_participants: 15,
        current_participants: 0,
        host_id: 'platform-system'
      },
      {
        title: 'Pantry Organization System',
        description: 'Design an efficient pantry organization system with clear labeling for easy meal planning. Earn $28.',
        earning_potential: 28.00,
        type: 'platform_funded',
        status: 'open',
        max_participants: 12,
        current_participants: 0,
        host_id: 'platform-system'
      },
      {
        title: 'Reading Comprehension Activities',
        description: 'Create engaging activities that improve reading skills for elementary students. Earn $45.',
        earning_potential: 45.00,
        type: 'platform_funded',
        status: 'open',
        max_participants: 6,
        current_participants: 0,
        host_id: 'platform-system'
      },
      {
        title: 'Morning Routine Optimization',
        description: 'Design 15-minute morning routines that reduce stress and increase energy for busy families. Earn $30.',
        earning_potential: 30.00,
        type: 'platform_funded',
        status: 'open',
        max_participants: 18,
        current_participants: 0,
        host_id: 'platform-system'
      },
      {
        title: 'Digital Photo Organization',
        description: 'Create a family photo organization system with cloud storage and easy retrieval methods. Earn $30.',
        earning_potential: 30.00,
        type: 'platform_funded',
        status: 'open',
        max_participants: 14,
        current_participants: 0,
        host_id: 'platform-system'
      }
    ]

    console.log(`Attempting to insert ${platformTasks.length} RLS-compliant tasks...`)

    // Insert using service client (bypasses RLS)
    const { data: insertedTasks, error: insertError } = await supabase
      .from('tasks')
      .insert(platformTasks)
      .select()

    if (insertError) {
      console.error('Error inserting RLS-compliant tasks:', insertError)
      return NextResponse.json({
        success: false,
        error: 'Failed to insert RLS-compliant tasks',
        details: insertError,
        note: 'Using service client to bypass RLS restrictions'
      }, { status: 500 })
    }

    const totalValue = insertedTasks?.reduce((sum, task) => sum + task.earning_potential, 0) || 0

    console.log(`✅ Successfully created ${insertedTasks?.length || 0} platform tasks!`)

    return NextResponse.json({
      success: true,
      message: `Successfully created ${insertedTasks?.length || 0} platform-funded tasks`,
      tasks_created: insertedTasks?.length || 0,
      total_value: totalValue,
      budget_impact: `$${totalValue} total earning potential`,
      marketplace_status: 'BittieTasks marketplace is now live with earning opportunities!',
      task_summary: {
        'Artwork Portfolio': '$35',
        'Meal Prep System': '$42', 
        'Birthday Party Planning': '$38',
        'Family Fitness': '$45',
        'Math Games': '$52',
        'Snack Prep': '$32',
        'Pantry Organization': '$28',
        'Reading Activities': '$45',
        'Morning Routines': '$30',
        'Photo Organization': '$30'
      }
    })

  } catch (error) {
    console.error('RLS-compliant task creation error:', error)
    return NextResponse.json({
      success: false,
      error: 'RLS-compliant task creation failed',
      details: error
    }, { status: 500 })
  }
}