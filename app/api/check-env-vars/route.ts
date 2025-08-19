import { NextResponse } from 'next/server'

export async function GET() {
  const secretKey = process.env.STRIPE_SECRET_KEY
  const publicKey = process.env.VITE_STRIPE_PUBLIC_KEY
  const proPriceId = process.env.STRIPE_PRO_PRICE_ID
  const premiumPriceId = process.env.STRIPE_PREMIUM_PRICE_ID

  return NextResponse.json({
    secret_key: {
      exists: !!secretKey,
      format: secretKey ? `${secretKey.substring(0, 15)}...` : 'missing',
      is_secret: secretKey?.startsWith('sk_'),
      is_test: secretKey?.startsWith('sk_test_'),
      is_live: secretKey?.startsWith('sk_live_')
    },
    public_key: {
      exists: !!publicKey,
      format: publicKey ? `${publicKey.substring(0, 15)}...` : 'missing',
      is_public: publicKey?.startsWith('pk_'),
      is_test: publicKey?.startsWith('pk_test_'),
      is_live: publicKey?.startsWith('pk_live_')
    },
    price_ids: {
      pro: proPriceId || 'missing',
      premium: premiumPriceId || 'missing'
    },
    diagnosis: {
      keys_match_environment: (
        (secretKey?.startsWith('sk_test_') && publicKey?.startsWith('pk_test_')) ||
        (secretKey?.startsWith('sk_live_') && publicKey?.startsWith('pk_live_'))
      ),
      secret_key_valid: secretKey?.startsWith('sk_'),
      public_key_valid: publicKey?.startsWith('pk_')
    }
  })
}