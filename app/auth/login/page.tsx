'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginRedirect() {
  const router = useRouter()

  useEffect(() => {
    // Redirect /auth/login to /auth while preserving any query parameters
    const urlParams = new URLSearchParams(window.location.search)
    const queryString = urlParams.toString()
    const redirectUrl = queryString ? `/auth?${queryString}` : '/auth'
    
    console.log('LoginRedirect: Redirecting from /auth/login to', redirectUrl)
    router.replace(redirectUrl)
  }, [router])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting to sign in...</p>
      </div>
    </div>
  )
}