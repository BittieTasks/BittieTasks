# 🚀 BittieTasks Vercel Deployment Commands

## Step 1: Install Vercel CLI
```bash
npm install -g vercel
```

## Step 2: Login to Vercel
```bash
vercel login
```
(Check your email for verification)

## Step 3: Deploy Your Revenue Platform
```bash
vercel --prod
```

## Step 4: Add Environment Variables
```bash
vercel env add NEXT_PUBLIC_SUPABASE_URL production
```
Enter: `https://ttgbotlcbzmmyqawnjpj.supabase.co`

```bash
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
```
Enter: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR0Z2JvdGxjYnptbXlxYXduanBqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ2MDA4NzksImV4cCI6MjA3MDE3Njg3OX0.jc_PZay5gUyleINrGC5d5Sd2mCkHjonP56KCLJJNM1k`

## Step 5: Redeploy with Environment Variables
```bash
vercel --prod
```

## Result:
Your complete revenue platform will be live with:
- Task marketplace with real earning opportunities
- Subscription tiers (10%/7%/5% platform fees)
- Corporate sponsorship portal
- Real-time earnings dashboard

The CLI deployment bypasses the confusing web interface completely!