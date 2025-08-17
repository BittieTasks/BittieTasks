import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import Stripe from 'stripe'

function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Missing required Stripe secrets or Supabase service role key')
  }
  
  return new Stripe(process.env.STRIPE_SECRET_KEY)
}

// Create admin Supabase client for updating user data
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
)

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('stripe-signature')

    if (!signature) {
      return NextResponse.json({ error: 'No signature provided' }, { status: 400 })
    }

    // Verify webhook signature
    const stripe = getStripe()
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )

    // Handle different webhook events
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        
        if (session.mode === 'subscription') {
          // Update user subscription status in Supabase
          const userId = session.metadata?.user_id
          const planType = session.metadata?.plan_type
          
          if (userId && planType) {
            // Update user metadata with subscription info
            const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
              user_metadata: {
                subscription_plan: planType,
                stripe_customer_id: session.customer,
                subscription_status: 'active',
                subscription_id: session.subscription
              }
            })
            
            if (error) {
              console.error(`Failed to update user ${userId} subscription:`, error)
            } else {
              console.log(`Updated subscription for user ${userId} to ${planType} plan`)
            }
          }
        }
        break
      }
      
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        
        // Find user by customer ID and update subscription status
        const { data: users } = await supabaseAdmin
          .from('auth.users')
          .select('id, raw_user_meta_data')
          .eq('raw_user_meta_data->stripe_customer_id', subscription.customer)
        
        if (users && users.length > 0) {
          const user = users[0]
          const { error } = await supabaseAdmin.auth.admin.updateUserById(user.id, {
            user_metadata: {
              ...user.raw_user_meta_data,
              subscription_status: subscription.status
            }
          })
          
          if (error) {
            console.error(`Failed to update user ${user.id} subscription status:`, error)
          } else {
            console.log(`Updated subscription status for user ${user.id} to ${subscription.status}`)
          }
        }
        break
      }
      
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        
        // Find user by customer ID and downgrade to free plan
        const { data: users } = await supabaseAdmin
          .from('auth.users')
          .select('id, raw_user_meta_data')
          .eq('raw_user_meta_data->stripe_customer_id', subscription.customer)
        
        if (users && users.length > 0) {
          const user = users[0]
          const { error } = await supabaseAdmin.auth.admin.updateUserById(user.id, {
            user_metadata: {
              ...user.raw_user_meta_data,
              subscription_plan: 'free',
              subscription_status: 'canceled'
            }
          })
          
          if (error) {
            console.error(`Failed to downgrade user ${user.id}:`, error)
          } else {
            console.log(`Downgraded user ${user.id} to free plan`)
          }
        }
        break
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Stripe webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 400 }
    )
  }
}