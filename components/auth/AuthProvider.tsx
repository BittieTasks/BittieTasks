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
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state change:', event, session?.user?.email)
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)

      if (event === 'SIGNED_IN' && session?.user) {
        // Create or update user profile in our database
        await createUserProfile(session.user)
        
        // Auto-redirect to dashboard after successful sign in
        if (window.location.pathname === '/auth') {
          console.log('Auto-redirecting to dashboard after sign in')
          setTimeout(() => {
            window.location.href = '/dashboard'
          }, 1000)
        }
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const createUserProfile = async (authUser: User) => {
    try {
      // Get fresh session to ensure valid token
      const { data: { session: currentSession } } = await supabase.auth.getSession()
      
      if (!currentSession?.access_token) {
        console.error('No valid session token for profile creation')
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
        console.error('Failed to create user profile')
      }
    } catch (error) {
      console.error('Error creating user profile:', error)
    }
  }

  const signIn = async (email: string, password: string) => {
    console.log('AuthProvider signIn called with:', email)
    
    // First attempt normal sign in
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    
    console.log('Sign in result:', { data, error })
    
    if (error) {
      console.error('Sign in error details:', error)
      
      // If it's an unconfirmed email error, try to resend confirmation
      if (error.message.includes('Email not confirmed') || 
          error.message.includes('Invalid login credentials')) {
        
        try {
          // Try to resend confirmation email
          await supabase.auth.resend({
            type: 'signup',
            email,
          })
          
          // Provide helpful message
          throw new Error('Account exists but needs email verification. Please check your email (including spam folder) for a verification link, then try signing in again.')
        } catch (resendError) {
          // If resend fails, still provide helpful message
          throw new Error('Account exists but email verification is required. Please check your email for a verification link, or contact support if needed.')
        }
      }
      
      throw error
    }
  }

  const signUp = async (email: string, password: string, userData?: any) => {
    console.log('AuthProvider signUp called with:', email, userData)
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData,
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    
    console.log('Sign up result:', { data, error })
    
    if (error) {
      console.error('Sign up error details:', error)
      // Provide user-friendly error messages
      if (error.message.includes('Email not confirmed')) {
        throw new Error('Please check your email and click the confirmation link before signing in.')
      }
      if (error.message.includes('User already registered')) {
        throw new Error('An account with this email already exists. Try signing in instead.')
      }
      if (error.message.includes('Password is known to be weak')) {
        throw new Error('Please use a stronger password with uppercase, lowercase, numbers and special characters.')
      }
      if (error.message.includes('Error sending confirmation email')) {
        throw new Error('Account created but email verification is temporarily unavailable. Please try signing in.')
      }
      throw error
    }
    
    // Check if user was created successfully
    if (data.user) {
      if (data.session) {
        // User is immediately signed in (email confirmation disabled)
        return
      } else {
        // User created but needs email verification
        throw new Error('Account created but email verification is temporarily unavailable. Please try signing in.')
      }
    } else {
      throw new Error('Account creation failed. Please try again.')
    }
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
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
    isAuthenticated: mounted && !!user,
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