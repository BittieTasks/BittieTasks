import { NextRequest, NextResponse } from 'next/server'
import { SubscriptionService } from '@/lib/subscription-service'
import { createServerClient } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  const subscriptionService = new SubscriptionService()
  
  try {
    if (process.env.NODE_ENV === 'development') {
      console.log('=== New Subscription Request ===')
    }
    
    // Debug incoming request - check both cases for auth header
    const authHeader = request.headers.get('Authorization') || request.headers.get('authorization')
    if (process.env.NODE_ENV === 'development') {
      console.log('=== REQUEST DEBUG ===', {
        hasAuthHeader: !!authHeader,
        authHeaderPreview: authHeader?.substring(0, 30),
        contentType: request.headers.get('Content-Type')
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
    
    // Debug token format
    if (process.env.NODE_ENV === 'development') {
      console.log('=== TOKEN DEBUG ===', {
        tokenLength: token.length,
        tokenSegments: token.split('.').length,
        tokenStart: token.substring(0, 20),
        isValidJWT: token.split('.').length === 3
      })
    }
    
    // Get user using the extracted token - try both methods
    let user, authError
    
    // Method 1: Direct token validation (like profile route)
    const result1 = await supabase.auth.getUser(token)
    if (result1.data.user && !result1.error) {
      user = result1.data.user
      authError = null
    } else {
      // Method 2: Let Supabase handle token from headers (like other routes)
      const result2 = await supabase.auth.getUser()
      user = result2.data.user
      authError = result2.error
      
      if (process.env.NODE_ENV === 'development') {
        console.log('=== AUTH METHOD COMPARISON ===', {
          method1Error: result1.error?.message,
          method2Error: result2.error?.message,
          method1HasUser: !!result1.data.user,
          method2HasUser: !!result2.data.user
        })
      }
    }
    
    if (process.env.NODE_ENV === 'development') {
      console.log('=== AUTH RESULT DEBUG ===', {
        hasUser: !!user,
        userEmail: user?.email,
        userConfirmed: !!user?.email_confirmed_at,
        authError: authError?.message,
        userId: user?.id
      })
    }
    
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