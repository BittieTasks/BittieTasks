import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Use service role key for admin operations
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(request: NextRequest) {
  try {
    console.log('Creating verification_tokens table...')
    
    // Simple table creation using direct SQL
    const createSQL = `
      CREATE TABLE IF NOT EXISTS verification_tokens (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id TEXT NOT NULL,
        email TEXT NOT NULL,
        token TEXT NOT NULL UNIQUE,
        expires_at TIMESTAMPTZ NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
      );
      
      CREATE INDEX IF NOT EXISTS idx_verification_tokens_token ON verification_tokens(token);
      CREATE INDEX IF NOT EXISTS idx_verification_tokens_user_id ON verification_tokens(user_id);
    `
    
    // Insert table creation as a manual record first (this will create the table implicitly)
    const { data: testData, error: testError } = await supabaseAdmin
      .from('verification_tokens')
      .insert([{
        id: 'test-table-creation',
        user_id: 'test-user',
        email: 'test@example.com',
        token: 'test-token-' + Date.now(),
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      }])
      .select()
    
    if (testError) {
      console.log('Table creation test error (expected):', testError.message)
      
      // If table doesn't exist, we'll use a simpler approach
      return NextResponse.json({
        success: false,
        message: 'Table needs to be created manually in Supabase dashboard',
        sql: createSQL,
        error: testError.message,
        action: 'CREATE_TABLE_MANUALLY'
      })
    } else {
      // Clean up test data
      await supabaseAdmin
        .from('verification_tokens')
        .delete()
        .eq('id', 'test-table-creation')
      
      return NextResponse.json({
        success: true,
        message: 'verification_tokens table exists and is working!',
        action: 'TABLE_READY'
      })
    }
  } catch (error) {
    console.error('Table creation error:', error)
    return NextResponse.json({
      success: false,
      message: 'Error testing table: ' + (error as Error).message,
      action: 'ERROR'
    }, { status: 500 })
  }
}