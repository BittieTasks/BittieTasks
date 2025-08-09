# 🚀 Deploy BittieTasks - Copy These Commands

## Step 1: Create GitHub Repository
1. Go to https://github.com/new
2. Repository name: `bittietasks`
3. Keep it public or private (your choice)
4. **Don't** check "Add a README file"
5. Click "Create repository"

## Step 2: Copy Your GitHub URL
After creating the repo, copy the HTTPS URL that looks like:
`https://github.com/YOUR_USERNAME/bittietasks.git`

## Step 3: Run These Commands in Replit Shell
```bash
# Initialize git (if not already done)
git init

# Add all your files
git add .

# Make first commit
git commit -m "Complete BittieTasks monetization platform ready for deployment"

# Set main branch
git branch -M main

# Add your GitHub repo (replace YOUR_USERNAME with your actual username)
git remote add origin https://github.com/YOUR_USERNAME/bittietasks.git

# Push to GitHub
git push -u origin main
```

## Step 4: Deploy to Vercel
1. Go to https://vercel.com
2. Sign up/login with GitHub
3. Click "New Project"
4. Import your `bittietasks` repository
5. Click "Deploy" (Vercel auto-detects Next.js)

## Step 5: Add Environment Variables in Vercel
In Vercel Dashboard → Project → Settings → Environment Variables:

Add these variables:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `STRIPE_SECRET_KEY`
- `SENDGRID_API_KEY`

## Result: Live Revenue Platform!
Your platform will be live at: `https://bittietasks.vercel.app`

**Ready to start earning immediately with:**
- Task marketplace
- Subscription tiers (10%/7%/5% fees)
- Corporate sponsorships
- Real-time earnings tracking