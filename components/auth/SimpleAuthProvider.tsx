'use client'

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { UnifiedAuth } from '@/lib/unified-auth'

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
      console.log('UnifiedAuthProvider: Initializing authentication...')
      const session = await UnifiedAuth.getSession()
      
      if (session?.user) {
        setUser(session.user)
        console.log('UnifiedAuthProvider: User authenticated:', session.user.email)
      } else {
        setUser(null)
        console.log('UnifiedAuthProvider: No authenticated user found')
      }
    } catch (error) {
      console.error('UnifiedAuthProvider: Error initializing auth:', error)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  // Set up auth state listener
  useEffect(() => {
    console.log('UnifiedAuthProvider: Setting up auth state monitoring...')
    
    // Initialize auth on mount
    initializeAuth()

    // Set up auth state listener
    const { data: { subscription } } = UnifiedAuth.onAuthStateChange((authUser) => {
      console.log('UnifiedAuthProvider: Auth state changed:', authUser?.email || 'signed out')
      setUser(authUser)
      setLoading(false)
    })

    // Cleanup subscription on unmount
    return () => {
      subscription?.unsubscribe()
    }
  }, [initializeAuth])

  const signIn = async (email: string, password: string) => {
    try {
      console.log('UnifiedAuthProvider: Signing in user:', email)
      setLoading(true)
      
      const result = await UnifiedAuth.signIn(email, password)
      setUser(result.user)
      
      console.log('UnifiedAuthProvider: Sign in successful')
      return { 
        success: true, 
        needsEmailConfirmation: result.needsEmailConfirmation 
      }
    } catch (error: any) {
      console.error('UnifiedAuthProvider: Sign in failed:', error.message)
      throw new Error(error.message || 'Sign in failed')
    } finally {
      setLoading(false)
    }
  }

  const signUp = async (email: string, password: string, userData?: any) => {
    try {
      console.log('UnifiedAuthProvider: Signing up user:', email)
      setLoading(true)
      
      const result = await UnifiedAuth.signUp(email, password, userData)
      
      // Only set user if we have a session (immediate confirmation)
      if (result.session) {
        setUser(result.user)
      }
      
      console.log('UnifiedAuthProvider: Sign up successful')
      return { 
        success: true, 
        needsEmailConfirmation: result.needsEmailConfirmation 
      }
    } catch (error: any) {
      console.error('UnifiedAuthProvider: Sign up failed:', error.message)
      throw new Error(error.message || 'Sign up failed')
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    try {
      console.log('UnifiedAuthProvider: Signing out user')
      setLoading(true)
      await UnifiedAuth.signOut()
      setUser(null)
    } catch (error) {
      console.error('UnifiedAuthProvider: Sign out error:', error)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const refreshAuth = async () => {
    try {
      console.log('UnifiedAuthProvider: Refreshing authentication state')
      await initializeAuth()
    } catch (error) {
      console.error('UnifiedAuthProvider: Error refreshing auth:', error)
    }
  }

  const isAuthenticated = !!user?.id && !!user?.email

  console.log('UnifiedAuthProvider: Current state:', {
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