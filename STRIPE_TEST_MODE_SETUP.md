# Test Stripe Subscriptions Before Full Setup

## SOLUTION: Use Stripe Test Mode

You can test the entire subscription flow using Stripe's test environment while you complete tax configuration.

## STEPS TO ENABLE TEST MODE:

### 1. Get Test API Keys
Go to: https://dashboard.stripe.com/test/apikeys
- Copy **Publishable key** (starts with `pk_test_`)
- Copy **Secret key** (starts with `sk_test_`)

### 2. Create Test Prices
Go to: https://dashboard.stripe.com/test/products
- Create "Pro Plan" → $9.99/month → Copy price ID
- Create "Premium Plan" → $19.99/month → Copy price ID

### 3. Update Environment Variables (Temporarily)
Replace your live keys with test keys:
- `VITE_STRIPE_PUBLIC_KEY=pk_test_xxxxx`
- `STRIPE_SECRET_KEY=sk_test_xxxxx`
- `STRIPE_PRO_PRICE_ID=price_test_xxxxx`
- `STRIPE_PREMIUM_PRICE_ID=price_test_xxxxx`

### 4. Test Subscription Flow
- Go to: https://www.bittietasks.com/subscribe
- Click subscription button
- Use test card: `4242 4242 4242 4242`
- Any future date and CVC
- Complete fake checkout

### 5. Verify Success
- Should redirect to Stripe checkout
- Complete with test card
- Check Stripe test dashboard for subscription

## TEST CARD NUMBERS:
- **Success**: 4242 4242 4242 4242
- **Declined**: 4000 0000 0000 0002
- **Requires Auth**: 4000 0025 0000 3155

## AFTER TESTING:
Once you verify test mode works perfectly, switch back to live keys after completing tax setup.

This proves your integration is working while you finish Stripe account setup!