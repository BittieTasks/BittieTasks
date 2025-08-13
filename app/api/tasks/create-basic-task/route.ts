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
    console.log('🎯 Creating basic task using only confirmed columns...')

    // Use ONLY the columns we see in the GET query that works
    const basicTask = {
      title: 'Organize Kids\' Artwork Portfolio - Platform Task',
      description: 'Create a digital portfolio of your child\'s artwork throughout the year. Earn $35 for documenting your organization system. This is a platform-funded task.',
      earning_potential: 35.00,
      location: 'Remote/Home'
    }

    console.log('Attempting to insert basic task:', basicTask)

    const { data: insertedTask, error: insertError } = await supabase
      .from('tasks')
      .insert([basicTask])
      .select()
      .single()

    if (insertError) {
      console.error('Error inserting basic task:', insertError)
      return NextResponse.json({
        success: false,
        error: 'Failed to insert basic task',
        details: insertError,
        attempted_columns: Object.keys(basicTask)
      }, { status: 500 })
    }

    console.log('✅ Successfully created basic task!')

    // Now let's create 5 more using the same structure
    const moreTasks = [
      {
        title: 'Create Meal Prep System for School Mornings',
        description: 'Develop and document a weekly meal prep routine that saves 30+ minutes every morning. Earn $42 for sharing your system.',
        earning_potential: 42.00,
        location: 'Remote/Home'
      },
      {
        title: 'Design Budget Birthday Party at Home',
        description: 'Plan and execute a memorable birthday party for under $50. Earn $38 for documenting everything.',
        earning_potential: 38.00,
        location: 'Remote/Home'
      },
      {
        title: 'Family Fitness Routine for Small Spaces',
        description: 'Create a comprehensive fitness program that families can do together in apartments. Earn $45.',
        earning_potential: 45.00,
        location: 'Remote/Home'
      },
      {
        title: 'Math Practice Games for Elementary Kids',
        description: 'Create visual, auditory, and kinesthetic math games that make practice enjoyable. Earn $52.',
        earning_potential: 52.00,
        location: 'Remote/Home'
      },
      {
        title: 'After-School Snack Prep Guide',
        description: 'Develop healthy, kid-approved snacks that can be prepped in advance. Earn $32.',
        earning_potential: 32.00,
        location: 'Remote/Home'
      }
    ]

    const { data: moreTasks_inserted, error: moreError } = await supabase
      .from('tasks')
      .insert(moreTasks)
      .select()

    if (moreError) {
      console.error('Error inserting additional tasks:', moreError)
      // Return success for first task even if others failed
      return NextResponse.json({
        success: true,
        message: 'Created 1 task successfully, additional tasks failed',
        task: insertedTask,
        additional_error: moreError
      })
    }

    const allTasks = [insertedTask, ...(moreTasks_inserted || [])]
    const totalValue = allTasks.reduce((sum, task) => sum + task.earning_potential, 0)

    console.log(`✅ Successfully created ${allTasks.length} platform tasks!`)

    return NextResponse.json({
      success: true,
      message: `Successfully created ${allTasks.length} platform-funded tasks`,
      tasks: allTasks,
      total_value: totalValue,
      budget_impact: `$${totalValue} total earning potential from platform budget`
    })

  } catch (error) {
    console.error('Basic task creation error:', error)
    return NextResponse.json({
      success: false,
      error: 'Basic task creation failed',
      details: error
    }, { status: 500 })
  }
}