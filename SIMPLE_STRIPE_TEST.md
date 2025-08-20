# Simple Stripe Test

## Ignore Websocket Errors
The "websocket connection failed" is just hot reload in development - completely normal and unrelated to Stripe.

## Test Subscription Button

1. **Go to**: https://www.bittietasks.com/subscribe

2. **Sign in** (make sure you're authenticated)

3. **Open browser console** (F12) → Console tab

4. **Click "Pro Plan" button**

5. **Look for these specific messages**:
   ```
   === STRIPE KEY DEBUG ===
   Key format: sk_test_xxxxx...
   Starts with sk_: true/false
   Is test key: true/false
   ```

## What We Need to See:

**If working correctly:**
- `Starts with sk_: true`
- `Is test key: true`
- Should redirect to Stripe checkout

**If still broken:**
- `Starts with sk_: false` (means wrong key type)
- Error about "publishable API key"

## The Problem:
Your server is somehow getting a publishable key (pk_) instead of secret key (sk_) when creating customers.

## Share:
Copy the exact console output when you click the subscription button - the debug messages will show exactly what's wrong.