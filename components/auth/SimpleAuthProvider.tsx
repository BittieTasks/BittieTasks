'use client'

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'

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

  // Initialize auth state using SSR API endpoint
  const initializeAuth = useCallback(async () => {
    try {
      console.log('SimpleAuthProvider: Initializing authentication with SSR...')
      
      // Use SSR API endpoint to get current user (respects server-side session)
      const response = await fetch('/api/auth/user', {
        method: 'GET',
        credentials: 'include', // Include cookies for SSR session
      })
      
      if (response.ok) {
        const user = await response.json()
        console.log('SimpleAuthProvider: Current user from SSR:', user?.email || 'none')
        setUser(user)
      } else {
        console.log('SimpleAuthProvider: No authenticated user found (status:', response.status, ')')
        setUser(null)
      }
      
      setLoading(false)
    } catch (error) {
      console.error('SimpleAuthProvider: Error getting current user:', error)
      setUser(null)
      setLoading(false)
    }
  }, [])

  // Initialize auth on mount (SSR approach doesn't need auth state listener)
  useEffect(() => {
    console.log('SimpleAuthProvider: Setting up SSR-based authentication...')
    initializeAuth()
  }, [initializeAuth])

  const signIn = async (email: string, password: string) => {
    try {
      console.log('SimpleAuthProvider: Starting sign in for:', email)
      setLoading(true)
      
      // Use the SSR API endpoint instead of direct Supabase client
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Sign in failed')
      }
      
      // Refresh auth state after successful login
      await initializeAuth()
      setLoading(false)
      
      return { 
        success: true, 
        needsEmailConfirmation: false // SSR handles email confirmation
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
      
      // Use the SSR API endpoint instead of direct Supabase client
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email, 
          password, 
          firstName: userData?.firstName,
          lastName: userData?.lastName
        }),
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Sign up failed')
      }
      
      setLoading(false)
      
      return { 
        success: true, 
        needsEmailConfirmation: true 
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
      
      // Use the SSR API endpoint for consistent session management
      await fetch('/api/auth/logout', { method: 'POST' })
      
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

  // Check authentication - user exists and has valid data
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