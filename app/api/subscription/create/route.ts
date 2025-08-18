import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/lib/auth-service'
import { SubscriptionService } from '@/lib/subscription-service'

export async function POST(request: NextRequest) {
  const authService = new AuthService()
  const subscriptionService = new SubscriptionService()
  
  try {
    console.log('=== New Subscription Request ===')
    
    // 1. Extract and validate auth token
    const authHeader = request.headers.get('Authorization')
    const tokenResult = authService.extractTokenFromHeader(authHeader)
    
    if (!tokenResult.success) {
      console.error('Auth header validation failed:', tokenResult.error)
      return NextResponse.json({ 
        error: 'Authentication required',
        details: tokenResult.error 
      }, { status: 401 })
    }

    // 2. Validate user token
    const authResult = await authService.validateToken(tokenResult.token!)
    
    if (!authResult.success) {
      console.error('Token validation failed:', authResult.error)
      return NextResponse.json({ 
        error: 'Invalid authentication',
        details: authResult.error 
      }, { status: 401 })
    }

    console.log('User authenticated successfully:', authResult.user.id)

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
      authResult.user,
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