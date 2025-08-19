import { NextResponse } from 'next/server'
import Stripe from 'stripe'

export async function GET() {
  try {
    const apiKey = process.env.STRIPE_SECRET_KEY
    
    if (!apiKey) {
      return NextResponse.json({ error: 'No Stripe secret key found' })
    }

    const stripe = new Stripe(apiKey)
    
    // Test 1: Account info
    const account = await stripe.accounts.retrieve()
    
    // Test 2: List products/prices
    const prices = await stripe.prices.list({ limit: 5 })
    
    // Test 3: Check specific price IDs
    const proPriceId = process.env.STRIPE_PRO_PRICE_ID
    const premiumPriceId = process.env.STRIPE_PREMIUM_PRICE_ID
    
    let proPriceValid = false
    let premiumPriceValid = false
    
    if (proPriceId) {
      try {
        await stripe.prices.retrieve(proPriceId)
        proPriceValid = true
      } catch {
        proPriceValid = false
      }
    }
    
    if (premiumPriceId) {
      try {
        await stripe.prices.retrieve(premiumPriceId)
        premiumPriceValid = true
      } catch {
        premiumPriceValid = false
      }
    }
    
    return NextResponse.json({
      status: 'Stripe Validation Complete',
      account: {
        id: account.id,
        country: account.country,
        livemode: !account.id.startsWith('acct_test'),
        charges_enabled: account.charges_enabled,
        payouts_enabled: account.payouts_enabled
      },
      prices: {
        total_available: prices.data.length,
        pro_price_id: proPriceId,
        pro_price_valid: proPriceValid,
        premium_price_id: premiumPriceId,
        premium_price_valid: premiumPriceValid
      },
      test_results: {
        api_key_works: true,
        account_accessible: true,
        prices_listable: true
      }
    })
    
  } catch (error: any) {
    return NextResponse.json({
      error: 'Stripe validation failed',
      details: {
        message: error.message,
        type: error.type,
        code: error.code,
        statusCode: error.statusCode
      }
    }, { status: 400 })
  }
}