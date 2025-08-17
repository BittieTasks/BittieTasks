import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import Stripe from 'stripe'

if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
  throw new Error('Missing required Stripe secrets')
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('stripe-signature')

    if (!signature) {
      return NextResponse.json({ error: 'No signature provided' }, { status: 400 })
    }

    // Verify webhook signature
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
            // Create admin client to update user metadata
            const supabase = createServerClient(request)
            
            await supabase.auth.admin.updateUserById(userId, {
              user_metadata: {
                subscription_plan: planType,
                stripe_customer_id: session.customer,
                subscription_status: 'active',
                subscription_id: session.subscription
              }
            })
            
            console.log(`Updated subscription for user ${userId} to ${planType} plan`)
          }
        }
        break
      }
      
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        
        // Find user by customer ID and update subscription status
        const supabase = createServerClient(request)
        
        const { data: users } = await supabase
          .from('auth.users')
          .select('id, raw_user_meta_data')
          .eq('raw_user_meta_data->stripe_customer_id', subscription.customer)
        
        if (users && users.length > 0) {
          const user = users[0]
          await supabase.auth.admin.updateUserById(user.id, {
            user_metadata: {
              ...user.raw_user_meta_data,
              subscription_status: subscription.status
            }
          })
          
          console.log(`Updated subscription status for user ${user.id} to ${subscription.status}`)
        }
        break
      }
      
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        
        // Find user by customer ID and downgrade to free plan
        const supabase = createServerClient(request)
        
        const { data: users } = await supabase
          .from('auth.users')
          .select('id, raw_user_meta_data')
          .eq('raw_user_meta_data->stripe_customer_id', subscription.customer)
        
        if (users && users.length > 0) {
          const user = users[0]
          await supabase.auth.admin.updateUserById(user.id, {
            user_metadata: {
              ...user.raw_user_meta_data,
              subscription_plan: 'free',
              subscription_status: 'canceled'
            }
          })
          
          console.log(`Downgraded user ${user.id} to free plan`)
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