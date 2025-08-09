# 🔐 Environment Variables for Vercel

## Your Current Environment Variables (from .env.local):

Copy these exact values to Vercel:

### 1. NEXT_PUBLIC_SUPABASE_URL
```
[Copy from your .env.local file]
```

### 2. NEXT_PUBLIC_SUPABASE_ANON_KEY  
```
[Copy from your .env.local file]
```

### 3. STRIPE_SECRET_KEY
```
[Copy from your Secrets tab or .env.local]
```

### 4. SENDGRID_API_KEY
```
[Copy from your Secrets tab or .env.local]
```

## How to Add in Vercel:

1. **Go to your Vercel project dashboard**
2. **Click "Settings" tab**
3. **Click "Environment Variables" in left sidebar**
4. **For each variable:**
   - Click "Add New"
   - Enter the Name (exactly as shown above)
   - Enter the Value (copy from your .env.local)
   - Click "Save"

## Important Notes:
- Variable names must be EXACT (case-sensitive)
- Values should NOT include quotes
- After adding all 4, click "Redeploy" from Deployments tab

## Alternative: Quick Copy
You can also copy the values from your Replit Secrets tab:
- Go to Replit sidebar → Secrets (🔐 icon)
- Copy each value exactly

Your revenue platform needs these to connect to Supabase, process payments, and send emails!