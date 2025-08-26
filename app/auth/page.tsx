'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../components/auth/SimpleAuthProvider'
import { SimplePhoneAuthForm } from '@/components/auth/SimplePhoneAuthForm'

export default function AuthPage() {
  const { isAuthenticated, loading: authLoading } = useAuth()
  const router = useRouter()

  // Redirect authenticated users away from auth page
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      const urlParams = new URLSearchParams(window.location.search)
      const redirectTo = urlParams.get('redirectTo') || '/dashboard'
      console.log('AuthPage: Authenticated user detected, redirecting to:', redirectTo)
      router.replace(redirectTo)
    }
  }, [authLoading, isAuthenticated, router])

  // Show loading state while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    )
  }

  // Don't render auth form if user is already authenticated
  if (isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Redirecting to dashboard...</p>
        </div>
      </div>
    )
  }

  const handleAuthSuccess = () => {
    const urlParams = new URLSearchParams(window.location.search)
    const redirectTo = urlParams.get('redirectTo') || '/dashboard'
    console.log('Auth successful, redirecting to:', redirectTo)
    router.replace(redirectTo)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-lg mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-teal-800 mb-2">BittieTasks</h1>
            <p className="text-lg text-gray-600">
              Your neighborhood task sharing platform
            </p>
          </div>

          {/* Simple Auth Form */}
          <SimplePhoneAuthForm onSuccess={handleAuthSuccess} />

          {/* Footer */}
          <div className="text-center mt-8">
            <p className="text-sm text-gray-500">
              By continuing, you agree to our Terms of Service and Privacy Policy
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}