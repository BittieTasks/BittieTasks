import { NextResponse } from 'next/server'

export async function GET() {
  const isTestMode = process.env.STRIPE_SECRET_KEY?.startsWith('sk_test_')
  const isLiveMode = process.env.STRIPE_SECRET_KEY?.startsWith('sk_live_')
  
  return NextResponse.json({
    current_mode: isTestMode ? 'test' : isLiveMode ? 'live' : 'unknown',
    public_key_format: process.env.VITE_STRIPE_PUBLIC_KEY?.substring(0, 10) + '...',
    secret_key_format: process.env.STRIPE_SECRET_KEY?.substring(0, 10) + '...',
    pro_price_id: process.env.STRIPE_PRO_PRICE_ID,
    premium_price_id: process.env.STRIPE_PREMIUM_PRICE_ID,
    instructions: isTestMode 
      ? "Test mode active - use test cards to verify subscription flow"
      : "Live mode active - complete Stripe account setup for real payments"
  })
}