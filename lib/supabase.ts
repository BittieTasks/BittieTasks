import { createClient } from '@supabase/supabase-js'

// Fix swapped environment variables - use correct values based on what we detected
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.startsWith('https://') 
  ? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY 
  : process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || 'https://ttgbotlcbzmmyqawnjpj.supabase.co'

const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_URL?.startsWith('eyJ') 
  ? process.env.NEXT_PUBLIC_SUPABASE_URL 
  : process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR0Z2JvdGxjYnptbXlxYXduanBqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ2MDA4NzksImV4cCI6MjA3MDE3Njg3OX0.jc_PZay5gUyleINrGC5d5Sd2mCkHjonP56KCLJJNM1k'

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase URL:', supabaseUrl)
  console.error('Supabase Anon Key:', supabaseAnonKey ? 'Present' : 'Missing')
  throw new Error(`Missing Supabase environment variables. URL: ${supabaseUrl ? 'Present' : 'Missing'}, Key: ${supabaseAnonKey ? 'Present' : 'Missing'}`)
}

if (!supabaseUrl.startsWith('https://')) {
  throw new Error(`Invalid Supabase URL: ${supabaseUrl}. Should start with https://`)
}

// Client-side Supabase instance
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
})

// Server-side Supabase instance with service role key (for server actions)
export const createServerClient = () => {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  const serverUrl = process.env.SUPABASE_URL || supabaseUrl
  
  if (!serviceRoleKey) {
    throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY environment variable')
  }
  
  return createClient(serverUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

// Auth types
export interface AuthUser {
  id: string
  email: string
  email_verified: boolean
  created_at: string
  last_sign_in_at?: string
  app_metadata: Record<string, any>
  user_metadata: Record<string, any>
}

export interface AuthSession {
  access_token: string
  refresh_token: string
  expires_in: number
  expires_at?: number
  token_type: string
  user: AuthUser
}

export interface Profile {
  id: string
  email: string
  verification_status: 'pending' | 'verified' | 'failed'
  subscription_tier: 'free' | 'pro' | 'premium'
  created_at?: string
  updated_at?: string
}