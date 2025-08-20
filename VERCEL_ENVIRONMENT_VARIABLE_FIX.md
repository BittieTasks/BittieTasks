# Vercel Environment Variable Fix

## CONFIRMED ISSUE:
Your server is still receiving a **publishable key (pk_)** in the `STRIPE_SECRET_KEY` environment variable instead of a **secret key (sk_)**.

## IMMEDIATE FIX IN VERCEL:

1. **Go to**: https://vercel.com/dashboard
2. **Find BittieTasks project**
3. **Settings → Environment Variables**

4. **Check STRIPE_SECRET_KEY**:
   - Currently has: `pk_test_xxxxx` (WRONG - this is publishable)
   - Should have: `sk_test_xxxxx` (CORRECT - this is secret)

5. **Update STRIPE_SECRET_KEY**:
   - Delete current value
   - Paste your test SECRET key (starts with `sk_test_`)
   - Save

6. **Verify other variables**:
   ```
   VITE_STRIPE_PUBLIC_KEY = pk_test_xxxxx (publishable key)
   STRIPE_SECRET_KEY = sk_test_xxxxx (secret key)
   STRIPE_PRO_PRICE_ID = price_xxxxx (test price ID)  
   STRIPE_PREMIUM_PRICE_ID = price_xxxxx (test price ID)
   ```

7. **Force redeploy**:
   - Go to Deployments tab
   - Click "Redeploy" on latest deployment

## THE PROBLEM:
You accidentally put the publishable key (pk_test_) in BOTH the public and secret key fields. The server needs the secret key (sk_test_) to create customers.

## EXPECTED RESULT:
After updating STRIPE_SECRET_KEY with the correct secret key and redeploying, subscription buttons will work immediately.

The error will change from "publishable API key" to successful Stripe checkout redirect.