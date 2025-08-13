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
    console.log('🎯 Creating minimal task to test database...')

    // Absolute minimal task using only columns we know exist from the working API
    const minimalTask = {
      title: 'Organize Kids\' Artwork Portfolio',
      description: 'Create a digital portfolio of your child\'s artwork throughout the year. Earn $35 for documenting your organization system.',
      earning_potential: 35.00,
      location: 'Remote/Home',
      duration: '2-3 hours',
      status: 'open'
    }

    console.log('Attempting to insert minimal task:', minimalTask)

    // Insert single minimal task
    const { data: insertedTask, error: insertError } = await supabase
      .from('tasks')
      .insert([minimalTask])
      .select()
      .single()

    if (insertError) {
      console.error('Error inserting minimal task:', insertError)
      return NextResponse.json({
        success: false,
        error: 'Failed to insert minimal task',
        details: insertError,
        attempted_columns: Object.keys(minimalTask)
      }, { status: 500 })
    }

    console.log('✅ Successfully created minimal task:', insertedTask)

    return NextResponse.json({
      success: true,
      message: 'Successfully created minimal platform task',
      task: insertedTask,
      next_step: 'Now we can expand with more tasks using the same column structure'
    })

  } catch (error) {
    console.error('Minimal task creation error:', error)
    return NextResponse.json({
      success: false,
      error: 'Minimal task creation failed',
      details: error
    }, { status: 500 })
  }
}