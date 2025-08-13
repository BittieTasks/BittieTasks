import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function createVerificationTable() {
  try {
    // Create verification_tokens table using SQL
    const { error } = await supabase
      .from('_sql')
      .select('*')
      .limit(1)
    
    // If that fails, try creating with raw SQL
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS verification_tokens (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        user_id UUID NOT NULL,
        email TEXT NOT NULL,
        token TEXT NOT NULL UNIQUE,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
      
      CREATE INDEX IF NOT EXISTS idx_verification_tokens_token ON verification_tokens(token);
      CREATE INDEX IF NOT EXISTS idx_verification_tokens_user_id ON verification_tokens(user_id);
      CREATE INDEX IF NOT EXISTS idx_verification_tokens_expires_at ON verification_tokens(expires_at);
    `
    
    console.log('Attempting to create verification_tokens table...')
    
    // Use Supabase SQL editor approach
    const { data, error: sqlError } = await supabase.rpc('exec_sql', { 
      sql: createTableSQL 
    })
    
    if (sqlError) {
      console.error('SQL creation error:', sqlError)
      return false
    }
    
    console.log('Table creation result:', data)
    return true
  } catch (error) {
    console.error('Database setup error:', error)
    return false
  }
}

export async function ensureVerificationTable() {
  // Test if table exists by trying to select from it
  try {
    const { error } = await supabase
      .from('verification_tokens')
      .select('id')
      .limit(1)
    
    if (error?.code === 'PGRST205') {
      // Table doesn't exist, create it
      console.log('verification_tokens table not found, creating...')
      return await createVerificationTable()
    }
    
    console.log('verification_tokens table exists')
    return true
  } catch (error) {
    console.error('Table check error:', error)
    return false
  }
}