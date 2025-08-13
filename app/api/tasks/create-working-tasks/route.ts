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
    console.log('🎯 Creating tasks using only confirmed working columns...')

    // Use ONLY the columns we know work from the GET API
    const workingTasks = [
      {
        title: 'Organize Kids\' Artwork Portfolio - Platform Task',
        description: 'Create a digital portfolio of your child\'s artwork throughout the year. Earn $35 for documenting your organization system. This is a platform-funded earning opportunity.',
        earning_potential: 35.00
      },
      {
        title: 'Create Meal Prep System for School Mornings',
        description: 'Develop and document a weekly meal prep routine that saves 30+ minutes every morning. Earn $42 for sharing your system with other families.',
        earning_potential: 42.00
      },
      {
        title: 'Design Budget Birthday Party at Home',
        description: 'Plan and execute a memorable birthday party for under $50. Earn $38 for documenting decorations, activities, and timeline for other parents.',
        earning_potential: 38.00
      },
      {
        title: 'Family Fitness Routine for Small Spaces',
        description: 'Create a comprehensive fitness program that families can do together in apartments or small homes. Earn $45 for your exercise guide.',
        earning_potential: 45.00
      },
      {
        title: 'Math Practice Games for Elementary Kids',
        description: 'Create visual, auditory, and kinesthetic math games that make practice enjoyable for children. Earn $52 for your educational content.',
        earning_potential: 52.00
      },
      {
        title: 'After-School Snack Prep Guide',
        description: 'Develop healthy, kid-approved snacks that can be prepped in advance. Include nutritional info and storage tips. Earn $32.',
        earning_potential: 32.00
      },
      {
        title: 'Pantry Organization System',
        description: 'Design an efficient pantry organization system with clear labeling for easy meal planning. Earn $28 for your organization guide.',
        earning_potential: 28.00
      },
      {
        title: 'Kids\' Room Organization Solutions',
        description: 'Create functional and fun organization systems that kids can maintain themselves. Earn $33 for your organization strategy.',
        earning_potential: 33.00
      },
      {
        title: 'Reading Comprehension Activities',
        description: 'Create engaging activities that improve reading skills for elementary students. Earn $45 for your educational materials.',
        earning_potential: 45.00
      },
      {
        title: 'Morning Routine Optimization for Families',
        description: 'Design 15-minute morning routines that reduce stress and increase energy for busy families. Earn $30 for your routine guide.',
        earning_potential: 30.00
      }
    ]

    console.log(`Attempting to insert ${workingTasks.length} tasks using minimal columns...`)

    // Insert tasks using only the columns that work
    const { data: insertedTasks, error: insertError } = await supabase
      .from('tasks')
      .insert(workingTasks)
      .select()

    if (insertError) {
      console.error('Error inserting working tasks:', insertError)
      return NextResponse.json({
        success: false,
        error: 'Failed to insert working tasks',
        details: insertError,
        attempted_columns: Object.keys(workingTasks[0])
      }, { status: 500 })
    }

    const totalValue = insertedTasks?.reduce((sum, task) => sum + task.earning_potential, 0) || 0

    console.log(`✅ Successfully created ${insertedTasks?.length || 0} platform tasks!`)

    return NextResponse.json({
      success: true,
      message: `Successfully created ${insertedTasks?.length || 0} platform-funded tasks`,
      tasks: insertedTasks,
      total_value: totalValue,
      budget_impact: `$${totalValue} total earning potential from platform budget`,
      marketplace_status: 'BittieTasks now has earning opportunities available!',
      next_steps: [
        'Tasks are now visible on the website',
        'Users can browse and apply for these platform-funded opportunities',
        'Each task provides clear earning potential and requirements'
      ]
    })

  } catch (error) {
    console.error('Working task creation error:', error)
    return NextResponse.json({
      success: false,
      error: 'Working task creation failed',
      details: error
    }, { status: 500 })
  }
}