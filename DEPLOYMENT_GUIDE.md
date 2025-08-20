# BittieTasks Production Deployment Guide

## Overview
Complete guide for deploying BittieTasks to production with Stripe payment processing, daily task limits, and cost control systems.

## Required Environment Variables

### Stripe Configuration
You'll need these 5 Stripe environment variables:

1. **STRIPE_SECRET_KEY**: Server-side secret key from Stripe Dashboard
   - Format: Starts with "sk_live_" for production or "sk_test_" for testing
   - Location: https://dashboard.stripe.com/apikeys

2. **VITE_STRIPE_PUBLIC_KEY**: Client-side publishable key
   - Format: Starts with "pk_live_" for production or "pk_test_" for testing  
   - Location: https://dashboard.stripe.com/apikeys

3. **STRIPE_PRO_PRICE_ID**: Price ID for Pro subscription plan
   - Format: Starts with "price_"
   - Location: Create product at https://dashboard.stripe.com/products for $9.99/month

4. **STRIPE_PREMIUM_PRICE_ID**: Price ID for Premium subscription plan
   - Format: Starts with "price_"
   - Location: Create product at https://dashboard.stripe.com/products for $19.99/month

5. **STRIPE_WEBHOOK_SECRET**: Webhook signing secret
   - Format: Starts with "whsec_"
   - Location: Create webhook at https://dashboard.stripe.com/webhooks

### Database Configuration (Supabase)
- **NEXT_PUBLIC_SUPABASE_URL**: Your Supabase project URL
- **NEXT_PUBLIC_SUPABASE_ANON_KEY**: Public anonymous key
- **SUPABASE_SERVICE_ROLE_KEY**: Service role key for server operations
- **DATABASE_URL**: PostgreSQL connection string

## Stripe Setup Steps

### 1. Get API Keys
- Go to Stripe Dashboard → API Keys
- Switch to "Live data" mode for production
- Copy Secret Key and Publishable Key

### 2. Create Subscription Products
- Go to Products section in Stripe Dashboard
- Create Pro Plan: $9.99/month recurring
- Create Premium Plan: $19.99/month recurring
- Copy the Price IDs for each product

### 3. Configure Webhooks
- Go to Webhooks section in Stripe Dashboard
- Add endpoint: `https://your-domain.com/api/webhooks/stripe`
- Select these events:
  - checkout.session.completed
  - customer.subscription.created
  - customer.subscription.updated
  - customer.subscription.deleted
  - payment_intent.succeeded
  - payment_intent.payment_failed
  - invoice.payment_succeeded
  - invoice.payment_failed
- Copy the Signing Secret

## GitHub Deployment

### 1. Repository Secrets
Add environment variables to GitHub repository:
- Go to Settings → Secrets and variables → Actions
- Add all required environment variables listed above

### 2. Automatic Deployment
- GitHub Actions workflow will trigger on push to main branch
- Connect repository to Vercel or Railway for automatic deployment
- Add same environment variables to deployment platform

## Production Checklist

### Before Going Live
- [ ] Stripe account fully verified with bank details
- [ ] Live API keys configured (not test keys)
- [ ] Subscription products created with correct pricing
- [ ] Webhook endpoint configured and verified
- [ ] All environment variables set in deployment platform

### After Deployment
- [ ] Test Pro subscription ($9.99/month) 
- [ ] Test Premium subscription ($19.99/month)
- [ ] Apply to solo task and verify daily limits
- [ ] Complete task verification flow
- [ ] Check Stripe dashboard for successful transactions
- [ ] Monitor webhook deliveries for errors

## Daily Limits System

### Current Configuration
- 5 completions per task type per day
- 25 total task types = maximum 125 daily completions
- Automatic midnight reset
- 24-hour completion deadline after starting task

### Cost Control
- Maximum daily platform cost: ~$1,000 (if all 125 slots used)
- Platform revenue: 3-15% fees on each completion
- Limits will be removed once sustainable revenue achieved

## Monitoring & Maintenance

### Key Metrics to Watch
- Daily task completion rates
- Payment success rates
- User subscription conversions
- Webhook delivery success
- Database performance

### Stripe Dashboard Monitoring
- Check for failed payments
- Monitor subscription renewals
- Review dispute rates
- Track revenue trends

## Troubleshooting

### Common Issues
1. **Webhook failures**: Verify endpoint URL matches deployed domain
2. **Payment failures**: Check Stripe keys are live mode, not test mode
3. **Daily limit errors**: Verify database queries for task counting
4. **Subscription issues**: Confirm Price IDs match created products

### Support Resources
- Stripe documentation: https://stripe.com/docs
- GitHub repository issues for technical problems
- Monitor application logs for runtime errors

## Security Considerations

### Data Protection
- All API keys stored as environment variables only
- Database protected with Row Level Security (RLS)
- Webhook signatures verified for authenticity
- User authentication required for all operations

### Payment Security
- PCI compliance through Stripe integration
- No credit card data stored locally
- Secure token-based authentication
- HTTPS enforced for all communications

---

**Note**: This platform processes real money transactions. Ensure all testing is completed before enabling live Stripe keys.