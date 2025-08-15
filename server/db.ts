import { createClient } from '@supabase/supabase-js'
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from '@shared/schema'

// Use Supabase connection for production, fallback to DATABASE_URL for development
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

let client: postgres.Sql

if (process.env.DATABASE_URL) {
  // Use direct PostgreSQL connection if available
  client = postgres(process.env.DATABASE_URL)
} else if (supabaseUrl && serviceKey) {
  // Use Supabase connection
  const supabase = createClient(supabaseUrl, serviceKey)
  throw new Error("Supabase direct connection not yet implemented - using DATABASE_URL")
} else {
  throw new Error(
    "DATABASE_URL or SUPABASE_SERVICE_ROLE_KEY must be set. Did you forget to provision a database?",
  );
}

// Create the drizzle instance
export const db = drizzle(client, { schema })