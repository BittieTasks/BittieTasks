import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from '@shared/schema'

// Get the database URL with fallback for development
const databaseUrl = process.env.DATABASE_URL

if (!databaseUrl) {
  throw new Error(
    "DATABASE_URL must be set. Database connection is required for the application to function.",
  );
}

// Create the PostgreSQL client
const client = postgres(databaseUrl, {
  prepare: false, // Disable prepared statements for better compatibility
  ssl: databaseUrl.includes('supabase.co') ? { rejectUnauthorized: false } : false
})

// Create the drizzle instance
export const db = drizzle(client, { schema })