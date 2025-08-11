# 🔧 Vercel Environment Variables Setup

## In Your Vercel BittieTasks Project:

### 1. Go to Settings:
- In your Vercel BittieTasks project dashboard
- Click **"Settings"** tab
- Click **"Environment Variables"** on the left

### 2. Add These Variables:

**Copy and paste each line exactly:**

```
NEXT_PUBLIC_SUPABASE_URL
https://ttgbotlcbzmmyqawnjpj.supabase.co

NEXT_PUBLIC_SUPABASE_ANON_KEY
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR0Z2JvdGxjYnptbXlxYXduanBqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ2MDA4NzksImV4cCI6MjA3MDE3Njg3OX0.jc_PZay5gUyleINrGC5d5Sd2mCkHjonP56KCLJJNM1k
```

### 3. For Each Variable:
- Name: (copy the variable name exactly)
- Value: (copy the value exactly)  
- Environment: **All** (Production, Preview, Development)
- Click **"Save"**

### 4. Trigger Deployment:
After adding variables:
- Go to **"Deployments"** tab
- Click **"Redeploy"** on the latest deployment
- Or push a small change to GitHub to trigger auto-deploy

## Result:
Your revenue platform will be live at your Vercel URL with:
- Task marketplace
- Subscription tiers (10%/7%/5% platform fees)
- Corporate sponsorship portal
- Real-time earnings dashboard