import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import Stripe from 'stripe'

function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('Missing required Stripe secret: STRIPE_SECRET_KEY')
  }
  
  return new Stripe(process.env.STRIPE_SECRET_KEY)
}

// Create server client with proper auth handling
function createServerClient(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    },
    global: {
      headers: {
        Authorization: request.headers.get('Authorization') || ''
      }
    }
  })
}

export async function POST(request: NextRequest) {
  try {
    // Check for Authorization header
    const authHeader = request.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authentication required - missing token' }, { status: 401 })
    }

    const supabase = createServerClient(request)
    
    // Get authenticated user using the token
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      console.error('Auth error:', authError)
      return NextResponse.json({ error: 'Authentication required - invalid token' }, { status: 401 })
    }

    const { planType, price } = await request.json()

    if (!planType || !price) {
      return NextResponse.json({ error: 'Plan type and price required' }, { status: 400 })
    }

    // Create or get Stripe customer
    let customerId = user.user_metadata?.stripe_customer_id

    if (!customerId) {
      const stripe = getStripe()
      const customer = await stripe.customers.create({
        email: user.email!,
        metadata: {
          supabase_user_id: user.id,
        },
      })
      customerId = customer.id

      // Update user metadata with customer ID
      await supabase.auth.updateUser({
        data: { stripe_customer_id: customerId }
      })
    }

    // Get the base URL for redirects
    const origin = request.headers.get('origin') || request.headers.get('referer')?.split('?')[0] || 'https://bittietasks.com'
    
    // Create Stripe checkout session
    const stripe = getStripe()
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `BittieTasks ${planType === 'pro' ? 'Pro Earner' : 'Power User'} Plan`,
              description: `Monthly subscription with ${planType === 'pro' ? '7%' : '5%'} platform fees`,
            },
            unit_amount: Math.round(price * 100), // Convert to cents
            recurring: {
              interval: 'month',
            },
          },
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${origin}/dashboard?subscription=success&plan=${planType}`,
      cancel_url: `${origin}/subscribe?canceled=true`,
      metadata: {
        user_id: user.id,
        plan_type: planType,
      },
    })

    return NextResponse.json({ sessionUrl: session.url })
  } catch (error) {
    console.error('Error creating subscription:', error)
    return NextResponse.json(
      { error: 'Failed to create subscription session' },
      { status: 500 }
    )
  }
}