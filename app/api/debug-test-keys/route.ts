import { NextResponse } from 'next/server'
import Stripe from 'stripe'

export async function GET() {
  try {
    const publicKey = process.env.VITE_STRIPE_PUBLIC_KEY
    const secretKey = process.env.STRIPE_SECRET_KEY
    const proPriceId = process.env.STRIPE_PRO_PRICE_ID
    const premiumPriceId = process.env.STRIPE_PREMIUM_PRICE_ID

    // Check if we're in test mode
    const isTestMode = secretKey?.startsWith('sk_test_')
    const isPublicKeyTest = publicKey?.startsWith('pk_test_')

    let stripeTestResult = 'unknown'
    let customerTestResult = 'unknown'
    let priceTestResult = 'unknown'

    if (secretKey) {
      try {
        const stripe = new Stripe(secretKey)
        
        // Test basic API access
        await stripe.customers.list({ limit: 1 })
        stripeTestResult = 'API access working'

        // Test customer creation
        try {
          const testCustomer = await stripe.customers.create({
            email: 'test@example.com',
            metadata: { test: 'true' }
          })
          customerTestResult = `success: ${testCustomer.id}`
        } catch (customerError: any) {
          customerTestResult = `failed: ${customerError.message}`
        }

        // Test price retrieval
        if (proPriceId) {
          try {
            await stripe.prices.retrieve(proPriceId)
            priceTestResult = 'Pro price ID valid'
          } catch (priceError: any) {
            priceTestResult = `Pro price invalid: ${priceError.message}`
          }
        }

      } catch (stripeError: any) {
        stripeTestResult = `failed: ${stripeError.message}`
      }
    }

    return NextResponse.json({
      environment_check: {
        secret_key_format: secretKey ? `${secretKey.substring(0, 10)}...` : 'missing',
        public_key_format: publicKey ? `${publicKey.substring(0, 10)}...` : 'missing',
        is_test_mode: isTestMode,
        public_key_test_mode: isPublicKeyTest,
        keys_match_mode: isTestMode === isPublicKeyTest
      },
      price_ids: {
        pro: proPriceId || 'missing',
        premium: premiumPriceId || 'missing'
      },
      stripe_tests: {
        api_access: stripeTestResult,
        customer_creation: customerTestResult,
        price_validation: priceTestResult
      },
      recommendations: !isTestMode ? [
        'Switch to test keys (sk_test_ and pk_test_)',
        'Create test price IDs in test dashboard'
      ] : isTestMode && !isPublicKeyTest ? [
        'Public key should also be test mode (pk_test_)'
      ] : []
    })

  } catch (error: any) {
    return NextResponse.json({
      error: 'Debug check failed',
      message: error.message
    }, { status: 500 })
  }
}