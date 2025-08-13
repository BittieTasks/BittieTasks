import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    console.log('🔒 Applying RLS Security Fix...')
    
    // Check if verification_tokens table exists and get current RLS status
    const { data: tableData, error: tableError } = await supabase
      .from('verification_tokens')
      .select('count', { count: 'exact', head: true })
    
    if (tableError) {
      return NextResponse.json({
        success: false,
        error: 'verification_tokens table not accessible',
        details: tableError
      }, { status: 500 })
    }
    
    // Apply RLS fix using Supabase Admin API
    const sqlCommands = `
      -- Enable Row Level Security on verification_tokens
      ALTER TABLE public.verification_tokens ENABLE ROW LEVEL SECURITY;
      
      -- Drop existing policy if it exists
      DROP POLICY IF EXISTS "Users can only access their own verification tokens" ON public.verification_tokens;
      
      -- Create RLS policy to only allow users to access their own verification tokens
      CREATE POLICY "Users can only access their own verification tokens" 
      ON public.verification_tokens 
      FOR ALL 
      USING (auth.uid()::text = user_id);
      
      -- Grant necessary permissions
      GRANT SELECT, INSERT, UPDATE, DELETE ON public.verification_tokens TO authenticated;
      GRANT SELECT, INSERT, UPDATE, DELETE ON public.verification_tokens TO service_role;
    `
    
    // Execute SQL commands
    const { data: sqlResult, error: sqlError } = await supabase.rpc('exec_sql', {
      sql: sqlCommands
    })
    
    if (sqlError) {
      console.error('SQL execution error:', sqlError)
      return NextResponse.json({
        success: false,
        error: 'Failed to execute RLS commands',
        details: sqlError,
        message: 'Please apply RLS fix manually in Supabase Dashboard'
      }, { status: 500 })
    }
    
    return NextResponse.json({
      success: true,
      message: '✅ RLS Security fix applied successfully',
      actions: [
        'Enabled Row Level Security on verification_tokens table',
        'Created policy for user-specific access',
        'Granted proper permissions to authenticated users'
      ],
      nextSteps: [
        'Test email verification flow',
        'Verify RLS is working correctly',
        'Monitor for any authentication issues'
      ]
    })
    
  } catch (error) {
    console.error('RLS fix error:', error)
    return NextResponse.json({
      success: false,
      error: 'RLS security fix failed',
      details: error,
      manualFix: {
        instructions: 'Apply RLS fix manually in Supabase Dashboard SQL Editor',
        sql: `
          ALTER TABLE public.verification_tokens ENABLE ROW LEVEL SECURITY;
          CREATE POLICY "Users can only access their own verification tokens" 
          ON public.verification_tokens FOR ALL USING (auth.uid()::text = user_id);
        `
      }
    }, { status: 500 })
  }
}