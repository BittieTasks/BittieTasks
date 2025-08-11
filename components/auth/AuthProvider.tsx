'use client'

import { createContext, useContext, useEffect, useState } from 'react'

// Mock User type for demo
interface User {
  id: string
  email: string
  user_metadata?: any
}

interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check localStorage for existing session
    const savedUser = localStorage.getItem('bittie_user')
    if (savedUser) {
      setUser(JSON.parse(savedUser))
    }
    setLoading(false)
  }, [])

  const signIn = async (email: string, password: string) => {
    // Mock successful sign in
    if (email && password) {
      const mockUser = { 
        id: 'demo-user-123', 
        email, 
        user_metadata: { first_name: 'Demo', last_name: 'User' }
      }
      setUser(mockUser)
      localStorage.setItem('bittie_user', JSON.stringify(mockUser))
    } else {
      throw new Error('Please enter email and password')
    }
  }

  const signUp = async (email: string, password: string) => {
    // Mock successful sign up
    if (email && password) {
      const mockUser = { 
        id: 'demo-user-123', 
        email, 
        user_metadata: { first_name: 'New', last_name: 'User' }
      }
      setUser(mockUser)
      localStorage.setItem('bittie_user', JSON.stringify(mockUser))
    } else {
      throw new Error('Please enter email and password')
    }
  }

  const signOut = async () => {
    setUser(null)
    localStorage.removeItem('bittie_user')
  }

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    isAuthenticated: !!user,
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