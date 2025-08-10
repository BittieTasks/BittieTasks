# 🔧 Manual Shell Commands for Vercel Deployment

Since the Vercel CLI authentication is having issues, here are the exact commands to run manually in the shell:

## Method 1: Complete Vercel Authentication

### Step 1: Access Shell Tab
Click on the "Shell" tab in your Replit interface.

### Step 2: Run These Commands One by One
```bash
# Kill any existing vercel processes
pkill -f vercel

# Start fresh login
npx vercel login --github
```

### Step 3: When Prompted for Verification Code
Type: `XQorlFgd83wuWFd6YaaPgtny`
Press Enter

### Step 4: Deploy Your Revenue Platform
```bash
npx vercel --prod
```

### Step 5: Add Environment Variables
```bash
npx vercel env add NEXT_PUBLIC_SUPABASE_URL production
# Enter: https://ttgbotlcbzmmyqawnjpj.supabase.co

npx vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
# Enter: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR0Z2JvdGxjYnptbXlxYXduanBqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ2MDA4NzksImV4cCI6MjA3MDE3Njg3OX0.jc_PZay5gUyleINrGC5d5Sd2mCkHjonP56KCLJJNM1k
```

### Step 6: Final Deploy
```bash
npx vercel --prod
```

## Result:
Your complete revenue platform will be live with task marketplace, subscription tiers, corporate sponsorship portal, and earnings dashboard.

Try running these commands manually in the shell tab.