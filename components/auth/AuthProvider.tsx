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

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    let timeoutId: NodeJS.Timeout
    
    // Set a fallback timeout to prevent infinite loading
    timeoutId = setTimeout(() => {
      console.log('Auth timeout reached, setting loading to false')
      setLoading(false)
    }, 10000) // 10 second timeout
    
    // Get initial session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      clearTimeout(timeoutId)
      
      if (error) {
        console.error('Error getting session:', error)
      }
      
      console.log('Initial session loaded:', session?.user?.email || 'No user')
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    }).catch((error) => {
      clearTimeout(timeoutId)
      console.error('Session fetch failed:', error)
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state change:', event, session?.user?.email || 'No user')
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)

      if (event === 'SIGNED_IN' && session?.user) {
        // Handle redirect after successful sign in
        const redirectPath = localStorage.getItem('redirectAfterAuth')
        const pendingTaskId = localStorage.getItem('pendingTaskId')
        
        if (redirectPath && typeof window !== 'undefined') {
          localStorage.removeItem('redirectAfterAuth')
          if (pendingTaskId) {
            localStorage.removeItem('pendingTaskId')
            // Redirect to the page with task selection
            setTimeout(() => {
              window.location.href = `${redirectPath}?selectTask=${pendingTaskId}`
            }, 1000)
          } else {
            setTimeout(() => {
              window.location.href = redirectPath
            }, 1000)
          }
        }
        
        // Only create profile for verified users to avoid conflicts with email verification
        if (session.user.email_confirmed_at) {
          try {
            await createUserProfile(session.user)
          } catch (error) {
            console.error('Error creating user profile:', error)
          }
          
          // Auto-redirect to dashboard after successful sign in (only if verified)
          if (typeof window !== 'undefined' && window.location.pathname === '/auth') {
            console.log('Auto-redirecting to dashboard after sign in')
            setTimeout(() => {
              window.location.href = '/dashboard'
            }, 100) // Small delay to ensure state is updated
          }
        } else {
          console.log('User not verified yet, skipping profile creation and redirect')
        }
      }
      
      if (event === 'SIGNED_OUT') {
        console.log('User signed out, clearing state')
        setSession(null)
        setUser(null)
      }
    })

    return () => {
      clearTimeout(timeoutId)
      subscription.unsubscribe()
    }
  }, [])

  const createUserProfile = async (authUser: User) => {
    try {
      // Get fresh session to ensure valid token
      const { data: { session: currentSession } } = await supabase.auth.getSession()
      
      if (!currentSession?.access_token) {
        console.log('No valid session token for profile creation, skipping...')
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
      // First attempt normal sign in
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      
      console.log('Sign in result:', { data, error })
      
      if (error) {
        console.error('Sign in error details:', error)
        
        // Handle email not confirmed error specifically
        if (error.message.includes('Email not confirmed') || error.message.includes('email_not_confirmed')) {
          throw new Error('Please verify your email before signing in. Check your email for the verification link.')
        }
        
        throw new Error(error.message)
      }
      
      // Success - the onAuthStateChange listener will handle the redirect
      console.log('Sign in successful, user:', data.user?.email)
      
    } catch (error: any) {
      console.error('Sign in failed:', error)
      // Re-throw to be caught by the component
      throw new Error(error.message || 'Sign in failed. Please try again.')
    }
  }

  const signUp = async (email: string, password: string, userData?: any) => {
    console.log('AuthProvider signUp called with:', email, userData)
    
    try {
      // Use our custom signup API instead of Supabase directly
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
        throw new Error(result.error || 'Signup failed')
      }

      if (result.success) {
        console.log('Custom signup successful:', result.message)
        return result
      } else {
        throw new Error(result.error || 'Signup failed')
      }
    } catch (error: any) {
      console.error('Custom signup failed:', error)
      throw new Error(error.message || 'Signup failed. Please try again.')
    }
  }

  const signOut = async () => {
    try {
      console.log('SignOut initiated...')
      
      // Clear local state first
      setUser(null)
      setSession(null)
      
      // Sign out from Supabase
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error('SignOut error:', error)
        throw error
      }
      
      console.log('SignOut successful')
      
      // Clear any cached data
      if (typeof window !== 'undefined') {
        // Clear localStorage
        localStorage.clear()
        
        // Redirect to home page after successful sign out
        window.location.href = '/'
      }
    } catch (error: any) {
      console.error('SignOut failed:', error)
      // Even if there's an error, try to clear local state and redirect
      setUser(null)
      setSession(null)
      if (typeof window !== 'undefined') {
        localStorage.clear()
        window.location.href = '/'
      }
      throw error
    }
  }

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    })
    
    if (error) throw error
  }

  const value: AuthContextType = {
    user,
    session,
    loading: loading || !mounted,
    isAuthenticated: mounted && !!user && !!session,
    isVerified: mounted && !!(user?.email_confirmed_at),
    signIn,
    signUp,
    signOut,
    resetPassword,
  }

  // Show loading state properly
  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 bg-teal-600 rounded-lg mx-auto mb-4 animate-pulse"></div>
          <p className="text-gray-600">Loading BittieTasks...</p>
        </div>
      </div>
    )
  }

  return (
    <AuthContext.Provider value={value}>
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