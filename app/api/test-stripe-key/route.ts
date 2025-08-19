import { NextResponse } from 'next/server'
import Stripe from 'stripe'

export async function GET() {
  try {
    const apiKey = process.env.STRIPE_SECRET_KEY
    
    if (!apiKey) {
      return NextResponse.json({
        error: 'STRIPE_SECRET_KEY not found',
        hasKey: false
      })
    }

    // Test the API key by making a simple Stripe API call
    const stripe = new Stripe(apiKey)
    
    // Try to retrieve account info - this will fail if API key is invalid
    const account = await stripe.accounts.retrieve()
    
    return NextResponse.json({
      success: true,
      keyFormat: `${apiKey.substring(0, 7)}...${apiKey.substring(apiKey.length - 4)}`,
      accountId: account.id,
      accountCountry: account.country,
      accountType: account.type,
      livemode: account.charges_enabled
    })
    
  } catch (error: any) {
    return NextResponse.json({
      error: 'Stripe API key test failed',
      message: error.message,
      type: error.type,
      code: error.code,
      hasKey: !!process.env.STRIPE_SECRET_KEY,
      keyPreview: process.env.STRIPE_SECRET_KEY?.substring(0, 7) + '...'
    }, { status: 400 })
  }
}