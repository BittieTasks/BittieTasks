# Production Deployment Configuration

## Current Status ✅
All environment variables are configured in your Replit workspace. You need to copy them to your production platform.

## Required Actions by Platform

### 1. VERCEL DEPLOYMENT (Recommended)

**Step 1: Import from GitHub**
1. Go to https://vercel.com/new
2. Import your GitHub repository: `BittieTasks/BittieTasks`
3. Vercel will detect it's a Next.js app automatically

**Step 2: Add Environment Variables**
In Vercel project settings → Environment Variables, add these 9 variables:

```
DATABASE_URL=postgresql://postgres:[password]@db.[project].supabase.co:5432/postgres
NEXT_PUBLIC_SUPABASE_URL=https://[project].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
STRIPE_SECRET_KEY=sk_live_... (or sk_test_ for testing)
VITE_STRIPE_PUBLIC_KEY=pk_live_... (or pk_test_ for testing)
STRIPE_PRO_PRICE_ID=price_...
STRIPE_PREMIUM_PRICE_ID=price_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

**Step 3: Deploy**
- Click "Deploy" in Vercel
- Your app will be live at `https://your-project.vercel.app`

### 2. SUPABASE CONFIGURATION

**Current Setup: Already Configured ✅**
Your Supabase database and authentication are already working. No additional setup needed.

**After Deployment:**
1. Update CORS settings if needed:
   - Go to Supabase Dashboard → Authentication → URL Configuration  
   - Add your production domain to Redirect URLs

### 3. STRIPE CONFIGURATION

**Current Setup: Test Mode Active**
Your Stripe integration is configured in test mode. For production:

**Step 1: Switch to Live Mode**
1. Go to https://dashboard.stripe.com/
2. Toggle from "Test data" to "Live data" (top right)
3. Get your Live API keys (replace test keys)

**Step 2: Update Webhook URL**
1. Go to https://dashboard.stripe.com/webhooks
2. Update webhook endpoint URL to: `https://your-domain.com/api/webhooks/stripe`
3. Keep the same events selected

**Step 3: Verify Products**
Ensure your Pro ($9.99) and Premium ($19.99) subscription products exist in Live mode.

### 4. REQUIRED STRIPE SETUP (If Not Done)

**Create Subscription Products:**
1. Go to https://dashboard.stripe.com/products
2. Create "Pro Plan": $9.99/month recurring
3. Create "Premium Plan": $19.99/month recurring  
4. Copy the Price IDs and update your environment variables

## Post-Deployment Checklist

### Test Critical Flows:
- [ ] User can sign up and verify phone
- [ ] User can browse available solo tasks  
- [ ] Daily limits display correctly (5 per task type)
- [ ] User can start a task and see 24-hour deadline
- [ ] Task completion and verification works
- [ ] Stripe subscription flow works (test with test card)
- [ ] Dashboard shows active tasks and earnings

### Monitor After Launch:
- [ ] Check Vercel deployment logs for errors
- [ ] Monitor Stripe dashboard for successful payments
- [ ] Watch Supabase logs for database issues
- [ ] Verify webhook deliveries are successful

## Daily Limits System Status

**Cost Control Measures Active:**
- Maximum 5 completions per task type per day
- 25 task types = maximum 125 daily completions  
- 24-hour completion deadlines
- Automatic midnight reset (UTC)
- Real-time availability tracking

**Expected Daily Costs (Max Scenario):**
- 125 tasks × ~$10 average = ~$1,250 gross payments
- Platform revenue: 3% = ~$37.50/day
- Net cost to platform: ~$1,212.50/day (during growth phase)

## Security Notes

- All API keys stored as environment variables only
- Database protected with Row Level Security (RLS)  
- Webhook signatures verified for authenticity
- HTTPS enforced for all communications
- Phone verification required for user accounts

Your platform is production-ready with comprehensive cost controls!