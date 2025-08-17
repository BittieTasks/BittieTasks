'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/components/auth/AuthProvider'
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

  // Redirect unauthenticated users (but allow time for auth to resolve)
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      const currentPath = pathname
      if (currentPath !== '/auth' && currentPath !== '/' && currentPath !== '/sample-tasks') {
        console.log('UnifiedAppRouter: redirecting unauthenticated user from', currentPath, 'to auth')
        // Add a delay to allow authentication to complete but not too long
        const timer = setTimeout(() => {
          router.push(`/auth?redirect=${encodeURIComponent(currentPath)}`)
        }, 1500) // Slightly shorter delay to be more responsive
        return () => clearTimeout(timer)
      }
    }
  }, [authLoading, isAuthenticated, pathname, router])

  // Show loading or redirect while checking auth
  if (authLoading) {
    return null // AuthenticatedApp will show its own loading
  }

  if (!isAuthenticated) {
    return null // Will redirect to auth
  }

  return <AuthenticatedApp initialSection={initialSection} />
}