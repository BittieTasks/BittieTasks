import { createClient } from '@supabase/supabase-js'
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_URL')
}
if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_ANON_KEY')
}
if (!process.env.DATABASE_URL) {
  throw new Error('Missing env.DATABASE_URL')
}

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

// Drizzle database connection
const client = postgres(process.env.DATABASE_URL)
export const db = drizzle(client)

// Database types
export interface User {
  id: string
  email: string
  first_name: string | null
  last_name: string | null
  avatar_url: string | null
  subscription_tier: 'free' | 'pro' | 'premium'
  earnings_balance: number
  created_at: string
  email_confirmed_at: string | null
}

export interface Task {
  id: string
  title: string
  description: string
  type: 'solo' | 'shared' | 'sponsored'
  category: string
  payout: number
  max_participants: number
  current_participants: number
  creator_id: string
  status: 'active' | 'completed' | 'cancelled'
  created_at: string
  deadline: string | null
  is_sponsored: boolean
  sponsor_name: string | null
}

export interface TaskParticipation {
  id: string
  task_id: string
  user_id: string
  status: 'joined' | 'completed' | 'verified'
  earnings: number
  created_at: string
}

export interface UserProfile {
  id: string
  user_id: string
  display_name: string
  bio: string | null
  skills: string[]
  total_earnings: number
  completion_rate: number
  rating: number
  achievements: string[]
  created_at: string
}