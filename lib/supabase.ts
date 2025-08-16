import { createClient } from '@supabase/supabase-js'

// Use environment variables directly - they are now correctly set in .env.local
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase URL:', supabaseUrl)
  console.error('Supabase Anon Key:', supabaseAnonKey ? 'Present' : 'Missing')
  throw new Error(`Missing Supabase environment variables. URL: ${supabaseUrl ? 'Present' : 'Missing'}, Key: ${supabaseAnonKey ? 'Present' : 'Missing'}`)
}

if (!supabaseUrl.startsWith('https://')) {
  throw new Error(`Invalid Supabase URL: ${supabaseUrl}. Should start with https://`)
}

// Debug logging for client initialization
console.log('Initializing Supabase client with:', {
  url: supabaseUrl,
  keyLength: supabaseAnonKey?.length,
  keyStart: supabaseAnonKey?.substring(0, 20)
})

// Client-side Supabase instance
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
  },
})

// Server-side Supabase instance for API routes  
export const createServerClient = (request?: Request) => {
  const { createServerClient: createSSRClient } = require('@supabase/ssr')
  
  return createSSRClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        if (!request) return undefined
        const cookieString = request.headers.get('cookie') || ''
        const cookies = cookieString.split(';').reduce((acc: Record<string, string>, cookie) => {
          const [key, value] = cookie.trim().split('=')
          if (key && value) acc[key] = decodeURIComponent(value)
          return acc
        }, {})
        return cookies[name]
      },
      set() {
        // Do nothing for server-side
      },
      remove() {
        // Do nothing for server-side  
      },
    },
  })
}

// Service role client for admin operations (separate function)
export const createServiceClient = () => {
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