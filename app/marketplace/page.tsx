'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/auth/AuthProvider'
import { Loader2 } from 'lucide-react'

export default function MarketplacePage() {
  const router = useRouter()
  const { isAuthenticated, loading } = useAuth()

  useEffect(() => {
    // Redirect authenticated users to dashboard instead of staying on marketplace
    if (!loading && isAuthenticated) {
      router.replace('/dashboard')
    } else if (!loading && !isAuthenticated) {
      router.replace('/')
    }
  }, [router, isAuthenticated, loading])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <Loader2 className="h-6 w-6 animate-spin text-teal-600" />
          <span className="text-gray-600">Redirecting...</span>
        </div>
      </div>
    )
  }

  // This should never render since we redirect above
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Marketplace</h1>
        <p className="text-gray-600">Redirecting to your dashboard...</p>
      </div>
    </div>
  )
}