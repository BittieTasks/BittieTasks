# Stripe Integration Debug Commands

## Test Environment Variables
Check if all Stripe variables are loaded correctly:
```bash
curl -s https://www.bittietasks.com/api/env-check | jq '.availableEnvKeys'
```

## Test Subscription Creation (with real authentication)
1. First, get a real JWT token by signing into your app
2. Open browser dev tools → Network tab
3. Look for any API request and copy the Authorization header
4. Use it to test subscription creation:

```bash
curl -s 'https://www.bittietasks.com/api/subscription/create' \
  -X POST \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer [YOUR_REAL_JWT_TOKEN]' \
  -d '{"planType":"pro"}' | jq '.'
```

## Common Stripe Issues & Solutions

### Issue 1: Invalid Price ID
If you see "No such price: price_xxxxx"
- Check that STRIPE_PRO_PRICE_ID and STRIPE_PREMIUM_PRICE_ID are set
- Verify the price IDs in your Stripe dashboard match environment variables

### Issue 2: API Key Issues  
If you see "Invalid API key"
- Ensure STRIPE_SECRET_KEY starts with "sk_live_" for production
- Check that the key has proper permissions in Stripe dashboard

### Issue 3: Customer Creation Fails
If customer creation fails:
- Check that the Supabase users table has stripeCustomerId column
- Verify SUPABASE_SERVICE_ROLE_KEY is set and has proper permissions

### Issue 4: Checkout Session Creation Fails
Common causes:
- Missing required Stripe metadata
- Invalid success/cancel URLs
- Network connectivity issues in production

## Current Status
Based on env-check, these Stripe variables are loaded:
✅ STRIPE_SECRET_KEY: loaded
✅ STRIPE_WEBHOOK_SECRET: loaded  
✅ STRIPE_PRO_PRICE_ID: loaded
✅ STRIPE_PREMIUM_PRICE_ID: loaded
✅ VITE_STRIPE_PUBLIC_KEY: loaded

All required environment variables are present!