import { NextRequest, NextResponse } from 'next/server'
import { SubscriptionService } from '@/lib/subscription-service'
import { createServerClient } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const subscriptionService = new SubscriptionService()
    
    // Test environment variables
    const envCheck = {
      STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY ? 'loaded' : 'missing',
      STRIPE_PRO_PRICE_ID: process.env.STRIPE_PRO_PRICE_ID || 'missing',
      STRIPE_PREMIUM_PRICE_ID: process.env.STRIPE_PREMIUM_PRICE_ID || 'missing',
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'loaded' : 'missing',
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'loaded' : 'missing'
    }
    
    // Test subscription plans
    const plans = subscriptionService.getSubscriptionPlans()
    
    return NextResponse.json({
      status: 'Stripe Debug Information',
      timestamp: new Date().toISOString(),
      environment: envCheck,
      plans: plans,
      nodeEnv: process.env.NODE_ENV,
      vercelEnv: process.env.VERCEL_ENV
    })
  } catch (error: any) {
    return NextResponse.json({
      error: 'Debug failed',
      message: error.message,
      stack: error.stack
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const subscriptionService = new SubscriptionService()
  
  try {
    // Test with a mock user for debugging
    const mockUser = {
      id: 'debug-user-123',
      email: 'test@bittietasks.com',
      email_confirmed_at: new Date().toISOString()
    }
    
    const { planType } = await request.json()
    
    if (!planType || !['pro', 'premium'].includes(planType)) {
      return NextResponse.json({ 
        error: 'Invalid plan type',
        message: 'Plan must be "pro" or "premium"' 
      }, { status: 400 })
    }

    console.log('=== STRIPE DEBUG TEST STARTING ===')
    console.log('Testing subscription creation for plan:', planType)
    console.log('Mock user:', mockUser)

    // Test subscription creation
    const result = await subscriptionService.createCheckoutSession(mockUser, planType)
    
    console.log('=== STRIPE DEBUG TEST RESULT ===')
    console.log('Result:', result)

    return NextResponse.json({
      debug: true,
      planType,
      mockUser,
      result,
      timestamp: new Date().toISOString()
    })

  } catch (error: any) {
    console.error('=== STRIPE DEBUG TEST ERROR ===')
    console.error('Error details:', {
      message: error.message,
      type: error.type,
      code: error.code,
      stack: error.stack
    })
    
    return NextResponse.json({ 
      error: 'Debug test failed',
      details: {
        message: error.message,
        type: error.type,
        code: error.code
      }
    }, { status: 500 })
  }
}