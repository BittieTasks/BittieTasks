# STRIPE ISSUE DIAGNOSIS

## Problem: WebSocket Fail + API Key Issues

Based on your error message mentioning WebSocket failures and API key problems, here are the likely causes:

## Most Likely Cause: Wrong Stripe Key Type

**ISSUE**: You might be using a **TEST** key in production instead of a **LIVE** key.

### Check Your Stripe Keys:

1. **Go to**: https://dashboard.stripe.com/apikeys
2. **Make sure you're using LIVE keys** (not test keys):
   - ✅ **Live Secret Key**: `sk_live_xxxxx` 
   - ❌ **Test Secret Key**: `sk_test_xxxxx` (this won't work in production)

### Update Your Environment Variables:

If you're using test keys, you need to:
1. Copy your **LIVE Secret Key** from Stripe dashboard
2. Update your Vercel environment variables:
   - `STRIPE_SECRET_KEY` = `sk_live_xxxxxxxxxxxxx`
   - `VITE_STRIPE_PUBLIC_KEY` = `pk_live_xxxxxxxxxxxxx`

## Secondary Issues:

### 1. Price IDs Don't Match
- Your price IDs must be from the LIVE Stripe account
- Test price IDs won't work with live keys

### 2. Webhook URL Issues  
- If using live mode, webhooks must point to your live domain
- Test webhooks won't work in production

## Quick Fix Commands:

Test your current Stripe key:
```bash
curl -s 'https://www.bittietasks.com/api/test-stripe-key'
```

This will show if your key is valid and whether it's test/live mode.

## Expected Response:
- ✅ **Success**: Shows account info and `"livemode": true`
- ❌ **Error**: "Invalid API key" or shows `"livemode": false`

## Next Steps:
1. Run the test command above
2. If it shows test mode or fails, update to live Stripe keys
3. Redeploy and test subscription buttons again

The WebSocket error is likely Stripe rejecting the connection due to invalid/test keys in production.