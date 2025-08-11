'use client'

import { useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '../../../lib/supabase'
import { Loader2 } from 'lucide-react'

function AuthCallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Auth callback error:', error.message)
          router.push('/auth?error=callback_error')
          return
        }

        if (data.session) {
          // Email verification successful, redirect to platform
          router.push('/platform')
        } else {
          // No session, redirect to auth page
          router.push('/auth')
        }
      } catch (error) {
        console.error('Unexpected error in auth callback:', error)
        router.push('/auth?error=unexpected_error')
      }
    }

    handleAuthCallback()
  }, [router, searchParams])

  return (
    <div className="page-layout">
      <div className="container-clean section-clean flex items-center justify-center min-h-screen">
        <div className="card-clean p-12 text-center max-w-md mx-auto">
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary mb-4" />
          <h2 className="text-subheading mb-2">Verifying your account...</h2>
          <p className="text-body text-muted-foreground">Please wait while we complete your email verification.</p>
        </div>
      </div>
    </div>
  )
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="page-layout">
        <div className="container-clean section-clean flex items-center justify-center min-h-screen">
          <div className="card-clean p-12 text-center max-w-md mx-auto">
            <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary mb-4" />
            <h2 className="text-subheading mb-2">Loading...</h2>
          </div>
        </div>
      </div>
    }>
      <AuthCallbackContent />
    </Suspense>
  )
}