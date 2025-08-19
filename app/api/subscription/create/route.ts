import { NextRequest, NextResponse } from 'next/server'
import { SubscriptionService } from '@/lib/subscription-service'
import { createServerClient } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  const subscriptionService = new SubscriptionService()
  
  try {
    // Production-safe environment check
    const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL_ENV === 'production'
    
    // Get authorization header with multiple fallbacks for production
    const authHeader = request.headers.get('Authorization') || 
                      request.headers.get('authorization') ||
                      request.headers.get('Bearer')
    
    if (isProduction) {
      console.log('Production subscription request:', {
        hasAuthHeader: !!authHeader,
        headerKeys: Array.from(request.headers.keys()),
        url: request.url
      })
    }
    
    // Use the exact same authentication pattern as profile route
    const supabase = createServerClient(request)
    
    // Extract the JWT token from Authorization header
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ 
        error: 'Authentication required',
        debug: { message: 'Missing or invalid Authorization header' }
      }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')
    
    // Get user using the extracted token
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    

    
    if (authError || !user) {
      console.error('POST /api/subscription/create auth error:', authError?.message)
      return NextResponse.json({ 
        error: 'Authentication required',
        debug: {
          authError: authError?.message,
          tokenPreview: token?.substring(0, 20)
        }
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