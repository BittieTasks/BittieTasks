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

  // Initialize auth state with session recovery
  const initializeAuth = useCallback(async () => {
    try {
      console.log('SimpleAuthProvider: Initializing authentication...')
      
      // Force refresh the session first
      const { data: refreshedSession } = await SimpleSupabaseAuth.refreshSession()
      
      // Get session from Supabase directly
      const session = await SimpleSupabaseAuth.getSession()
      console.log('SimpleAuthProvider: Session check result:', {
        hasSession: !!session,
        hasUser: !!session?.user,
        userEmail: session?.user?.email,
        expiresAt: session?.expires_at,
        refreshed: !!refreshedSession
      })
      
      if (session?.user) {
        console.log('SimpleAuthProvider: Restoring user from session:', session.user.email)
        setUser(session.user)
        setLoading(false)
        return
      }
      
      console.log('SimpleAuthProvider: No valid session found, user not authenticated')
      setUser(null)
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
        
        console.log('SimpleAuthProvider: Auth state changed to:', {
          hasUser: !!authUser,
          email: authUser?.email,
          emailConfirmed: authUser?.email_confirmed_at
        })
        
        setUser(authUser)
        setLoading(false)
      })
      
      subscription = authListener?.data?.subscription
    } catch (error) {
      console.error('SimpleAuthProvider: Error setting up auth listener:', error)
      setLoading(false)
    }

    // Backup timeout to prevent infinite loading
    const backupTimeout = setTimeout(() => {
      if (mounted) {
        console.log('SimpleAuthProvider: Backup timeout triggered, resolving loading state')
        setLoading(false)
      }
    }, 3000) // 3 second timeout

    // Cleanup subscription on unmount
    return () => {
      mounted = false
      clearTimeout(backupTimeout)
      if (subscription && typeof subscription.unsubscribe === 'function') {
        subscription.unsubscribe()
      }
    }
  }, [initializeAuth])

  const signIn = async (email: string, password: string) => {
    try {
      console.log('SimpleAuthProvider: Starting sign in for:', email)
      setLoading(true)
      
      const result = await SimpleSupabaseAuth.signIn(email, password)
      
      // Set user immediately if we got one from the API
      if (result.user && result.session) {
        console.log('SimpleAuthProvider: Sign in successful, setting user immediately')
        setUser(result.user)
        setLoading(false)
      } else {
        console.log('SimpleAuthProvider: Sign in API call successful, waiting for auth state change')
        // Fallback timeout in case auth state change doesn't fire
        setTimeout(() => {
          setLoading(false)
        }, 2000)
      }
      
      return { 
        success: true, 
        needsEmailConfirmation: result.needsEmailConfirmation 
      }
    } catch (error: any) {
      console.error('SimpleAuthProvider: Sign in failed:', error.message)
      setLoading(false)
      throw new Error(error.message || 'Sign in failed')
    }
  }

  const signUp = async (email: string, password: string, userData?: any) => {
    try {
      console.log('SimpleAuthProvider: Starting sign up for:', email)
      setLoading(true)
      
      const result = await SimpleSupabaseAuth.signUp(email, password, userData)
      
      // Don't set user here - let the auth state listener handle it
      console.log('SimpleAuthProvider: Sign up API call successful')
      
      return { 
        success: true, 
        needsEmailConfirmation: result.needsEmailConfirmation 
      }
    } catch (error: any) {
      console.error('SimpleAuthProvider: Sign up failed:', error.message)
      setLoading(false)
      throw new Error(error.message || 'Sign up failed')
    }
  }

  const signOut = async () => {
    try {
      console.log('SimpleAuthProvider: Signing out user')
      setLoading(true)
      await SimpleSupabaseAuth.signOut()
      setUser(null)
      // Redirect to home page after sign out
      window.location.href = '/'
    } catch (error) {
      console.error('SimpleAuthProvider: Sign out error:', error)
      // Even if API call fails, clear local state and redirect
      setUser(null)
      window.location.href = '/'
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

  // Check authentication - support both Supabase and custom verification
  const isAuthenticated = !!user?.id && !!user?.email && (
    process.env.NODE_ENV === 'development' || 
    !!user?.email_confirmed_at || 
    !!user?.user_metadata?.email_verified
  )

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