import { createClient } from '@supabase/supabase-js'

interface AuthResult {
  success: boolean
  user?: any
  error?: string
  token?: string
}

export class AuthService {
  private supabase

  constructor() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    
    this.supabase = createClient(supabaseUrl, supabaseAnonKey)
  }

  // Client-side: Get current user session and token
  async getCurrentUser(): Promise<AuthResult> {
    try {
      console.log('AuthService: Getting session...')
      const { data: { session }, error: sessionError } = await this.supabase.auth.getSession()
      
      console.log('AuthService session check:', {
        hasSession: !!session,
        hasAccessToken: !!session?.access_token,
        userEmail: session?.user?.email,
        emailConfirmed: !!session?.user?.email_confirmed_at,
        sessionError: sessionError?.message
      })
      
      if (sessionError) {
        return { success: false, error: `Session error: ${sessionError.message}` }
      }
      
      if (!session?.access_token) {
        return { success: false, error: 'No authentication token available' }
      }
      
      if (!session?.user?.email_confirmed_at) {
        return { success: false, error: 'Please verify your email before subscribing' }
      }

      return {
        success: true,
        user: session.user,
        token: session.access_token
      }
    } catch (error: any) {
      return { success: false, error: `Authentication failed: ${error.message}` }
    }
  }

  // Server-side: Validate JWT token and get user
  async validateToken(token: string): Promise<AuthResult> {
    try {
      // Create client with user token for validation
      const userClient = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          auth: { autoRefreshToken: false, persistSession: false },
          global: { headers: { Authorization: `Bearer ${token}` } }
        }
      )

      const { data: { user }, error: authError } = await userClient.auth.getUser()
      
      if (authError || !user) {
        return { 
          success: false, 
          error: `Invalid token: ${authError?.message || 'User not found'}` 
        }
      }

      return { success: true, user, token }
    } catch (error: any) {
      return { success: false, error: `Token validation failed: ${error.message}` }
    }
  }

  // Extract token from Authorization header
  extractTokenFromHeader(authHeader: string | null): { success: boolean; token?: string; error?: string } {
    if (!authHeader) {
      return { success: false, error: 'Authorization header missing' }
    }
    
    if (!authHeader.startsWith('Bearer ')) {
      return { success: false, error: 'Invalid authorization format' }
    }
    
    const token = authHeader.replace('Bearer ', '')
    
    if (token.length < 20) {
      return { success: false, error: 'Invalid token format' }
    }
    
    return { success: true, token }
  }
}