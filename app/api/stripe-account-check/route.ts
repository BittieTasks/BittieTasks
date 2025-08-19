import { NextResponse } from 'next/server'
import Stripe from 'stripe'

export async function GET() {
  try {
    const secretKey = process.env.STRIPE_SECRET_KEY
    
    if (!secretKey) {
      return NextResponse.json({ error: 'No Stripe secret key' })
    }

    const stripe = new Stripe(secretKey)
    
    // Check account status
    const account = await stripe.accounts.retrieve()
    
    // Check if account can accept payments
    const canAcceptPayments = account.charges_enabled && account.payouts_enabled
    
    // Try to create a test customer (this will fail if permissions are wrong)
    let customerTestResult = 'unknown'
    try {
      await stripe.customers.create({
        email: 'test@example.com',
        metadata: { test: 'true' }
      })
      customerTestResult = 'success'
    } catch (customerError: any) {
      customerTestResult = `failed: ${customerError.message}`
    }

    return NextResponse.json({
      account_status: {
        id: account.id,
        type: account.type,
        country: account.country,
        charges_enabled: account.charges_enabled,
        payouts_enabled: account.payouts_enabled,
        can_accept_payments: canAcceptPayments,
        details_submitted: account.details_submitted,
        requirements: account.requirements?.currently_due || []
      },
      customer_creation_test: customerTestResult,
      api_key_format: `${secretKey.substring(0, 10)}...${secretKey.substring(secretKey.length - 4)}`,
      environment: secretKey.startsWith('sk_live_') ? 'live' : 'test'
    })
    
  } catch (error: any) {
    return NextResponse.json({
      error: 'Account check failed',
      message: error.message,
      type: error.type,
      code: error.code
    }, { status: 400 })
  }
}