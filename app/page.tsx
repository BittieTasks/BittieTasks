'use client'

import { useAuth } from '@/components/auth/AuthProvider'
import BoldWelcomePage from '@/components/BoldWelcomePage'
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

  // Skip loading states and render the BoldWelcomePage directly
  if (!mounted) {
    return <BoldWelcomePage />
  }

  // Handle authentication redirect
  if (mounted && !loading && isAuthenticated) {
    router.push('/platform')
    return <BoldWelcomePage />
  }

  return <BoldWelcomePage />
}