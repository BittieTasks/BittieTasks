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
    console.log('🔍 Checking database schema...')

    // Check tasks table structure - try RPC first, fallback to direct query
    let tasksSchema, tasksError
    
    const rpcResult = await supabase.rpc('get_table_columns', { table_name: 'tasks' })
    
    if (rpcResult.error) {
      // RPC doesn't exist, try direct query
      const fallbackResult = await supabase
        .from('information_schema.columns')
        .select('column_name, data_type')
        .eq('table_name', 'tasks')
        .eq('table_schema', 'public')
      
      tasksSchema = fallbackResult.data
      tasksError = fallbackResult.error
    } else {
      tasksSchema = rpcResult.data
      tasksError = rpcResult.error
    }

    // Try to get existing tasks to understand current structure
    const { data: sampleTask, error: sampleError } = await supabase
      .from('tasks')
      .select('*')
      .limit(1)
      .single()

    return NextResponse.json({
      success: true,
      database_info: {
        tasks_table_exists: !tasksError,
        sample_task: sampleTask,
        schema_info: tasksSchema,
        errors: {
          tasks_error: tasksError,
          sample_error: sampleError
        }
      },
      recommendations: [
        'Check if tasks table exists',
        'Verify column names match schema',
        'Confirm data types are correct'
      ]
    })

  } catch (error) {
    console.error('Schema check error:', error)
    return NextResponse.json({
      success: false,
      error: 'Schema check failed',
      details: error
    }, { status: 500 })
  }
}