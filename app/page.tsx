'use client'

import { useAuth } from '../components/auth/AuthProvider'
import WelcomePage from '../components/WelcomePage'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function HomePage() {
  const { isAuthenticated, loading } = useAuth()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted && !loading && isAuthenticated) {
      router.push('/platform')
    }
  }, [isAuthenticated, loading, router, mounted])

  // Always show WelcomePage to prevent hydration mismatch
  // Authentication redirect happens after mount
  if (!mounted) {
    return null // Return nothing during SSR
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-500 via-blue-500 to-green-600 flex items-center justify-center">
        <div className="bg-white/90 backdrop-blur-sm border border-green-200 rounded-2xl p-8 text-center shadow-lg">
          <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-500 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-white font-bold text-2xl">B</span>
          </div>
          <p className="text-gray-700">Loading BittieTasks...</p>
        </div>
      </div>
    )
  }

  return <WelcomePage />
}