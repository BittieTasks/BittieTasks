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
    if (!mounted) return
    
    console.log('Starting auth initialization...')
    
    // Get initial session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error('Error getting session:', error)
        setLoading(false)
        return
      }
      
      console.log('Initial session check:', {
        hasSession: !!session,
        userEmail: session?.user?.email,
        isConfirmed: !!session?.user?.email_confirmed_at,
      })
      
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    }).catch((error) => {
      console.error('Session fetch failed:', error)
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', {
          event,
          hasSession: !!session,
          userEmail: session?.user?.email,
          isConfirmed: !!session?.user?.email_confirmed_at
        })
        
        setSession(session)
        setUser(session?.user ?? null)
        setLoading(false)
        
        // Handle successful sign in
        if (event === 'SIGNED_IN' && session?.user?.email_confirmed_at) {
          console.log('User successfully signed in and verified')
          
          // Create user profile if needed
          try {
            await createUserProfile(session.user)
          } catch (error) {
            console.error('Error creating user profile:', error)
          }
          
          // Only redirect to dashboard if not on subscription-related pages
          const currentPath = window.location.pathname
          if (!currentPath.startsWith('/subscribe') && !currentPath.startsWith('/subscription/')) {
            console.log('Redirecting to dashboard from:', currentPath)
            setTimeout(() => {
              window.location.href = '/dashboard'
            }, 1000)
          } else {
            console.log('Staying on subscription page, not redirecting to dashboard')
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