'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { AuthService } from '@/lib/auth-service'
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
  const authService = new AuthService()

  const handleSubscribe = async () => {
    setIsLoading(true)
    
    try {
      console.log(`=== Starting ${planName} subscription ===`)
      
      // 1. Get current session from the global Supabase client (used by dashboard)
      const { supabase } = await import('@/lib/supabase')
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError || !session?.access_token) {
        console.error('Session error:', sessionError?.message)
        toast({
          title: "Authentication Required",
          description: "Please sign in to subscribe.",
          variant: "destructive",
        })
        return
      }

      if (!session.user?.email_confirmed_at) {
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

      if (!response.ok) {
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