# Stripe Deployment Setup for GitHub → Production

## Required Stripe Environment Variables

### 1. STRIPE API KEYS (Most Critical)
```bash
# Get these from https://dashboard.stripe.com/apikeys
STRIPE_SECRET_KEY=sk_live_xxxxxxxxxxxxxxxxxxxxxxxxx  # Secret key for server-side
VITE_STRIPE_PUBLIC_KEY=pk_live_xxxxxxxxxxxxxxxxxxxxxxxxx  # Publishable key for frontend

# For testing before going live:
# STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxxxxxxxxxx
# VITE_STRIPE_PUBLIC_KEY=pk_test_xxxxxxxxxxxxxxxxxxxxxxxxx
```

### 2. STRIPE PRODUCT PRICE IDs
```bash
# Get these from https://dashboard.stripe.com/products
STRIPE_PRO_PRICE_ID=price_xxxxxxxxxxxxxxxxx     # Pro plan ($9.99/month) 
STRIPE_PREMIUM_PRICE_ID=price_xxxxxxxxxxxxxxxxx # Premium plan ($19.99/month)
```

### 3. STRIPE WEBHOOK SECRET
```bash
# Get this from https://dashboard.stripe.com/webhooks after creating webhook endpoint
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxxxxxx
```

## Step-by-Step Stripe Setup

### Step 1: Create Stripe Account & Get Keys
1. Go to [Stripe Dashboard](https://dashboard.stripe.com/apikeys)
2. **For LIVE deployment**: Switch to "Live data" mode (top right)
3. Copy your **Secret key** (starts with `sk_live_`) → This is your `STRIPE_SECRET_KEY`
4. Copy your **Publishable key** (starts with `pk_live_`) → This is your `VITE_STRIPE_PUBLIC_KEY`

### Step 2: Create Subscription Products
1. Go to [Products](https://dashboard.stripe.com/products)
2. Create **Pro Plan**:
   - Name: "Pro Plan"
   - Pricing: $9.99/month recurring
   - Copy the **Price ID** → This is your `STRIPE_PRO_PRICE_ID`
3. Create **Premium Plan**:
   - Name: "Premium Plan" 
   - Pricing: $19.99/month recurring
   - Copy the **Price ID** → This is your `STRIPE_PREMIUM_PRICE_ID`

### Step 3: Setup Webhook Endpoint
1. Go to [Webhooks](https://dashboard.stripe.com/webhooks)
2. Click "Add endpoint"
3. **Endpoint URL**: `https://your-domain.com/api/webhooks/stripe`
4. **Events to send**:
   ```
   ✅ checkout.session.completed
   ✅ customer.subscription.created
   ✅ customer.subscription.updated
   ✅ customer.subscription.deleted
   ✅ payment_intent.succeeded
   ✅ payment_intent.payment_failed
   ✅ invoice.payment_succeeded
   ✅ invoice.payment_failed
   ```
5. Copy **Signing Secret** → This is your `STRIPE_WEBHOOK_SECRET`

## GitHub Repository Environment Variables

Add these to your **GitHub repository settings** → **Secrets and variables** → **Actions**:

```bash
# Stripe Configuration
STRIPE_SECRET_KEY=sk_live_xxxxxxxxxxxxxxxxxxxxxxxxx
VITE_STRIPE_PUBLIC_KEY=pk_live_xxxxxxxxxxxxxxxxxxxxxxxxx
STRIPE_PRO_PRICE_ID=price_xxxxxxxxxxxxxxxxx
STRIPE_PREMIUM_PRICE_ID=price_xxxxxxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxxxxxx

# Database (Supabase)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
DATABASE_URL=postgresql://postgres:[password]@db.xxxxxxxxxxxxxxxxx.supabase.co:5432/postgres

# Optional: Email & SMS (if using)
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_PHONE_NUMBER=+1xxxxxxxxxx
```

## Deployment Platform Setup (Vercel/Railway/etc.)

### For Vercel Deployment:
1. Connect GitHub repo to Vercel
2. Add ALL environment variables above in Vercel dashboard
3. Deploy - webhook URL will be: `https://your-app.vercel.app/api/webhooks/stripe`

### For Railway Deployment:
1. Connect GitHub repo to Railway  
2. Add ALL environment variables in Railway dashboard
3. Deploy - webhook URL will be: `https://your-app.railway.app/api/webhooks/stripe`

## Critical Pre-Launch Checklist

### ✅ Stripe Account Setup
- [ ] Business details completed
- [ ] Bank account connected for payouts
- [ ] Identity verification completed
- [ ] Live mode activated (not test mode)

### ✅ Environment Variables Verified
- [ ] All 5 Stripe environment variables set correctly
- [ ] Database connection working
- [ ] Webhook endpoint responding to test events

### ✅ Payment Flow Testing
- [ ] User can subscribe to Pro plan successfully
- [ ] User can subscribe to Premium plan successfully
- [ ] Webhooks firing and updating database correctly
- [ ] Task completion payments processing
- [ ] Fee calculations working (3%, 7%, 15%)

### ✅ Security Checklist
- [ ] All secret keys stored in environment variables (not in code)
- [ ] Webhook signature verification working
- [ ] Database Row Level Security (RLS) enabled
- [ ] API routes protected with authentication

## Common Deployment Issues & Fixes

### Issue 1: "Stripe key not found"
**Fix**: Ensure `STRIPE_SECRET_KEY` is set in your deployment platform, not just GitHub secrets

### Issue 2: "Webhook signature verification failed" 
**Fix**: Update webhook URL in Stripe dashboard to match your deployed domain

### Issue 3: "Price ID not found"
**Fix**: Verify `STRIPE_PRO_PRICE_ID` and `STRIPE_PREMIUM_PRICE_ID` are correct price IDs from your Stripe products

### Issue 4: "Database connection failed"
**Fix**: Verify all Supabase environment variables are correctly set in deployment platform

## Test Payment Flow Before Launch

1. **Subscribe to Pro Plan**: Verify $9.99 charge processes
2. **Subscribe to Premium Plan**: Verify $19.99 charge processes  
3. **Complete a Solo Task**: Verify 3% fee calculation and user payout
4. **Check Database**: Verify transactions table records are created
5. **Check Webhooks**: Verify webhook events are processed without errors

## Production Monitoring

After deployment, monitor these Stripe dashboard sections:
- **Payments**: Verify transactions coming through
- **Customers**: Verify user accounts being created
- **Subscriptions**: Verify plan activations
- **Webhooks**: Verify 0 failed webhook deliveries
- **Events**: Monitor for any errors or failures

## Support Contact

If any Stripe-related deployment issues occur:
- Check Stripe Dashboard → Logs for detailed error messages
- Verify all environment variables match exactly
- Test webhook endpoint manually using Stripe CLI or dashboard