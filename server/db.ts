import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from '@shared/schema'

// Get the database URL
const databaseUrl = process.env.DATABASE_URL

// Create database connection or fallback
let db: any

if (!databaseUrl) {
  // During build phase, create a mock DB to prevent errors
  console.warn("DATABASE_URL not available - using fallback for build phase");
  db = {
    select: () => ({ 
      from: () => ({ 
        where: () => ({ 
          orderBy: () => Promise.resolve([]) 
        }) 
      }) 
    }),
    insert: () => ({ 
      values: () => ({ 
        returning: () => Promise.resolve([]) 
      }) 
    }),
    update: () => ({ 
      set: () => ({ 
        where: () => Promise.resolve([]) 
      }) 
    }),
    delete: () => ({ 
      where: () => Promise.resolve([]) 
    })
  }
} else {
  // Create the PostgreSQL client with proper configuration
  const client = postgres(databaseUrl, {
    prepare: false,
    ssl: databaseUrl.includes('supabase.co') ? { rejectUnauthorized: false } : false,
    max: 10, // Connection pool size
    idle_timeout: 20,
    connect_timeout: 10,
  })

  // Create the drizzle instance
  db = drizzle(client, { schema })
}

// Export the database instance
export { db }