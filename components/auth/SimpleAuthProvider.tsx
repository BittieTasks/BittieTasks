'use client'

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { SimpleSupabaseAuth } from '@/lib/simple-supabase-auth'

interface AuthContextType {
  user: any | null
  loading: boolean
  isAuthenticated: boolean
  signIn: (email: string, password: string) => Promise<{ success: boolean; needsEmailConfirmation?: boolean }>
  signUp: (email: string, password: string, userData?: any) => Promise<{ success: boolean; needsEmailConfirmation?: boolean }>
  signOut: () => Promise<void>
  refreshAuth: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: React.ReactNode
}

export function SimpleAuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)

  // Initialize auth state
  const initializeAuth = useCallback(async () => {
    try {
      console.log('SimpleAuthProvider: Initializing authentication...')
      const currentUser = await SimpleSupabaseAuth.getCurrentUser()
      
      const authState = {
        hasUser: !!currentUser,
        userEmail: currentUser?.email,
        isAuthenticated: !!currentUser && !!currentUser.email,
        loading: false
      }
      
      console.log('SimpleAuthProvider: Current state:', authState)
      
      setUser(currentUser)
      setLoading(false)
    } catch (error) {
      console.error('SimpleAuthProvider: Error initializing auth:', error)
      setUser(null)
      setLoading(false)
    }
  }, [])

  // Set up auth state listener
  useEffect(() => {
    let mounted = true
    
    console.log('SimpleAuthProvider: Setting up auth state monitoring...')
    
    // Initialize auth on mount
    initializeAuth()

    // Set up auth state listener
    let subscription: any = null
    
    try {
      const authListener = SimpleSupabaseAuth.onAuthStateChange((authUser) => {
        if (!mounted) return
        
        console.log('SimpleAuthProvider: Auth state changed:', authUser?.email || 'signed out')
        setUser(authUser)
        setLoading(false)
      })
      
      subscription = authListener?.data?.subscription
    } catch (error) {
      console.error('SimpleAuthProvider: Error setting up auth listener:', error)
      setLoading(false)
    }

    // Cleanup subscription on unmount
    return () => {
      mounted = false
      if (subscription && typeof subscription.unsubscribe === 'function') {
        subscription.unsubscribe()
      }
    }
  }, [initializeAuth])

  const signIn = async (email: string, password: string) => {
    try {
      console.log('SimpleAuthProvider: Signing in user:', email)
      setLoading(true)
      
      const result = await SimpleSupabaseAuth.signIn(email, password)
      setUser(result.user)
      
      console.log('SimpleAuthProvider: Sign in successful')
      return { 
        success: true, 
        needsEmailConfirmation: result.needsEmailConfirmation 
      }
    } catch (error: any) {
      console.error('SimpleAuthProvider: Sign in failed:', error.message)
      throw new Error(error.message || 'Sign in failed')
    } finally {
      setLoading(false)
    }
  }

  const signUp = async (email: string, password: string, userData?: any) => {
    try {
      console.log('SimpleAuthProvider: Signing up user:', email)
      setLoading(true)
      
      const result = await SimpleSupabaseAuth.signUp(email, password, userData)
      
      // Only set user if we have a session (immediate confirmation)
      if (result.session) {
        setUser(result.user)
      }
      
      console.log('SimpleAuthProvider: Sign up successful')
      return { 
        success: true, 
        needsEmailConfirmation: result.needsEmailConfirmation 
      }
    } catch (error: any) {
      console.error('SimpleAuthProvider: Sign up failed:', error.message)
      throw new Error(error.message || 'Sign up failed')
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    try {
      console.log('SimpleAuthProvider: Signing out user')
      setLoading(true)
      await SimpleSupabaseAuth.signOut()
      setUser(null)
    } catch (error) {
      console.error('SimpleAuthProvider: Sign out error:', error)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const refreshAuth = async () => {
    try {
      console.log('SimpleAuthProvider: Refreshing authentication state')
      await initializeAuth()
    } catch (error) {
      console.error('SimpleAuthProvider: Error refreshing auth:', error)
    }
  }

  const isAuthenticated = !!user?.id && !!user?.email

  console.log('SimpleAuthProvider: Current state:', {
    hasUser: !!user,
    userEmail: user?.email,
    isAuthenticated,
    loading
  })

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      isAuthenticated,
      signIn,
      signUp,
      signOut,
      refreshAuth,
    }}>
      {children}
    </AuthContext.Provider>
  )
}