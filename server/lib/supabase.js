import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing required Supabase environment variables for server')
}

// Server-side Supabase client with service role key for admin operations
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// Helper function to verify JWT token from client
export async function verifySupabaseJWT(token) {
  try {
    const { data, error } = await supabaseAdmin.auth.getUser(token)
    if (error) throw error
    return { user: data.user, error: null }
  } catch (error) {
    return { user: null, error }
  }
}