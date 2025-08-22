'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/components/auth/SimpleAuthProvider'
import AuthenticatedApp from '@/components/AuthenticatedApp'

type AppSection = 'dashboard' | 'solo' | 'community' | 'corporate' | 'barter' | 'profile' | 'settings'

export default function UnifiedAppRouter() {
  const { isAuthenticated, loading: authLoading } = useAuth()
  const pathname = usePathname()
  const router = useRouter()
  const [initialSection, setInitialSection] = useState<AppSection>('dashboard')

  // Map paths to sections - always update regardless of auth state to preserve navigation
  useEffect(() => {
    const pathToSection: Record<string, AppSection> = {
      '/dashboard': 'dashboard',
      '/solo': 'solo', 
      '/community': 'community',
      '/corporate': 'corporate',
      '/barter': 'barter',
      '/profile': 'profile',
      '/settings': 'settings'
    }

    const section = pathToSection[pathname] || 'dashboard'
    setInitialSection(section)
    
    // Debug logging for navigation state
    console.log('UnifiedAppRouter: pathname changed to', pathname, '-> section:', section)
  }, [pathname])

  // Redirect unauthenticated users immediately  
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      const currentPath = pathname
      if (currentPath !== '/auth' && currentPath !== '/auth/login' && currentPath !== '/' && currentPath !== '/sample-tasks' && currentPath !== '/subscribe' && !currentPath.startsWith('/subscription/')) {
        console.log('UnifiedAppRouter: redirecting unauthenticated user from', currentPath, 'to auth/login')
        router.replace(`/auth/login?redirectTo=${encodeURIComponent(currentPath)}`)
      }
    }
  }, [authLoading, isAuthenticated, pathname, router])

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Redirecting to sign in...</p>
        </div>
      </div>
    )
  }

  return <AuthenticatedApp initialSection={initialSection} />
}