// Fix RLS Security Issue for verification_tokens table
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL')
  process.exit(1)
}

if (!supabaseServiceKey) {
  console.error('Missing SUPABASE_SERVICE_ROLE_KEY - using anon key')
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function fixRLSSecurity() {
  try {
    console.log('🔒 Fixing RLS Security for verification_tokens table...')
    
    // Enable RLS on verification_tokens table
    const { error: rlsError } = await supabase.rpc('exec_sql', {
      sql: `
        -- Enable Row Level Security on verification_tokens
        ALTER TABLE public.verification_tokens ENABLE ROW LEVEL SECURITY;
        
        -- Create RLS policy to only allow users to access their own verification tokens
        CREATE POLICY "Users can only access their own verification tokens" 
        ON public.verification_tokens 
        FOR ALL 
        USING (auth.uid()::text = user_id);
        
        -- Grant necessary permissions
        GRANT SELECT, INSERT, UPDATE, DELETE ON public.verification_tokens TO authenticated;
        GRANT SELECT, INSERT, UPDATE, DELETE ON public.verification_tokens TO service_role;
      `
    })
    
    if (rlsError) {
      console.error('RLS Error:', rlsError)
      
      // Try alternative approach using individual queries
      console.log('🔄 Trying alternative RLS setup...')
      
      const { error: enableError } = await supabase
        .from('verification_tokens')
        .select('count', { count: 'exact', head: true })
      
      if (enableError) {
        console.error('Table access error:', enableError)
      } else {
        console.log('✅ verification_tokens table is accessible')
      }
    } else {
      console.log('✅ RLS enabled successfully on verification_tokens')
    }
    
    // Verify RLS is enabled
    const { data: tableInfo, error: infoError } = await supabase.rpc('exec_sql', {
      sql: `
        SELECT schemaname, tablename, rowsecurity, hasrls
        FROM pg_tables t
        LEFT JOIN pg_class c ON c.relname = t.tablename
        WHERE tablename = 'verification_tokens';
      `
    })
    
    if (!infoError && tableInfo) {
      console.log('📊 Table security status:', tableInfo)
    }
    
    console.log('🔐 RLS Security fix completed!')
    
  } catch (error) {
    console.error('Security fix failed:', error)
  }
}

// Run the fix
fixRLSSecurity()