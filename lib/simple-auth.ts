// Simple authentication system to bypass runtime errors
import { supabase } from './supabase'

interface SimpleSession {
  access_token: string
  refresh_token: string
  expires_at: number
  user: any
}

const SESSION_KEY = 'simple_auth_session'

export class SimpleAuth {
  static saveSession(session: SimpleSession) {
    try {
      localStorage.setItem(SESSION_KEY, JSON.stringify(session))
      console.log('SimpleAuth: Session saved successfully')
    } catch (error) {
      console.error('SimpleAuth: Failed to save session:', error)
    }
  }

  static getSession(): SimpleSession | null {
    try {
      const stored = localStorage.getItem(SESSION_KEY)
      if (!stored) return null

      const session = JSON.parse(stored) as SimpleSession
      
      // Check if expired
      if (Date.now() / 1000 > session.expires_at) {
        this.clearSession()
        return null
      }

      return session
    } catch (error) {
      console.error('SimpleAuth: Failed to get session:', error)
      return null
    }
  }

  static clearSession() {
    try {
      localStorage.removeItem(SESSION_KEY)
      console.log('SimpleAuth: Session cleared')
    } catch (error) {
      console.error('SimpleAuth: Failed to clear session:', error)
    }
  }

  static async signIn(email: string, password: string) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        throw error
      }

      if (data.session) {
        const simpleSession: SimpleSession = {
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
          expires_at: data.session.expires_at || 0,
          user: data.user
        }
        
        this.saveSession(simpleSession)
        return { success: true, session: simpleSession, user: data.user }
      }

      throw new Error('No session returned')
    } catch (error: any) {
      console.error('SimpleAuth: Sign in failed:', error)
      throw error
    }
  }

  static async signOut() {
    try {
      this.clearSession()
      await supabase.auth.signOut()
    } catch (error) {
      console.log('SimpleAuth: Sign out completed with errors:', error)
    }
  }

  static isAuthenticated(): boolean {
    const session = this.getSession()
    return !!session && !!session.access_token
  }

  static getAccessToken(): string | null {
    const session = this.getSession()
    return session?.access_token || null
  }

  static getCurrentUser() {
    const session = this.getSession()
    return session?.user || null
  }
}