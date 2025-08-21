# BittieTasks Infrastructure Setup Guide

## Current Status ✅
Your project already has these configured:
- ✅ All API keys are present in Replit Secrets
- ✅ Supabase connection strings configured
- ✅ Vercel deployment configuration ready
- ✅ OpenAI API integration active
- ✅ Stripe payment system operational
- ✅ Real AI verification system implemented

## Required Setup Steps

### 1. Supabase Configuration

#### A. Database Tables (Auto-created by your app)
Your Supabase database should have these tables created by the application:
- `users` - User profiles and authentication data
- `tasks` - Task listings and metadata  
- `task_applications` - User applications to tasks
- `task_submissions` - Photo/verification submissions
- `transactions` - Payment and payout records

#### B. Row Level Security (RLS)
Enable RLS policies in Supabase dashboard:

1. Go to Authentication → Policies
2. Enable RLS for all tables
3. Create policies:

**Users table:**
```sql
-- Users can read their own data
CREATE POLICY "Users can view own profile" ON users
FOR SELECT USING (auth.uid()::text = id);

-- Users can update their own data  
CREATE POLICY "Users can update own profile" ON users
FOR UPDATE USING (auth.uid()::text = id);
```

**Task Applications table:**
```sql
-- Users can view their own applications
CREATE POLICY "Users can view own applications" ON task_applications
FOR SELECT USING (auth.uid()::text = user_id);

-- Users can create applications
CREATE POLICY "Users can create applications" ON task_applications
FOR INSERT WITH CHECK (auth.uid()::text = user_id);
```

#### C. Storage Bucket (For Photo Uploads)
1. Go to Storage in Supabase dashboard
2. Create bucket: `task-photos`
3. Set bucket to Public
4. Create policy for authenticated uploads

### 2. Vercel Environment Variables

Add these to your Vercel project dashboard (Settings → Environment Variables):

**Production Environment Variables:**
```
NEXT_PUBLIC_SUPABASE_URL=https://ttgbotlcbzmmyqawnjpj.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=[Your service role key from Supabase]
STRIPE_SECRET_KEY=[Your Stripe secret key]
STRIPE_WEBHOOK_SECRET=[Your Stripe webhook secret]
OPENAI_API_KEY=[Your OpenAI API key]
SENDGRID_API_KEY=[Your SendGrid API key]
DATABASE_URL=[Your Supabase database URL]
```

**Important:** Copy these exact values from your Replit Secrets to Vercel.

### 3. Stripe Webhook Configuration

#### A. Create Webhook Endpoint
1. Go to Stripe Dashboard → Webhooks
2. Add endpoint: `https://your-domain.vercel.app/api/webhooks/stripe`
3. Select events:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `invoice.payment_succeeded`
   - `customer.subscription.updated`

#### B. Copy Webhook Secret
1. Copy the webhook signing secret
2. Add to Vercel as `STRIPE_WEBHOOK_SECRET`

### 4. GitHub Repository Setup

#### A. Repository Secrets (For GitHub Actions)
If using GitHub Actions, add these secrets:

1. Go to Repository → Settings → Secrets and Variables → Actions
2. Add repository secrets:
   - `VERCEL_TOKEN` (from Vercel account settings)
   - `VERCEL_ORG_ID` (from Vercel project settings)
   - `VERCEL_PROJECT_ID` (from Vercel project settings)

#### B. Environment Files
Make sure `.env.local` is in `.gitignore` (it already is)

### 5. Domain Configuration

#### A. Custom Domain (Optional)
1. In Vercel project settings → Domains
2. Add your custom domain: `www.bittietasks.com`
3. Configure DNS records as instructed by Vercel

#### B. Update Stripe Webhook URL
Update webhook URL to your production domain when ready.

### 6. Production Verification Checklist

Before going live, verify:

- [ ] All environment variables copied to Vercel
- [ ] Supabase RLS policies enabled and tested
- [ ] Stripe webhook receiving events successfully  
- [ ] OpenAI API calls working (not hitting rate limits)
- [ ] SendGrid email delivery working
- [ ] Photo upload to Supabase Storage working
- [ ] AI verification system rejecting invalid photos
- [ ] Payment flow: application → verification → payout

### 7. Monitoring Setup (Recommended)

#### A. Error Tracking
- Add Sentry or similar error tracking
- Monitor API endpoint failures
- Track payment processing errors

#### B. Analytics
- Google Analytics for user behavior
- Stripe Dashboard for payment analytics
- Supabase Dashboard for database performance

## Quick Deployment Commands

```bash
# Deploy to Vercel (from GitHub)
git push origin main  # Auto-deploys if connected

# Manual Vercel deployment
npx vercel --prod

# Database migration (if needed)
npm run db:push
```

## Testing Production Setup

1. **Authentication Flow:**
   - Sign up with real email
   - Verify email delivery via SendGrid
   - Complete profile setup

2. **Task Application:**
   - Apply to solo task
   - Upload photo for verification
   - Verify AI correctly analyzes photo

3. **Payment Processing:**
   - Submit valid task completion
   - Verify Stripe payment processing
   - Check payout arrives in 1-2 business days

## Support Contact

If any issues arise during setup:
- Supabase: Check project logs and status page
- Vercel: Check deployment logs and function logs  
- Stripe: Check webhook delivery and event logs
- OpenAI: Check API usage and rate limits

## Security Notes

- Never commit API keys to Git repository
- Use environment variables for all secrets
- Enable HTTPS only in production
- Monitor API usage for unusual patterns
- Set up rate limiting for API endpoints

---

**Status:** Infrastructure ready for production deployment
**Last Updated:** August 21, 2025