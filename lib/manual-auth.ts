// Manual authentication system to bypass Supabase session persistence issues
import { supabase } from './supabase'

interface StoredSession {
  access_token: string
  refresh_token: string
  expires_at: number
  user: any
}

const SESSION_KEY = 'bittie_manual_session'

export class ManualAuthManager {
  
  // Save session manually to localStorage
  static saveSession(session: any) {
    if (!session) return
    
    const storedSession: StoredSession = {
      access_token: session.access_token,
      refresh_token: session.refresh_token,
      expires_at: session.expires_at,
      user: session.user
    }
    
    localStorage.setItem(SESSION_KEY, JSON.stringify(storedSession))
    console.log('ManualAuth: Session saved manually', {
      hasAccessToken: !!session.access_token,
      hasRefreshToken: !!session.refresh_token,
      expiresAt: session.expires_at
    })
  }
  
  // Get session from manual storage
  static getStoredSession(): StoredSession | null {
    try {
      const stored = localStorage.getItem(SESSION_KEY)
      if (!stored) return null
      
      const session = JSON.parse(stored) as StoredSession
      
      // Check if expired
      if (Date.now() / 1000 > session.expires_at) {
        console.log('ManualAuth: Stored session expired')
        this.clearSession()
        return null
      }
      
      return session
    } catch (err) {
      console.error('ManualAuth: Error getting stored session:', err)
      return null
    }
  }
  
  // Clear manual session
  static clearSession() {
    localStorage.removeItem(SESSION_KEY)
    console.log('ManualAuth: Session cleared')
  }
  
  // Sign in and manually store session
  static async signIn(email: string, password: string) {
    try {
      console.log('ManualAuth: Attempting sign in for:', email)
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      
      if (error) {
        console.error('ManualAuth: Sign in failed:', error.message)
        throw error
      }
      
      if (data.session) {
        // Manually save the session
        this.saveSession(data.session)
        
        // Also try to set it in Supabase (might work)
        try {
          await supabase.auth.setSession({
            access_token: data.session.access_token,
            refresh_token: data.session.refresh_token
          })
        } catch (setErr) {
          console.log('ManualAuth: Supabase setSession failed (expected):', setErr)
        }
      }
      
      return data
    } catch (error) {
      console.error('ManualAuth: Sign in error:', error)
      throw error
    }
  }
  
  // Get current user from manual session
  static getCurrentUser() {
    const session = this.getStoredSession()
    return session?.user || null
  }
  
  // Check if user is authenticated
  static isAuthenticated(): boolean {
    const session = this.getStoredSession()
    return !!session && !!session.access_token
  }
  
  // Get access token for API calls
  static getAccessToken(): string | null {
    const session = this.getStoredSession()
    return session?.access_token || null
  }
  
  // Sign out
  static async signOut() {
    try {
      // Clear manual session first
      this.clearSession()
      
      // Try Supabase signOut (might not work due to no session)
      await supabase.auth.signOut()
    } catch (error) {
      console.log('ManualAuth: Sign out completed with errors (expected):', error)
    }
  }
  
  // Refresh token if needed
  static async refreshIfNeeded() {
    const session = this.getStoredSession()
    if (!session) return null
    
    // Check if token expires soon (within 5 minutes)
    const expiresInMinutes = (session.expires_at - Date.now() / 1000) / 60
    
    if (expiresInMinutes > 5) {
      return session // Token still good
    }
    
    try {
      console.log('ManualAuth: Refreshing token...')
      
      const { data, error } = await supabase.auth.setSession({
        access_token: session.access_token,
        refresh_token: session.refresh_token
      })
      
      if (error) {
        console.error('ManualAuth: Token refresh failed:', error)
        this.clearSession()
        return null
      }
      
      if (data.session) {
        this.saveSession(data.session)
        return this.getStoredSession()
      }
      
      return session
    } catch (error) {
      console.error('ManualAuth: Token refresh error:', error)
      this.clearSession()
      return null
    }
  }
}