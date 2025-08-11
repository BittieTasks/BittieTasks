# GitHub Setup & Deployment Guide

## Step 1: Export Your Code from Replit

1. **Download the project**:
   - Click the three dots menu (⋯) in the top-right of Replit
   - Select "Download as zip"
   - Extract the zip file to your local machine

## Step 2: Create GitHub Repository

1. Go to [GitHub.com](https://github.com) and sign in
2. Click the "+" icon → "New repository"
3. Name it: `bittietasks`
4. Make it **Public** 
5. Do NOT initialize with README, .gitignore, or license (we have these files)
6. Click "Create repository"

## Step 3: Push Code to GitHub

Open terminal/command prompt in your extracted project folder and run:

```bash
# Initialize git repository
git init

# Add all files
git add .

# Set your identity (replace with your info)
git config user.email "your-email@example.com"
git config user.name "Your Name"

# Create initial commit
git commit -m "Initial commit - BittieTasks platform"

# Add GitHub remote (replace YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/bittietasks.git

# Push to GitHub
git branch -M main
git push -u origin main
```

## Step 4: Deploy to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Sign in with GitHub
3. Click "New Project"
4. Import your `bittietasks` repository
5. Configure these environment variables in Vercel:

### Required Environment Variables:

```
NEXT_PUBLIC_SUPABASE_URL=https://ttgbotlcbzmmyqawnjpj.supabase.co

NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR0Z2JvdGxjYnptbXlxYXduanBqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ2MDA4NzksImV4cCI6MjA3MDE3Njg3OX0.jc_PZay5gUyleINrGC5d5Sd2mCkHjonP56KCLJJNM1k

STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here

NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here

DATABASE_URL=your_production_database_url
```

6. Click "Deploy"

## Step 5: Get Stripe Keys

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/apikeys)
2. Copy your "Publishable key" (starts with `pk_`)
3. Copy your "Secret key" (starts with `sk_`)
4. Add these to Vercel environment variables

## Step 6: Production Database (Optional)

For production, you may want a separate database:
1. Create a new Supabase project for production
2. Copy the new DATABASE_URL to Vercel
3. Run migrations on the new database

## Automatic Deployments

Once connected to GitHub:
- Every push to `main` branch automatically deploys
- Preview deployments for pull requests
- Environment variables are inherited

## Troubleshooting

If deployment fails:
1. Check Vercel build logs
2. Ensure all environment variables are set
3. Verify package.json dependencies
4. Check for TypeScript errors

Your platform will be live at: `https://bittietasks.vercel.app`