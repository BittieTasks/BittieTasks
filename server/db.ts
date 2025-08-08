import { createClient } from '@supabase/supabase-js';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from "../shared/schema";

// Check for required environment variables
if (!process.env.SUPABASE_URL) {
  throw new Error(
    "SUPABASE_URL must be set. Please add your Supabase project URL.",
  );
}

if (!process.env.SUPABASE_ANON_KEY) {
  throw new Error(
    "SUPABASE_ANON_KEY must be set. Please add your Supabase anon key.",
  );
}

// Create Supabase client for auth and realtime features
export const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

// For now, we'll use Supabase client directly instead of direct database connection
// This avoids the connectivity issues with the direct PostgreSQL connection
export const db = null; // Temporarily disabled - using Supabase REST API instead