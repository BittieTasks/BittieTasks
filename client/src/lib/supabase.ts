import { createClient } from '@supabase/supabase-js'

// Supabase configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing required Supabase environment variables: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    redirectTo: `${window.location.origin}/verify-email`
  }
})

// Database types for profiles table
export interface Profile {
  id: string
  username?: string
  email?: string
  first_name?: string
  last_name?: string
  profile_picture?: string
  total_earnings?: number
  rating?: number
  bio?: string
  skills?: string[]
  phone?: string
  address?: string
  city?: string
  state?: string
  zip_code?: string
  country?: string
  date_of_birth?: string
  verification_status?: string
  identity_verified?: boolean
  background_check?: boolean
  is_active?: boolean
  subscription_tier?: string
  subscription_status?: string
  stripe_customer_id?: string
  stripe_subscription_id?: string
  monthly_task_limit?: number
  monthly_tasks_completed?: number
  referral_code?: string
  referred_by?: string
  referral_count?: number
  referral_earnings?: number
  created_at?: string
  updated_at?: string
}