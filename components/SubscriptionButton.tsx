'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/components/auth/AuthProvider'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/lib/supabase'

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



      // 2. Get fresh token and create subscription
      const { data: { session: freshSession }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError || !freshSession?.access_token) {
        throw new Error('Unable to get fresh authentication token')
      }



      const response = await fetch('/api/subscription/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${freshSession.access_token}`
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