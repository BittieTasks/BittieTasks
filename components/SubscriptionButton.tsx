'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/components/auth/AuthProvider'
import { useToast } from '@/hooks/use-toast'

interface SubscriptionButtonProps {
  planType: 'pro' | 'premium'
  planName: string
  price: number
  className?: string
}

export function SubscriptionButton({ planType, planName, price, className }: SubscriptionButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const { user, session, isAuthenticated, isVerified } = useAuth()

  const handleSubscribe = async () => {
    setIsLoading(true)
    
    try {
      if (process.env.NODE_ENV === 'development') {
        console.log(`=== Starting ${planName} subscription ===`)
        console.log('=== SUBSCRIPTION DEBUG ===', {
          isAuthenticated,
          isVerified,
          hasUser: !!user,
          hasSession: !!session,
          hasAccessToken: !!session?.access_token,
          userEmail: user?.email,
          tokenPreview: session?.access_token?.substring(0, 30),
          tokenLength: session?.access_token?.length,
          tokenSegments: session?.access_token?.split('.').length
        })
      }
      
      if (!isAuthenticated || !session?.access_token) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to subscribe.",
          variant: "destructive",
        })
        return
      }

      if (!isVerified) {
        toast({
          title: "Email Verification Required", 
          description: "Please verify your email before subscribing.",
          variant: "destructive",
        })
        return
      }

      console.log('User authenticated, creating subscription...')

      // 2. Create subscription with proper Authorization header
      const response = await fetch('/api/subscription/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ planType })
      })

      const result = await response.json()
      
      console.log('=== SUBSCRIPTION API RESPONSE ===', {
        status: response.status,
        ok: response.ok,
        result: result
      })

      if (!response.ok) {
        console.error('Subscription API failed:', {
          status: response.status,
          error: result.error,
          details: result.details
        })
        throw new Error(result.details || result.error || 'Subscription failed')
      }

      if (!result.checkoutUrl) {
        throw new Error('No checkout URL received')
      }

      console.log('Subscription created, redirecting to Stripe...')

      // 3. Redirect to Stripe checkout
      window.location.href = result.checkoutUrl

    } catch (error: any) {
      console.error('Subscription error:', error)
      
      let errorMessage = "Subscription failed. Please try again."
      
      if (error.message?.includes('authentication') || error.message?.includes('401')) {
        errorMessage = "Please sign in again to subscribe."
      } else if (error.message?.includes('email')) {
        errorMessage = "Please verify your email before subscribing."
      } else if (error.message?.includes('Invalid plan')) {
        errorMessage = "Invalid subscription plan selected."
      }
      
      toast({
        title: "Subscription Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      onClick={handleSubscribe}
      disabled={isLoading}
      className={className}
      data-testid={`subscribe-${planType}`}
    >
      {isLoading ? 'Processing...' : `Subscribe to ${planName} - $${price}/month`}
    </Button>
  )
}