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
    console.log('🚀 Creating simple platform tasks...')

    // Simple tasks using only the columns we know exist
    const simpleTasks = [
      {
        title: 'Organize Kids\' Artwork Portfolio',
        description: 'Create a digital portfolio of your child\'s artwork throughout the year. Sort, photograph, and create a beautiful memory book.',
        earning_potential: 35.00,
        location: 'Remote/Home',
        duration: '2-3 hours',
        max_participants: 10,
        current_participants: 0,
        status: 'open'
      },
      {
        title: 'Create Meal Prep System for School Mornings',
        description: 'Develop and document a weekly meal prep routine that saves 30+ minutes every morning.',
        earning_potential: 42.00,
        location: 'Remote/Home',
        duration: '4-5 hours',
        max_participants: 8,
        current_participants: 0,
        status: 'open'
      },
      {
        title: 'Design Budget Birthday Party at Home',
        description: 'Plan and execute a memorable birthday party for under $50. Document everything for other parents.',
        earning_potential: 38.00,
        location: 'Remote/Home',
        duration: '3-4 hours',
        max_participants: 12,
        current_participants: 0,
        status: 'open'
      },
      {
        title: 'Family Fitness Routine for Small Spaces',
        description: 'Create a comprehensive fitness program that families can do together in apartments or small homes.',
        earning_potential: 45.00,
        location: 'Remote/Home',
        duration: '4-5 hours',
        max_participants: 6,
        current_participants: 0,
        status: 'open'
      },
      {
        title: 'Math Practice Games for Elementary Kids',
        description: 'Create visual, auditory, and kinesthetic math games that make practice enjoyable.',
        earning_potential: 52.00,
        location: 'Remote/Home',
        duration: '6-7 hours',
        max_participants: 5,
        current_participants: 0,
        status: 'open'
      },
      {
        title: 'After-School Snack Prep Guide',
        description: 'Develop healthy, kid-approved snacks that can be prepped in advance.',
        earning_potential: 32.00,
        location: 'Remote/Home',
        duration: '2-3 hours',
        max_participants: 15,
        current_participants: 0,
        status: 'open'
      }
    ]

    // Insert tasks directly
    const { data: insertedTasks, error: insertError } = await supabase
      .from('tasks')
      .insert(simpleTasks)
      .select()

    if (insertError) {
      console.error('Error inserting tasks:', insertError)
      return NextResponse.json({
        success: false,
        error: 'Failed to insert platform tasks',
        details: insertError
      }, { status: 500 })
    }

    const totalValue = insertedTasks?.reduce((sum, task) => sum + task.earning_potential, 0) || 0
    const maxPotential = insertedTasks?.reduce((sum, task) => sum + (task.earning_potential * task.max_participants), 0) || 0

    console.log(`✅ Successfully created ${insertedTasks?.length || 0} platform-funded tasks`)

    return NextResponse.json({
      success: true,
      message: `Successfully created ${insertedTasks?.length || 0} platform-funded tasks`,
      tasks: insertedTasks,
      total_value: totalValue,
      max_monthly_potential: maxPotential,
      budget_impact: `$${totalValue} base value, up to $${maxPotential} if all slots filled`
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