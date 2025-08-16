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

  // Map paths to sections
  useEffect(() => {
    if (!isAuthenticated || authLoading) return

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
  }, [pathname, isAuthenticated, authLoading])

  // Redirect unauthenticated users
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      const currentPath = pathname
      if (currentPath !== '/auth' && currentPath !== '/') {
        router.push(`/auth?redirect=${encodeURIComponent(currentPath)}`)
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