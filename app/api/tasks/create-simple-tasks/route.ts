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
    console.log('🎯 Creating simple platform tasks using only existing columns...')

    // Use ONLY the columns that already exist in the database
    const simpleTasks = [
      {
        title: 'Organize Kids\' Artwork Portfolio',
        description: 'Create a digital portfolio of your child\'s artwork throughout the year. Earn $35 by documenting your organization system and sharing tips with other families.',
        category_id: 1,
        type: 'platform_funded',
        status: 'open'
      },
      {
        title: 'Create Meal Prep System',
        description: 'Develop and document a weekly meal prep routine that saves 30+ minutes every morning. Earn $42 for sharing your efficient system.',
        category_id: 2,
        type: 'platform_funded', 
        status: 'open'
      },
      {
        title: 'Design Budget Birthday Party',
        description: 'Plan and execute a memorable birthday party for under $50. Earn $38 for documenting decorations, activities, and timeline.',
        category_id: 1,
        type: 'platform_funded',
        status: 'open'
      },
      {
        title: 'Family Fitness Routine',
        description: 'Create a comprehensive fitness program that families can do together in small spaces. Earn $45 for your exercise guide.',
        category_id: 3,
        type: 'platform_funded',
        status: 'open'
      },
      {
        title: 'Math Practice Games',
        description: 'Create visual, auditory, and kinesthetic math games that make practice enjoyable for children. Earn $52.',
        category_id: 4,
        type: 'platform_funded',
        status: 'open'
      },
      {
        title: 'After-School Snack Prep',
        description: 'Develop healthy, kid-approved snacks that can be prepped in advance. Include nutritional info and storage tips. Earn $32.',
        category_id: 2,
        type: 'platform_funded',
        status: 'open'
      },
      {
        title: 'Pantry Organization System',
        description: 'Design an efficient pantry organization system with clear labeling for easy meal planning. Earn $28.',
        category_id: 1,
        type: 'platform_funded',
        status: 'open'
      },
      {
        title: 'Reading Comprehension Activities',
        description: 'Create engaging activities that improve reading skills for elementary students. Earn $45.',
        category_id: 4,
        type: 'platform_funded',
        status: 'open'
      },
      {
        title: 'Morning Routine Optimization',
        description: 'Design 15-minute morning routines that reduce stress and increase energy for busy families. Earn $30.',
        category_id: 5,
        type: 'platform_funded',
        status: 'open'
      },
      {
        title: 'Digital Photo Organization',
        description: 'Create a family photo organization system with cloud storage and easy retrieval methods. Earn $30.',
        category_id: 1,
        type: 'platform_funded',
        status: 'open'
      }
    ]

    console.log(`Attempting to insert ${simpleTasks.length} simple tasks...`)

    // Insert tasks using only basic columns
    const { data: insertedTasks, error: insertError } = await supabase
      .from('tasks')
      .insert(simpleTasks)
      .select()

    if (insertError) {
      console.error('Error inserting simple tasks:', insertError)
      return NextResponse.json({
        success: false,
        error: 'Failed to insert simple tasks',
        details: insertError,
        attempted_columns: Object.keys(simpleTasks[0])
      }, { status: 500 })
    }

    console.log(`✅ Successfully created ${insertedTasks?.length || 0} platform tasks!`)

    return NextResponse.json({
      success: true,
      message: `Successfully created ${insertedTasks?.length || 0} platform-funded tasks`,
      tasks_created: insertedTasks?.length || 0,
      marketplace_status: 'BittieTasks marketplace is now live with earning opportunities!',
      tasks: insertedTasks?.map(task => ({
        id: task.id,
        title: task.title,
        description: task.description.substring(0, 100) + '...',
        category_id: task.category_id,
        type: task.type,
        status: task.status
      })),
      next_steps: [
        'Tasks are now visible on the website',
        'Users can browse and apply for platform-funded opportunities',
        'Database schema can be updated later to add earning amounts'
      ]
    })

  } catch (error) {
    console.error('Simple task creation error:', error)
    return NextResponse.json({
      success: false,
      error: 'Simple task creation failed',
      details: error
    }, { status: 500 })
  }
}