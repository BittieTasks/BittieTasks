# Quick Deploy Commands

Since you have GitHub and Vercel accounts, here are the exact commands:

## Push to Your GitHub Repository

```bash
# After downloading and extracting the zip file:
git init
git add .
git commit -m "BittieTasks platform - production ready"
git remote add origin https://github.com/YOUR_USERNAME/bittietasks.git
git push -u origin main
```

## Vercel Environment Variables

Add these in your Vercel dashboard:

```
NEXT_PUBLIC_SUPABASE_URL=https://ttgbotlcbzmmyqawnjpj.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR0Z2JvdGxjYnptbXlxYXduanBqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ2MDA4NzksImV4cCI6MjA3MDE3Njg3OX0.jc_PZay5gUyleINrGC5d5Sd2mCkHjonP56KCLJJNM1k
STRIPE_SECRET_KEY=your_stripe_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
```

Your platform will deploy automatically to Vercel once pushed to GitHub.