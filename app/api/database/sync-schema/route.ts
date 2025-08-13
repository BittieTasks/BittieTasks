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
    console.log('🔧 Syncing database schema...')

    // Add missing columns to tasks table
    const schemaUpdates = `
      -- Add missing columns to tasks table
      ALTER TABLE tasks 
      ADD COLUMN IF NOT EXISTS earning_potential DECIMAL(8,2),
      ADD COLUMN IF NOT EXISTS duration VARCHAR,
      ADD COLUMN IF NOT EXISTS current_participants INTEGER DEFAULT 0,
      ADD COLUMN IF NOT EXISTS approval_status VARCHAR DEFAULT 'pending',
      ADD COLUMN IF NOT EXISTS host_id VARCHAR;

      -- Update existing tasks that might have null values
      UPDATE tasks 
      SET 
        earning_potential = 25.00 WHERE earning_potential IS NULL,
        current_participants = 0 WHERE current_participants IS NULL,
        approval_status = 'pending' WHERE approval_status IS NULL,
        host_id = 'legacy' WHERE host_id IS NULL;

      -- Create indexes for performance
      CREATE INDEX IF NOT EXISTS idx_tasks_earning_potential ON tasks(earning_potential);
      CREATE INDEX IF NOT EXISTS idx_tasks_approval_status ON tasks(approval_status);
      CREATE INDEX IF NOT EXISTS idx_tasks_host_id ON tasks(host_id);
    `

    const { data, error } = await supabase.rpc('exec_sql', { sql: schemaUpdates })

    if (error) {
      console.error('Schema sync error:', error)
      return NextResponse.json({
        success: false,
        error: 'Schema sync failed',
        details: error,
        sql_to_run_manually: schemaUpdates
      }, { status: 500 })
    }

    // Verify the schema was updated
    const { data: columns, error: columnError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable')
      .eq('table_name', 'tasks')
      .eq('table_schema', 'public')
      .order('ordinal_position')

    console.log('✅ Schema sync completed')

    return NextResponse.json({
      success: true,
      message: 'Database schema synchronized successfully',
      columns_added: [
        'earning_potential',
        'duration', 
        'current_participants',
        'approval_status',
        'host_id'
      ],
      current_schema: columns,
      next_step: 'Ready to create platform tasks'
    })

  } catch (error) {
    console.error('Schema sync failed:', error)
    return NextResponse.json({
      success: false,
      error: 'Schema synchronization failed',
      details: error
    }, { status: 500 })
  }
}