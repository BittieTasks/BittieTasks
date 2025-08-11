# 🚀 Git Commands - Step by Step

## Run These Commands in Replit Shell (Open Shell Tab):

### Step 1: Prepare Your Code
```bash
git add .
```

### Step 2: Commit Your Platform
```bash
git commit -m "Complete BittieTasks monetization platform ready for deployment"
```

### Step 3: Set Main Branch
```bash
git branch -M main
```

### Step 4: Create GitHub Repository
1. Go to https://github.com/new
2. Repository name: `bittietasks`
3. **IMPORTANT**: Leave "Add a README file" UNCHECKED
4. Click "Create repository"
5. Copy the HTTPS URL (looks like: `https://github.com/YOUR_USERNAME/bittietasks.git`)

### Step 5: Connect to GitHub
```bash
# Replace YOUR_USERNAME with your actual GitHub username
git remote add origin https://github.com/YOUR_USERNAME/bittietasks.git
```

### Step 6: Push to GitHub
```bash
git push -u origin main
```

### Step 7: Deploy to Vercel
1. Go to https://vercel.com
2. Sign up/login with GitHub
3. Click "New Project"
4. Import your `bittietasks` repository
5. Click "Deploy"

### Step 8: Add Environment Variables in Vercel
Project → Settings → Environment Variables:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `STRIPE_SECRET_KEY`
- `SENDGRID_API_KEY`

## Result: Live Revenue Platform!
Your platform will be at: `https://bittietasks.vercel.app`

Start with Step 1 in the Shell tab!