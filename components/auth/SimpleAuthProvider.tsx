'use client'

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'

interface AuthContextType {
  user: any | null
  loading: boolean
  isAuthenticated: boolean
  signIn: (phoneOrEmail: string, password: string) => Promise<{ success: boolean; needsVerification?: boolean }>
  signUp: (phoneOrEmail: string, password: string, userData?: any) => Promise<{ success: boolean; needsVerification?: boolean }>
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
      // Use SSR API endpoint to get current user (respects server-side session)
      const response = await fetch('/api/auth/user', {
        method: 'GET',
        credentials: 'include', // Include cookies for SSR session
        cache: 'no-cache', // Force fresh request to read latest cookies
      })
      
      if (response.ok) {
        const user = await response.json()
        setUser(user)
      } else {
        setUser(null)
      }
      
      setLoading(false)
    } catch (error) {
      // Only log in development
      if (process.env.NODE_ENV === 'development') {
        console.error('SimpleAuthProvider: Error getting current user:', error)
      }
      setUser(null)
      setLoading(false)
    }
  }, [])

  // Initialize auth on mount (SSR approach doesn't need auth state listener)
  useEffect(() => {
    initializeAuth()
  }, [initializeAuth])

  const signIn = async (email: string, password: string) => {
    try {
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
      
      // Set user data from login response immediately for instant auth state
      if (data.user) {
        setUser({
          id: data.user.id,
          email: data.user.email,
          phone: data.user.phone,
          email_confirmed_at: data.user.email_confirmed_at,
          phone_confirmed_at: data.user.phone_confirmed_at,
          user_metadata: data.user.user_metadata || {},
          app_metadata: data.user.app_metadata || {},
          created_at: data.user.created_at,
          last_sign_in_at: data.user.last_sign_in_at,
          isEmailVerified: !!data.user.email_confirmed_at,
          isPhoneVerified: !!data.user.phone_confirmed_at,
          firstName: data.user.user_metadata?.first_name || '',
          lastName: data.user.user_metadata?.last_name || ''
        })
      }
      
      setLoading(false)
      
      // Schedule auth refresh to happen after browser processes cookies
      setTimeout(() => {
        initializeAuth()
      }, 100)
      
      return { 
        success: true, 
        needsVerification: false // SSR handles verification
      }
    } catch (error: any) {
      setLoading(false)
      throw new Error(error.message || 'Sign in failed')
    }
  }

  const signUp = async (email: string, password: string, userData?: any) => {
    try {
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
        needsVerification: false // Users are auto-verified for testing
      }
    } catch (error: any) {
      setLoading(false)
      throw new Error(error.message || 'Sign up failed')
    }
  }

  const signOut = async () => {
    try {
      setLoading(true)
      
      // Use the SSR API endpoint for consistent session management
      await fetch('/api/auth/logout', { method: 'POST' })
      
      setUser(null)
      // Use Next.js router for client-side navigation
      if (typeof window !== 'undefined') {
        window.location.href = '/'
      }
    } catch (error) {
      // Even if API call fails, clear local state and redirect
      setUser(null)
      if (typeof window !== 'undefined') {
        window.location.href = '/'
      }
    } finally {
      setLoading(false)
    }
  }

  const refreshAuth = async () => {
    try {
      await initializeAuth()
    } catch (error) {
      // Silently handle refresh errors
    }
  }

  // Check authentication - user exists and has valid data
  const isAuthenticated = !!user?.id && !!user?.email


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