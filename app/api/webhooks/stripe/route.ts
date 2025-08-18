import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { SubscriptionService } from '@/lib/subscription-service'

export async function POST(request: NextRequest) {
  const subscriptionService = new SubscriptionService()
  
  try {
    // Initialize Stripe and webhook secret at runtime
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
    
    if (!stripeSecretKey) {
      console.error('STRIPE_SECRET_KEY not configured')
      return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 })
    }
    
    if (!webhookSecret) {
      console.error('STRIPE_WEBHOOK_SECRET not configured')
      return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 })
    }
    
    const stripe = new Stripe(stripeSecretKey)
    const body = await request.text()
    const signature = request.headers.get('stripe-signature')!

    console.log('=== Stripe Webhook Received ===')

    // Verify webhook signature
    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    console.log('Webhook event type:', event.type)

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        console.log('Checkout completed:', {
          sessionId: session.id,
          customerId: session.customer,
          subscriptionId: session.subscription
        })

        if (session.mode === 'subscription' && session.subscription) {
          const subscription = await stripe.subscriptions.retrieve(session.subscription as string)
          const planType = session.metadata?.plan_type || 'pro'
          
          const result = await subscriptionService.handleSubscriptionSuccess(
            session.customer as string,
            subscription.id,
            planType
          )

          if (!result.success) {
            console.error('Failed to handle subscription success:', result.error)
            return NextResponse.json({ error: result.error }, { status: 500 })
          }

          console.log('Subscription activated successfully')
        }
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        console.log('Subscription updated:', subscription.id, subscription.status)
        
        // Handle subscription status changes (active, canceled, etc.)
        if (subscription.status === 'canceled') {
          const result = await subscriptionService.handleSubscriptionSuccess(
            subscription.customer as string,
            subscription.id,
            'canceled'
          )
          console.log('Subscription cancellation handled:', result.success)
        }
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        console.log('Subscription deleted:', subscription.id)
        
        const result = await subscriptionService.handleSubscriptionSuccess(
          subscription.customer as string,
          subscription.id,
          'canceled'
        )
        console.log('Subscription deletion handled:', result.success)
        break
      }

      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        console.log('Payment succeeded:', paymentIntent.id)
        break
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        console.error('Payment failed:', paymentIntent.id, paymentIntent.last_payment_error?.message)
        break
      }

      default:
        console.log('Unhandled webhook event:', event.type)
    }

    return NextResponse.json({ received: true })

  } catch (error: any) {
    console.error('Webhook error:', {
      message: error.message,
      type: error.type,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    })
    
    return NextResponse.json({ 
      error: 'Webhook processing failed',
      details: error.message 
    }, { status: 400 })
  }
}