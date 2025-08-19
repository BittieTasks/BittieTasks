import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const secretKey = process.env.STRIPE_SECRET_KEY
    const publicKey = process.env.VITE_STRIPE_PUBLIC_KEY
    const proPriceId = process.env.STRIPE_PRO_PRICE_ID
    const premiumPriceId = process.env.STRIPE_PREMIUM_PRICE_ID

    return NextResponse.json({
      environment_variables: {
        STRIPE_SECRET_KEY: {
          present: !!secretKey,
          starts_with: secretKey?.substring(0, 10) || 'missing',
          is_secret_key: secretKey?.startsWith('sk_') || false,
          is_test_key: secretKey?.startsWith('sk_test_') || false,
          is_live_key: secretKey?.startsWith('sk_live_') || false,
          length: secretKey?.length || 0
        },
        VITE_STRIPE_PUBLIC_KEY: {
          present: !!publicKey,
          starts_with: publicKey?.substring(0, 10) || 'missing',
          is_public_key: publicKey?.startsWith('pk_') || false,
          is_test_key: publicKey?.startsWith('pk_test_') || false,
          is_live_key: publicKey?.startsWith('pk_live_') || false
        },
        STRIPE_PRO_PRICE_ID: {
          present: !!proPriceId,
          value: proPriceId || 'missing'
        },
        STRIPE_PREMIUM_PRICE_ID: {
          present: !!premiumPriceId,
          value: premiumPriceId || 'missing'
        }
      },
      diagnosis: {
        keys_are_valid: secretKey?.startsWith('sk_') && publicKey?.startsWith('pk_'),
        keys_match_environment: (
          (secretKey?.startsWith('sk_test_') && publicKey?.startsWith('pk_test_')) ||
          (secretKey?.startsWith('sk_live_') && publicKey?.startsWith('pk_live_'))
        ),
        problem_detected: !secretKey?.startsWith('sk_') ? 'Secret key invalid or missing' : null
      }
    })
  } catch (error: any) {
    return NextResponse.json({
      error: 'Environment check failed',
      message: error.message
    }, { status: 500 })
  }
}