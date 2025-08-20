'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function DashboardPage() {
  // This page should use the unified app router with sidebar navigation
  // Redirect to use the proper navigation system
  const router = useRouter()
  
  useEffect(() => {
    // Redirect to use the unified app with sidebar navigation
    router.replace('/dashboard-app')
  }, [router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading dashboard with navigation...</p>
      </div>
    </div>
  )
}