'use client'

import { supabase } from './supabase'
import type { User, Session } from '@supabase/supabase-js'

export class SimpleSupabaseAuth {
  
  // Sign in with email/password
  static async signIn(email: string, password: string) {
    console.log('SimpleSupabaseAuth: Signing in user:', email)
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      console.error('SimpleSupabaseAuth: Sign in error:', error)
      throw new Error(error.message)
    }

    console.log('SimpleSupabaseAuth: Sign in successful, user:', data.user?.email, 'session:', !!data.session)

    return {
      user: data.user,
      session: data.session,
      needsEmailConfirmation: !data.user?.email_confirmed_at
    }
  }

  // Sign up new user
  static async signUp(email: string, password: string, userData?: any) {
    console.log('SimpleSupabaseAuth: Signing up user:', email)
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData || {}
      }
    })

    if (error) {
      console.error('SimpleSupabaseAuth: Sign up error:', error)
      throw new Error(error.message)
    }

    console.log('SimpleSupabaseAuth: Sign up successful, user:', data.user?.email, 'session:', !!data.session)

    return {
      user: data.user,
      session: data.session,
      needsEmailConfirmation: !data.user?.email_confirmed_at
    }
  }

  // Sign out
  static async signOut() {
    console.log('SimpleSupabaseAuth: Signing out user')
    
    const { error } = await supabase.auth.signOut()
    if (error) {
      console.error('SimpleSupabaseAuth: Sign out error:', error)
      throw new Error(error.message)
    }
    
    console.log('SimpleSupabaseAuth: Sign out successful')
  }

  // Get current session - let Supabase handle everything
  static async getSession() {
    const { data, error } = await supabase.auth.getSession()
    if (error) {
      console.error('SimpleSupabaseAuth: Error getting session:', error)
      return null
    }
    
    return data.session
  }

  // Get current user
  static async getCurrentUser() {
    const { data, error } = await supabase.auth.getUser()
    if (error) {
      console.error('SimpleSupabaseAuth: Error getting user:', error)
      return null
    }
    return data.user
  }

  // Check if user is authenticated
  static async isAuthenticated() {
    const session = await this.getSession()
    return !!session?.user
  }

  // Get access token
  static async getAccessToken() {
    const session = await this.getSession()
    return session?.access_token || null
  }

  // Refresh session
  static async refreshSession() {
    console.log('SimpleSupabaseAuth: Refreshing session')
    return await supabase.auth.refreshSession()
  }

  // Auth state change listener
  static onAuthStateChange(callback: (user: User | null) => void) {
    return supabase.auth.onAuthStateChange((event, session) => {
      console.log('SimpleSupabaseAuth: Auth state change:', event, session?.user?.email || 'no user')
      callback(session?.user || null)
    })
  }
}