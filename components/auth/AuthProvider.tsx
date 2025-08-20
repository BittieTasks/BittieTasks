'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import type { Session } from '@supabase/supabase-js'

type AuthContextType = {
  user: User | null
  session: Session | null
  loading: boolean
  isAuthenticated: boolean
  isVerified: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, userData?: any) => Promise<void>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: React.ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)

  // Debug render cycles
  console.log('AuthProvider render:', { loading, hasUser: !!user, mounted })

  useEffect(() => {
    console.log('AuthProvider: Setting mounted to true')
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return
    
    console.log('AuthProvider: Starting auth initialization...')
    
    // Simple initialization with proper error handling
    const initializeAuth = async () => {
      try {
        console.log('AuthProvider: Getting Supabase session...')
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('AuthProvider: Error getting session:', error)
          setSession(null)
          setUser(null)
        } else {
          console.log('AuthProvider: Session retrieved:', {
            hasSession: !!session,
            userEmail: session?.user?.email,
            isConfirmed: !!session?.user?.email_confirmed_at
          })
          setSession(session)
          setUser(session?.user ?? null)
        }
        
        console.log('AuthProvider: Setting loading to false')
        setLoading(false)
        
      } catch (error) {
        console.error('AuthProvider: Session initialization failed:', error)
        setSession(null)
        setUser(null)
        setLoading(false)
      }
    }
    
    // Add timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      console.log('AuthProvider: Timeout reached, setting loading to false')
      setLoading(false)
    }, 3000) // Reduced to 3 seconds
    
    initializeAuth().finally(() => {
      clearTimeout(timeout)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('AuthProvider: Auth state change:', {
          event,
          hasSession: !!session,
          userEmail: session?.user?.email,
          isConfirmed: !!session?.user?.email_confirmed_at
        })
        
        setSession(session)
        setUser(session?.user ?? null)
        setLoading(false)
        
        // Handle successful sign in - improved timing and reliability
        if (event === 'SIGNED_IN' && session?.user) {
          console.log('User successfully signed in:', {
            email: session.user.email,
            confirmed: !!session.user.email_confirmed_at,
            userId: session.user.id
          })
          
          // Create user profile if needed
          try {
            await createUserProfile(session.user)
          } catch (error) {
            console.error('Error creating user profile:', error)
          }
          
          // Redirect to dashboard regardless of email confirmation status
          // (email verification is handled separately)
          const currentPath = window.location.pathname
          if (!currentPath.startsWith('/subscribe') && 
              !currentPath.startsWith('/subscription/') &&
              !currentPath.startsWith('/dashboard') &&
              !currentPath.startsWith('/auth/callback')) {
            console.log('Redirecting to dashboard from:', currentPath)
            
            // Use shorter timeout and more reliable redirect
            setTimeout(() => {
              console.log('Executing redirect to dashboard...')
              window.location.href = '/dashboard'
            }, 500)
          } else {
            console.log('Staying on current page:', currentPath)
          }
        }
        
        // Handle sign out
        if (event === 'SIGNED_OUT') {
          console.log('User signed out')
          setUser(null)
          setSession(null)
        }
      }
    )
    
    return () => {
      subscription.unsubscribe()
    }
  }, [mounted])

  const createUserProfile = async (authUser: User) => {
    try {
      const { data: { session: currentSession } } = await supabase.auth.getSession()
      
      if (!currentSession?.access_token) {
        console.log('No valid session token for profile creation')
        return
      }

      const response = await fetch('/api/auth/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentSession.access_token}`,
        },
        body: JSON.stringify({
          id: authUser.id,
          email: authUser.email,
          firstName: authUser.user_metadata?.firstName || '',
          lastName: authUser.user_metadata?.lastName || '',
          profileImageUrl: authUser.user_metadata?.avatar_url || '',
        }),
      })

      if (!response.ok) {
        console.log('Profile API not available, continuing without profile creation')
      }
    } catch (error: any) {
      console.log('Profile creation skipped:', error?.message || 'Unknown error')
    }
  }

  const signIn = async (email: string, password: string) => {
    console.log('AuthProvider signIn called with:', email)
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      
      console.log('Sign in result:', { hasUser: !!data.user, error })
      
      if (error) {
        console.error('Sign in error details:', error)
        
        if (error.message.includes('Email not confirmed') || error.message.includes('email_not_confirmed')) {
          throw new Error('Please verify your email before signing in. Check your email for the verification link.')
        }
        
        throw new Error(error.message)
      }
      
      console.log('Sign in successful, user:', data.user?.email)
      
    } catch (error: any) {
      console.error('Sign in failed:', error)
      throw new Error(error.message || 'Sign in failed. Please try again.')
    }
  }

  const signUp = async (email: string, password: string, userData?: any) => {
    console.log('AuthProvider signUp called with:', email, userData)
    
    try {
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
        console.error('Signup failed:', result)
        throw new Error(result.message || result.error || 'Signup failed')
      }
      
      console.log('Signup successful:', result)
      
    } catch (error: any) {
      console.error('Signup error:', error)
      throw new Error(error.message || 'Signup failed. Please try again.')
    }
  }

  const signOut = async () => {
    console.log('AuthProvider signOut called')
    
    try {
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        console.error('Sign out error:', error)
        throw new Error(error.message)
      }
      
      console.log('Sign out successful')
      
      // Force redirect to home page
      window.location.href = '/'
      
    } catch (error: any) {
      console.error('Sign out failed:', error)
      throw new Error(error.message || 'Sign out failed')
    }
  }

  const resetPassword = async (email: string) => {
    console.log('AuthProvider resetPassword called with:', email)
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`
      })
      
      if (error) {
        console.error('Reset password error:', error)
        throw new Error(error.message)
      }
      
      console.log('Reset password email sent successfully')
      
    } catch (error: any) {
      console.error('Reset password failed:', error)
      throw new Error(error.message || 'Reset password failed')
    }
  }

  const isAuthenticated = !!user && !!session
  const isVerified = !!user?.email_confirmed_at

  return (
    <AuthContext.Provider value={{
      user,
      session,
      loading,
      isAuthenticated,
      isVerified,
      signIn,
      signUp,
      signOut,
      resetPassword,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}