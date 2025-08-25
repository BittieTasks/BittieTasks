import { createClient } from '@supabase/supabase-js'
import { NextRequest } from 'next/server'

// Use environment variables with runtime fallback for production
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase URL:', supabaseUrl)
  console.error('Supabase Anon Key:', supabaseAnonKey ? 'Present' : 'Missing')
  throw new Error(`Missing Supabase environment variables. URL: ${supabaseUrl ? 'Present' : 'Missing'}, Key: ${supabaseAnonKey ? 'Present' : 'Missing'}`)
}

if (!supabaseUrl.startsWith('https://')) {
  throw new Error(`Invalid Supabase URL: ${supabaseUrl}. Should start with https://`)
}

// Only log once in development (reduced to prevent spam)
if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined' && !(window as any).__supabase_logged) {
  console.log('Initializing Supabase client with:', {
    url: supabaseUrl,
    keyLength: supabaseAnonKey?.length,
    keyStart: supabaseAnonKey?.substring(0, 20)
  })
  ;(window as any).__supabase_logged = true
}

// Client-side Supabase instance  
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    debug: process.env.NODE_ENV === 'development'
  },
})

// Server-side Supabase instance for API routes
// Uses session cookies for authentication (consistent with login system)
export const createServerClient = (request: NextRequest | Request) => {
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    },
    global: {
      headers: {
        // Set authorization header from session cookies if available
        Authorization: getAuthHeaderFromCookies(request)
      }
    }
  })
}

// Helper function to extract auth token from session cookies
function getAuthHeaderFromCookies(request: NextRequest | Request): string {
  // For NextRequest (Next.js API routes)
  if ('cookies' in request && typeof request.cookies.get === 'function') {
    const accessToken = request.cookies.get('sb-access-token')?.value
    if (accessToken) {
      return `Bearer ${accessToken}`
    }
  }
  
  // For standard Request objects, parse cookie header manually
  const cookieHeader = request.headers.get('cookie')
  if (cookieHeader) {
    const match = cookieHeader.match(/sb-access-token=([^;]+)/)
    if (match && match[1]) {
      return `Bearer ${match[1]}`
    }
  }
  
  return ''
}

// Service role client for admin operations (separate function)
export const createServiceClient = () => {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  // Use fallback URL for production compatibility
  const serverUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || supabaseUrl
  
  if (!serviceRoleKey) {
    console.error('SUPABASE_SERVICE_ROLE_KEY missing. Available keys:', Object.keys(process.env).filter(k => k.includes('SUPABASE')))
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