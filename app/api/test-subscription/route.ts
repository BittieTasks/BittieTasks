import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import Stripe from 'stripe'

// Test endpoint to verify subscription flow works
// This endpoint simulates the subscription creation with a test user

function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('Missing required Stripe secret: STRIPE_SECRET_KEY')
  }
  
  return new Stripe(process.env.STRIPE_SECRET_KEY)
}

export async function GET(request: NextRequest) {
  try {
    const stripe = getStripe()
    
    // Test 1: Verify Stripe connection
    console.log('Testing Stripe connection...')
    const balance = await stripe.balance.retrieve()
    console.log('✅ Stripe connected successfully')
    
    // Test 2: Create a test customer
    console.log('Creating test customer...')
    const customer = await stripe.customers.create({
      email: 'test@bittietasks.com',
      metadata: {
        test_user: 'true',
        supabase_user_id: 'test-user-123',
      },
    })
    console.log('✅ Test customer created:', customer.id)
    
    // Test 3: Create a test checkout session
    console.log('Creating test checkout session...')
    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'BittieTasks Pro Earner Plan (Test)',
              description: 'Monthly subscription with 7% platform fees',
            },
            unit_amount: 999, // $9.99
            recurring: {
              interval: 'month',
            },
          },
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: 'https://bittietasks.com/dashboard?subscription=success&plan=pro',
      cancel_url: 'https://bittietasks.com/subscribe?canceled=true',
      metadata: {
        user_id: 'test-user-123',
        plan_type: 'pro',
        test_mode: 'true'
      },
    })
    console.log('✅ Test checkout session created')
    
    // Clean up test customer
    await stripe.customers.del(customer.id)
    console.log('✅ Test customer cleaned up')
    
    return NextResponse.json({
      success: true,
      message: 'Stripe subscription flow test completed successfully',
      tests: {
        stripe_connection: '✅ Connected',
        customer_creation: '✅ Working', 
        checkout_session: '✅ Working',
        session_url_generated: !!session.url
      },
      sample_checkout_url: session.url
    })
    
  } catch (error) {
    console.error('Test failed:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      tests: {
        stripe_connection: '❌ Failed',
        details: error
      }
    }, { status: 500 })
  }
}