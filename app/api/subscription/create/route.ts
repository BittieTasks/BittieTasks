import { NextRequest, NextResponse } from 'next/server'
import { SubscriptionService } from '@/lib/subscription-service'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  const subscriptionService = new SubscriptionService()
  
  try {
    console.log('=== New Subscription Request ===')
    
    // 1. Get user from Supabase session (using cookies)
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    
    // Extract session from cookies
    const cookies = request.headers.get('cookie') || ''
    const sessionMatch = cookies.match(/sb-[^=]+-auth-token=([^;]+)/)
    
    if (!sessionMatch) {
      console.error('No session cookie found')
      return NextResponse.json({ 
        error: 'Authentication required - please sign in',
        details: 'No active session' 
      }, { status: 401 })
    }

    // Get user from session
    const { data: { user }, error: userError } = await supabase.auth.getUser(sessionMatch[1])
    
    if (userError || !user) {
      console.error('Session validation failed:', userError?.message)
      return NextResponse.json({ 
        error: 'Invalid session - please sign in again',
        details: userError?.message 
      }, { status: 401 })
    }
    
    if (!user.email_confirmed_at) {
      console.error('Email not verified for user:', user.id)
      return NextResponse.json({ 
        error: 'Email verification required',
        details: 'Please verify your email before subscribing' 
      }, { status: 400 })
    }

    console.log('User authenticated successfully:', user.id)

    // 3. Parse request body
    const { planType } = await request.json()
    
    if (!planType || !['pro', 'premium'].includes(planType)) {
      return NextResponse.json({ 
        error: 'Invalid plan type',
        details: 'Plan must be "pro" or "premium"' 
      }, { status: 400 })
    }

    console.log('Creating subscription for plan:', planType)

    // 4. Create subscription checkout session
    const subscriptionResult = await subscriptionService.createCheckoutSession(
      user,
      planType
    )

    if (!subscriptionResult.success) {
      console.error('Subscription creation failed:', subscriptionResult.error)
      return NextResponse.json({ 
        error: 'Subscription creation failed',
        details: subscriptionResult.error 
      }, { status: 500 })
    }

    console.log('Subscription created successfully:', subscriptionResult.details)

    return NextResponse.json({
      success: true,
      checkoutUrl: subscriptionResult.checkoutUrl,
      sessionId: subscriptionResult.details?.sessionId
    })

  } catch (error: any) {
    console.error('Unexpected subscription error:', {
      message: error.message,
      stack: error.stack
    })
    
    return NextResponse.json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Please try again'
    }, { status: 500 })
  }
}