# Deploy BittieTasks to Supabase

## Quick Deployment Steps

Your complete monetization platform is ready for deployment via Supabase Edge Functions and hosting.

### 1. Connect to Supabase CLI
```bash
npx supabase login
npx supabase init
```

### 2. Link to Your Project
```bash
npx supabase link --project-ref YOUR_PROJECT_REF
```

### 3. Deploy Database Schema
```bash
npx supabase db push
```

### 4. Deploy Edge Functions (API Routes)
```bash
npx supabase functions deploy
```

### 5. Deploy Frontend to Vercel/Netlify
Since you have a working Next.js app, you can deploy the frontend to:

**Option A: Vercel (Recommended)**
1. Connect your GitHub repo to Vercel
2. Set environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `STRIPE_SECRET_KEY`
   - `SENDGRID_API_KEY`

**Option B: Netlify**
1. Connect repo to Netlify
2. Build command: `npm run build`
3. Publish directory: `.next`

### Alternative: Export as Static Site
```bash
# Add to next.config.js
output: 'export'

# Build static version
npm run build
```

## Why This Works Better

✅ **Supabase handles**: Database, Auth, Real-time features
✅ **Vercel/Netlify handles**: Frontend hosting, CDN, automatic deployments
✅ **No Replit build conflicts**: Clean separation of concerns

## Your Revenue Features Ready
- Task marketplace with real earnings
- Subscription tiers: Free (10%) → Pro (7%) → Premium (5%)
- Corporate sponsorship portal
- Email verification access control
- Real-time earnings dashboard

Would you like me to help you set up the Supabase deployment or export the static version?