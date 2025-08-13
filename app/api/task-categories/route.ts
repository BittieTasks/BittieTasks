import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error('Missing required Supabase environment variables')
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export async function GET(request: NextRequest) {
  try {
    console.log('Fetching task categories...')

    const { data: categories, error } = await supabase
      .from('task_categories')
      .select('*')
      .order('name')

    if (error) {
      console.error('Error fetching task categories:', error)
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch task categories',
        details: error
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      categories: categories || [],
      count: categories?.length || 0
    })

  } catch (error) {
    console.error('Task categories fetch error:', error)
    return NextResponse.json({
      success: false,
      error: 'Task categories fetch failed',
      details: error
    }, { status: 500 })
  }
}