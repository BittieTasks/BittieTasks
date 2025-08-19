# STRIPE API KEY PERMISSION FIX

## EXACT ISSUE IDENTIFIED:
Your Stripe API key has **RESTRICTED PERMISSIONS** and cannot create customers.

## IMMEDIATE FIX:

1. **Go to**: https://dashboard.stripe.com/apikeys

2. **Check your Secret Key permissions**:
   - Click on your secret key (sk_live_xxxxx)
   - Look for "Restricted key" vs "Standard key"

3. **If it says "Restricted key"**:
   - Click "Create restricted key" → "Create standard key" instead
   - OR expand permissions to include:
     - ✅ **Customers** → Read + Write
     - ✅ **Checkout Sessions** → Read + Write  
     - ✅ **Subscriptions** → Read + Write
     - ✅ **Invoices** → Read + Write

4. **Update your environment variable**:
   - Copy the new unrestricted secret key
   - Update `STRIPE_SECRET_KEY` in Vercel
   - Redeploy your app

## WHY THIS HAPPENS:
- Restricted API keys can't create customers
- Customer creation is required for subscriptions
- Your key needs full permissions for payment processing

## EXPECTED RESULT:
After updating to an unrestricted key, subscription buttons should work immediately.

The error will change from "Customer creation failed" to successful Stripe checkout redirect.