'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { ManualAuthManager } from '@/lib/manual-auth'
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
  console.log('AuthProvider render:', { 
    loading, 
    hasUser: !!user, 
    userEmail: user?.email,
    mounted, 
    isAuthenticated: !!user && !!user.email 
  })

  useEffect(() => {
    console.log('AuthProvider: Setting mounted to true')
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return
    
    console.log('AuthProvider: Starting manual auth initialization...')
    
    // Check manual auth first - this is our primary authentication system
    const initializeAuth = async () => {
      try {
        const storedSession = ManualAuthManager.getStoredSession()
        
        if (storedSession) {
          console.log('AuthProvider: Manual session found - creating unified session object')
          
          // Create a unified session object that components expect
          const unifiedSession = {
            access_token: storedSession.access_token,
            refresh_token: storedSession.refresh_token,
            expires_at: storedSession.expires_at,
            token_type: 'bearer',
            user: storedSession.user
          } as Session
          
          setSession(unifiedSession) // Provide the session data that components expect
          setUser(storedSession.user)
          setLoading(false) // Stop loading immediately when manual session found
          
          // Try to refresh if needed
          const refreshedSession = await ManualAuthManager.refreshIfNeeded()
          if (refreshedSession && refreshedSession.user) {
            const refreshedUnifiedSession = {
              access_token: refreshedSession.access_token,
              refresh_token: refreshedSession.refresh_token,
              expires_at: refreshedSession.expires_at,
              token_type: 'bearer',
              user: refreshedSession.user
            } as Session
            setSession(refreshedUnifiedSession)
            setUser(refreshedSession.user)
          }
        } else {
          console.log('AuthProvider: No manual session found - checking localStorage debug...')
          console.log('AuthProvider localStorage debug:', {
            hasLocalStorage: typeof localStorage !== 'undefined',
            sessionKey: 'bittie_manual_session',
            rawValue: typeof localStorage !== 'undefined' ? localStorage.getItem('bittie_manual_session') : 'undefined'
          })
          setSession(null)
          setUser(null)
          setLoading(false) // Stop loading immediately - no need to check Supabase
        }
      } catch (error) {
        console.error('AuthProvider: Manual auth initialization failed:', error)
        setSession(null)
        setUser(null)
        setLoading(false)
      }
    }
    
    // Add timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      console.log('AuthProvider: Timeout reached, setting loading to false')
      setLoading(false)
    }, 3000)
    
    initializeAuth().finally(() => {
      clearTimeout(timeout)
    })

    // Still listen to Supabase events for new sign-ins
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('AuthProvider: Auth state change:', {
          event,
          hasSession: !!session,
          userEmail: session?.user?.email
        })
        
        if (event === 'SIGNED_IN' && session?.user) {
          console.log('AuthProvider: New sign-in detected, saving manually')
          ManualAuthManager.saveSession(session)
          setSession(session)
          setUser(session.user)
          setLoading(false)
          
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
      
      console.log('Sign in result:', { 
        hasUser: !!data.user, 
        hasSession: !!data.session,
        hasAccessToken: !!data.session?.access_token,
        hasRefreshToken: !!data.session?.refresh_token,
        tokenLength: data.session?.access_token?.length || 0,
        error: error?.message 
      })
      
      if (error) {
        console.error('Sign in error details:', error)
        
        if (error.message.includes('Email not confirmed') || error.message.includes('email_not_confirmed')) {
          throw new Error('Please verify your email before signing in. Check your email for the verification link.')
        }
        
        throw new Error(error.message)
      }
      
      // Manually save session if it exists but isn't persisting
      if (data.session && !localStorage.getItem('sb-ttgbotlcbzmmyqawnjpj-auth-token')) {
        console.log('AuthProvider: Manually persisting session to localStorage')
        localStorage.setItem('sb-ttgbotlcbzmmyqawnjpj-auth-token', JSON.stringify(data.session))
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
      // Clear manual auth session first
      ManualAuthManager.clearSession()
      console.log('Manual session cleared')
      
      // Clear local state immediately  
      setUser(null)
      setSession(null)
      setLoading(false)
      
      // Try to clear Supabase session (don't let this block logout)
      try {
        const { error } = await supabase.auth.signOut()
        if (error) {
          console.warn('Supabase sign out error (continuing anyway):', error)
        } else {
          console.log('Supabase sign out successful')
        }
      } catch (supabaseError) {
        console.warn('Supabase signOut failed (continuing anyway):', supabaseError)
      }
      
      // Force redirect to home page
      console.log('Redirecting to home page after logout')
      window.location.href = '/'
      
    } catch (error: any) {
      console.error('Sign out failed:', error)
      // Even on error, clear everything and redirect
      ManualAuthManager.clearSession()
      setUser(null)
      setSession(null)
      setLoading(false)
      window.location.href = '/'
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

  // For manual authentication, we need both user and email to be present
  const isAuthenticated = !!user && !!user.email
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