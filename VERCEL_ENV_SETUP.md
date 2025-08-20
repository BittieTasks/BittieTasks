# CRITICAL: Missing Vercel Environment Variables

## Issue Identified
Production deployment missing these server-side environment variables:
- `SUPABASE_URL` (server-side version of NEXT_PUBLIC_SUPABASE_URL)
- `SUPABASE_SERVICE_ROLE_KEY` (required for admin operations)
- `STRIPE_WEBHOOK_SECRET` (required for Stripe webhooks)

## Required Action in Vercel Dashboard
Go to your Vercel project → Settings → Environment Variables and add:

1. **SUPABASE_URL**
   - Value: Same as your NEXT_PUBLIC_SUPABASE_URL
   - Environment: Production, Preview, Development

2. **SUPABASE_SERVICE_ROLE_KEY** 
   - Value: Your Supabase service role key (starts with `eyJ`)
   - Environment: Production, Preview, Development
   - ⚠️ Keep this secret - never expose client-side

3. **STRIPE_WEBHOOK_SECRET**
   - Value: Your Stripe webhook secret (starts with `whsec_`)
   - Environment: Production, Preview, Development

## After Adding Variables
1. Click "Redeploy" on your latest deployment
2. Test /api/env-check to confirm all variables show as "loaded"
3. Dashboard and subscription buttons should work properly

## Current Status
✅ NEXT_PUBLIC_SUPABASE_URL: loaded
✅ NEXT_PUBLIC_SUPABASE_ANON_KEY: loaded  
✅ STRIPE_SECRET_KEY: loaded
✅ SENDGRID_API_KEY: loaded
❌ SUPABASE_URL: missing (causes auth issues)
❌ SUPABASE_SERVICE_ROLE_KEY: missing (causes admin operation failures)
❌ STRIPE_WEBHOOK_SECRET: missing (causes webhook failures)