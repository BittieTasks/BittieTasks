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
  },
})

// Server-side Supabase instance for API routes
export const createServerClient = (request?: Request) => {
  // For API routes, use the same client-side config but with server context
  const client = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
  
  // If a request is provided, extract the auth token from cookies or headers
  if (request) {
    const cookieString = request.headers.get('cookie')
    const authorizationHeader = request.headers.get('authorization')
    
    if (authorizationHeader) {
      // Extract token from Authorization header
      const token = authorizationHeader.replace('Bearer ', '')
      client.auth.setSession({
        access_token: token,
        refresh_token: '',
      } as any)
    } else if (cookieString) {
      // Extract tokens from cookies
      const cookies = cookieString.split(';').reduce((acc: Record<string, string>, cookie) => {
        const [key, value] = cookie.trim().split('=')
        if (key && value) acc[key] = decodeURIComponent(value)
        return acc
      }, {})
      
      const accessToken = cookies['sb-access-token'] || cookies['supabase-auth-token']
      const refreshToken = cookies['sb-refresh-token'] || cookies['supabase-refresh-token']
      
      if (accessToken) {
        client.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken || '',
        } as any)
      }
    }
  }
  
  return client
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