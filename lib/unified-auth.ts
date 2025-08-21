'use client'

import { supabase } from './supabase'

interface UnifiedSession {
  access_token: string
  refresh_token: string
  expires_at: number
  user: {
    id: string
    email: string
    email_confirmed_at?: string
    phone?: string
    created_at: string
    user_metadata: any
    app_metadata: any
  }
}

const SESSION_KEY = 'bittie_unified_session'
const SESSION_EXPIRY_BUFFER = 60 // 1 minute buffer for token refresh

export class UnifiedAuth {
  
  // Save session with enhanced persistence
  static saveSession(session: any) {
    if (!session?.access_token || !session?.user) {
      console.error('UnifiedAuth: Invalid session data provided')
      return
    }
    
    try {
      const unifiedSession: UnifiedSession = {
        access_token: session.access_token,
        refresh_token: session.refresh_token || '',
        expires_at: session.expires_at || (Date.now() / 1000) + 3600, // 1 hour default
        user: {
          id: session.user.id,
          email: session.user.email,
          email_confirmed_at: session.user.email_confirmed_at,
          phone: session.user.phone,
          created_at: session.user.created_at,
          user_metadata: session.user.user_metadata || {},
          app_metadata: session.user.app_metadata || {}
        }
      }
      
      // Save to localStorage with error handling
      localStorage.setItem(SESSION_KEY, JSON.stringify(unifiedSession))
      
      // Update Supabase session directly to ensure sync
      supabase.auth.setSession({
        access_token: session.access_token,
        refresh_token: session.refresh_token
      })
      
      console.log('UnifiedAuth: Session saved successfully', {
        userEmail: unifiedSession.user.email,
        expiresAt: new Date(unifiedSession.expires_at * 1000).toLocaleString(),
        hasTokens: !!(unifiedSession.access_token && unifiedSession.refresh_token)
      })
      
    } catch (error) {
      console.error('UnifiedAuth: Failed to save session:', error)
    }
  }

  // Get session with automatic refresh
  static async getSession(): Promise<UnifiedSession | null> {
    try {
      const stored = localStorage.getItem(SESSION_KEY)
      if (!stored) {
        console.log('UnifiedAuth: No stored session found')
        return null
      }

      const session = JSON.parse(stored) as UnifiedSession
      const now = Date.now() / 1000
      
      // Check if session is about to expire and refresh if needed
      if (session.expires_at && (now + SESSION_EXPIRY_BUFFER) >= session.expires_at) {
        console.log('UnifiedAuth: Session expiring soon, attempting refresh...')
        
        if (session.refresh_token) {
          const refreshedSession = await this.refreshSession(session.refresh_token)
          if (refreshedSession) {
            return refreshedSession
          }
        }
        
        console.log('UnifiedAuth: Unable to refresh session, clearing...')
        this.clearSession()
        return null
      }
      
      // Verify session is still valid with Supabase
      const { data } = await supabase.auth.getUser(session.access_token)
      if (!data.user) {
        console.log('UnifiedAuth: Session invalid with Supabase, clearing...')
        this.clearSession()
        return null
      }
      
      return session
      
    } catch (error) {
      console.error('UnifiedAuth: Error getting session:', error)
      this.clearSession()
      return null
    }
  }

  // Refresh session tokens
  static async refreshSession(refreshToken: string): Promise<UnifiedSession | null> {
    try {
      const { data, error } = await supabase.auth.refreshSession({
        refresh_token: refreshToken
      })
      
      if (error || !data.session) {
        throw error || new Error('No session returned from refresh')
      }
      
      this.saveSession(data.session)
      return await this.getSession()
      
    } catch (error) {
      console.error('UnifiedAuth: Token refresh failed:', error)
      return null
    }
  }

  // Clear all authentication data
  static clearSession() {
    try {
      // Clear our unified session
      localStorage.removeItem(SESSION_KEY)
      
      // Clear any legacy sessions
      localStorage.removeItem('simple_auth_session')
      localStorage.removeItem('bittie_manual_session')
      
      // Clear Supabase session
      supabase.auth.signOut({ scope: 'local' })
      
      console.log('UnifiedAuth: All sessions cleared')
    } catch (error) {
      console.error('UnifiedAuth: Error clearing sessions:', error)
    }
  }

  // Sign in with enhanced session management
  static async signIn(email: string, password: string) {
    try {
      console.log('UnifiedAuth: Attempting sign in for:', email)
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.toLowerCase().trim(),
        password: password
      })

      if (error) {
        console.error('UnifiedAuth: Sign in error:', error.message)
        throw new Error(error.message)
      }

      if (!data.session || !data.user) {
        throw new Error('Invalid credentials or session not created')
      }

      // Save the session
      this.saveSession(data.session)
      
      console.log('UnifiedAuth: Sign in successful for:', data.user.email)
      return { 
        success: true, 
        user: data.user,
        session: data.session,
        needsEmailConfirmation: !data.user.email_confirmed_at
      }
      
    } catch (error: any) {
      console.error('UnifiedAuth: Sign in failed:', error.message)
      throw new Error(error.message || 'Sign in failed')
    }
  }

  // Sign up with automatic session management
  static async signUp(email: string, password: string, additionalData?: any) {
    try {
      console.log('UnifiedAuth: Attempting sign up for:', email)
      
      const { data, error } = await supabase.auth.signUp({
        email: email.toLowerCase().trim(),
        password: password,
        options: {
          data: {
            first_name: additionalData?.firstName || '',
            last_name: additionalData?.lastName || '',
            phone: additionalData?.phone || '',
            ...additionalData
          }
        }
      })

      if (error) {
        console.error('UnifiedAuth: Sign up error:', error.message)
        throw new Error(error.message)
      }

      if (!data.user) {
        throw new Error('Sign up failed - no user created')
      }

      // If session is returned (immediate confirmation), save it
      if (data.session) {
        this.saveSession(data.session)
      }

      console.log('UnifiedAuth: Sign up successful for:', data.user.email)
      return {
        success: true,
        user: data.user,
        session: data.session,
        needsEmailConfirmation: !data.session
      }
      
    } catch (error: any) {
      console.error('UnifiedAuth: Sign up failed:', error.message)
      throw new Error(error.message || 'Sign up failed')
    }
  }

  // Sign out completely
  static async signOut() {
    try {
      await supabase.auth.signOut()
      this.clearSession()
      
      console.log('UnifiedAuth: Sign out completed')
      
      // Force page refresh to clear any cached state
      setTimeout(() => {
        window.location.href = '/'
      }, 100)
      
    } catch (error) {
      console.error('UnifiedAuth: Sign out error (continuing anyway):', error)
      this.clearSession()
      window.location.href = '/'
    }
  }

  // Check authentication status
  static async isAuthenticated(): Promise<boolean> {
    const session = await this.getSession()
    return !!(session?.access_token && session?.user?.id)
  }

  // Get current user
  static async getCurrentUser() {
    const session = await this.getSession()
    return session?.user || null
  }

  // Get access token for API calls
  static async getAccessToken(): Promise<string | null> {
    const session = await this.getSession()
    return session?.access_token || null
  }

  // Set up auth state listener
  static onAuthStateChange(callback: (user: any) => void) {
    return supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('UnifiedAuth: Auth state changed:', event)
      
      if (event === 'SIGNED_IN' && session) {
        this.saveSession(session)
        callback(session.user)
      } else if (event === 'SIGNED_OUT') {
        this.clearSession()
        callback(null)
      } else if (event === 'TOKEN_REFRESHED' && session) {
        this.saveSession(session)
        callback(session.user)
      }
    })
  }
}

// Export singleton functions for backwards compatibility
export const unifiedAuth = UnifiedAuth