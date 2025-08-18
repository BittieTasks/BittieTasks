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
function getSupabaseAdmin() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Missing required Supabase environment variables')
  }
  
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
}

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
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        
        // Check if this is for a subscription (has invoice metadata)
        if (paymentIntent.invoice) {
          console.log('Payment succeeded for subscription:', paymentIntent.id)
          // Handle subscription payment success
          const stripe = getStripe()
          const invoice = await stripe.invoices.retrieve(paymentIntent.invoice as string)
          
          if (invoice.subscription) {
            const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string)
            const customer = await stripe.customers.retrieve(subscription.customer as string)
            
            if (typeof customer !== 'string' && customer.metadata?.supabase_user_id) {
              const userId = customer.metadata.supabase_user_id
              const supabaseAdmin = getSupabaseAdmin()
              
              const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
                user_metadata: {
                  subscription_plan: subscription.metadata?.plan_type || 'pro',
                  stripe_customer_id: customer.id,
                  subscription_status: 'active',
                  subscription_id: subscription.id
                }
              })
              
              if (error) {
                console.error(`Failed to update user ${userId} subscription:`, error)
              } else {
                console.log(`Updated subscription for user ${userId} via payment_intent.succeeded`)
              }
            }
          }
        }
        break
      }
      
      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        console.log('Payment failed:', paymentIntent.id)
        // Could handle failed subscription payments here
        break
      }
      
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        
        if (session.mode === 'subscription') {
          // Update user subscription status in Supabase
          const userId = session.metadata?.user_id
          const planType = session.metadata?.plan_type
          
          if (userId && planType) {
            // Update user metadata with subscription info
            const supabaseAdmin = getSupabaseAdmin()
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
        const supabaseAdmin = getSupabaseAdmin()
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
        const supabaseAdmin = getSupabaseAdmin()
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