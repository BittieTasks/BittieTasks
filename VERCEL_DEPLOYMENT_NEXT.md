# 🚀 Vercel Deployment Setup - Get Your Revenue Platform Live

## Step 1: Connect GitHub to Vercel

### Go to Vercel Dashboard:
1. Visit: https://vercel.com/dashboard
2. Click **"Add New..." → "Project"**
3. Under **"Import Git Repository"**, find **"BittieTasks"**
4. Click **"Import"**

### Configure Deployment:
- **Framework Preset**: Next.js (should auto-detect)
- **Root Directory**: `.` (leave as default)
- **Build Command**: `npm run build` (should auto-fill)
- **Output Directory**: `.next` (should auto-fill)

## Step 2: Add Environment Variables

Click **"Environment Variables"** and add these:

### Required for Authentication:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### Required for Payments:
```
STRIPE_SECRET_KEY=your_stripe_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_public_key
```

### Required for Email:
```
SENDGRID_API_KEY=your_sendgrid_api_key
```

## Step 3: Deploy
Click **"Deploy"** - Your revenue platform will be live in 2-3 minutes!

## Your Live URL:
Will be something like: `https://bittie-tasks.vercel.app`

## Revenue Features Going Live:
- Task marketplace with real earning opportunities
- Subscription tiers (10%/7%/5% platform fees)
- Corporate sponsorship portal  
- Real-time earnings dashboard
- Email verification system