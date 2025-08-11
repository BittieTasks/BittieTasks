import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
})

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const { priceId, customerId, userId } = await request.json()

    let customer = null
    
    if (customerId) {
      customer = await stripe.customers.retrieve(customerId)
    } else {
      // Create new customer
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) {
        return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
      }

      customer = await stripe.customers.create({
        email: userData.user.email,
        metadata: { userId: userData.user.id },
      })
    }

    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{ price: priceId }],
      payment_behavior: 'default_incomplete',
      payment_settings: { save_default_payment_method: 'on_subscription' },
      expand: ['latest_invoice.payment_intent'],
    })

    const latestInvoice = subscription.latest_invoice as Stripe.Invoice
    const paymentIntent = latestInvoice.payment_intent as Stripe.PaymentIntent

    return NextResponse.json({
      subscriptionId: subscription.id,
      clientSecret: paymentIntent.client_secret,
    })
  } catch (error: any) {
    console.error('Error creating subscription:', error)
    return NextResponse.json(
      { error: 'Failed to create subscription' },
      { status: 500 }
    )
  }
}