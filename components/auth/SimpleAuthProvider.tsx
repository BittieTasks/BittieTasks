'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { SimpleAuth } from '@/lib/simple-auth'

interface AuthContextType {
  user: any | null
  loading: boolean
  isAuthenticated: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, userData?: any) => Promise<void>
  signOut: () => Promise<void>
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

  useEffect(() => {
    // Check for existing session on mount
    const checkAuth = () => {
      try {
        const session = SimpleAuth.getSession()
        if (session) {
          setUser(session.user)
          console.log('SimpleAuth: Found existing session for:', session.user?.email)
        } else {
          console.log('SimpleAuth: No existing session found')
        }
      } catch (error) {
        console.error('SimpleAuth: Error checking session:', error)
      } finally {
        setLoading(false)
      }
    }

    // Add delay to prevent conflicts with other Supabase instances
    setTimeout(checkAuth, 100)
  }, [])

  const signIn = async (email: string, password: string) => {
    try {
      const result = await SimpleAuth.signIn(email, password)
      setUser(result.user)
      console.log('SimpleAuth: Sign in successful')
    } catch (error) {
      console.error('SimpleAuth: Sign in failed:', error)
      throw error
    }
  }

  const signUp = async (email: string, password: string, userData?: any) => {
    try {
      // Use the existing signup API endpoint
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          firstName: userData?.firstName || '',
          lastName: userData?.lastName || '',
          phoneNumber: userData?.phoneNumber || null,
        }),
      })

      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.message || result.error || 'Signup failed')
      }
      
      console.log('SimpleAuth: Signup successful:', result)
    } catch (error) {
      console.error('SimpleAuth: Signup failed:', error)
      throw error
    }
  }

  const signOut = async () => {
    try {
      await SimpleAuth.signOut()
      setUser(null)
      console.log('SimpleAuth: Sign out completed')
      
      // Redirect to home page
      setTimeout(() => {
        window.location.href = '/'
      }, 100)
    } catch (error) {
      console.error('SimpleAuth: Sign out error:', error)
      setUser(null)
      window.location.href = '/'
    }
  }

  const isAuthenticated = !!user && !!user.email

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      isAuthenticated,
      signIn,
      signUp,
      signOut,
    }}>
      {children}
    </AuthContext.Provider>
  )
}