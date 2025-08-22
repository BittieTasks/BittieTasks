'use client'

import { supabase } from './supabase'
import type { User, Session } from '@supabase/supabase-js'

export class SimpleSupabaseAuth {
  
  // Sign in with email/password
  static async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      throw new Error(error.message)
    }

    // Store session in localStorage for persistence
    if (data.session) {
      localStorage.setItem('sb-access-token', data.session.access_token)
      localStorage.setItem('sb-refresh-token', data.session.refresh_token)
    }

    return {
      user: data.user,
      session: data.session,
      needsEmailConfirmation: !data.user?.email_confirmed_at
    }
  }

  // Sign up new user
  static async signUp(email: string, password: string, userData?: any) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData || {}
      }
    })

    if (error) {
      throw new Error(error.message)
    }

    return {
      user: data.user,
      session: data.session,
      needsEmailConfirmation: !data.user?.email_confirmed_at
    }
  }

  // Sign out
  static async signOut() {
    // Clear localStorage tokens
    localStorage.removeItem('sb-access-token')
    localStorage.removeItem('sb-refresh-token')
    
    const { error } = await supabase.auth.signOut()
    if (error) {
      throw new Error(error.message)
    }
  }

  // Get current session
  static async getSession() {
    const { data, error } = await supabase.auth.getSession()
    if (error) {
      console.error('Error getting session:', error)
      return null
    }
    return data.session
  }

  // Get current user
  static async getCurrentUser() {
    const { data, error } = await supabase.auth.getUser()
    if (error) {
      console.error('Error getting user:', error)
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

  // Auth state change listener
  static onAuthStateChange(callback: (user: User | null) => void) {
    return supabase.auth.onAuthStateChange((event, session) => {
      callback(session?.user || null)
    })
  }
}