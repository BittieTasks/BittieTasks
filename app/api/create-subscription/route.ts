import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import Stripe from 'stripe'

function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('Missing required Stripe secret: STRIPE_SECRET_KEY')
  }
  
  return new Stripe(process.env.STRIPE_SECRET_KEY)
}

// Create server client with service role for user management
function createServerClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
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

    // Extract the JWT token
    const jwt = authHeader.replace('Bearer ', '')
    
    // Create Supabase client for user verification
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    
    const authClient = createClient(supabaseUrl, supabaseAnonKey)
    
    // Verify the JWT token and get user
    const { data: { user }, error: authError } = await authClient.auth.getUser(jwt)
    if (authError || !user) {
      console.error('Auth error:', authError)
      return NextResponse.json({ error: 'Authentication required - invalid token' }, { status: 401 })
    }

    // Create admin client for user metadata updates
    const supabase = createServerClient()

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

      // Update user metadata with customer ID using admin client
      await supabase.auth.admin.updateUserById(user.id, {
        user_metadata: { stripe_customer_id: customerId }
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