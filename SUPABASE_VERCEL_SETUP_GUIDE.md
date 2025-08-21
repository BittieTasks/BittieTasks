# Complete Setup Guide: Supabase + Vercel for BittieTasks Authentication

## 🔧 Supabase Configuration Required

### 1. Authentication Settings

**Go to Supabase Dashboard → Authentication → Settings:**

#### Email Templates
- **Enable email confirmations**: ON
- **Secure email change**: ON  
- **Double confirm email changes**: ON

#### URL Configuration
```
Site URL: https://www.bittietasks.com
Redirect URLs: 
- https://www.bittietasks.com/auth/callback
- http://localhost:3000/auth/callback
- http://localhost:5000/auth/callback
```

#### User Management
- **Enable email confirmations**: ON
- **Enable phone confirmations**: OFF (using email-first flow)
- **User session timeout**: 24 hours (86400 seconds)

#### Security Settings
- **JWT expiry**: 3600 seconds (1 hour)
- **Refresh token rotation**: ON
- **Reuse interval**: 10 seconds

### 2. Database Setup (Row Level Security)

**Run these SQL commands in Supabase SQL Editor:**

```sql
-- Enable RLS on auth.users (if not already enabled)
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for your custom tables
-- Example for a tasks table:
CREATE POLICY "Users can view their own tasks" ON tasks
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own tasks" ON tasks
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tasks" ON tasks
    FOR UPDATE USING (auth.uid() = user_id);

-- Create RLS policies for profiles/user data
CREATE POLICY "Users can view their own profile" ON profiles
    FOR ALL USING (auth.uid() = id);
```

### 3. API Settings

**Authentication → Settings → API:**
- **Auto-confirm users**: OFF (require email confirmation)
- **Disable signup**: OFF (allow new registrations)
- **External OAuth providers**: Configure if needed

### 4. Required Environment Variables

**In Supabase Dashboard → Settings → API:**

Copy these values to your `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 🚀 Vercel Configuration Required

### 1. Environment Variables Setup

**In Vercel Dashboard → Your Project → Settings → Environment Variables:**

Add all your environment variables:
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Stripe
STRIPE_SECRET_KEY=sk_live_...
VITE_STRIPE_PUBLIC_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# SendGrid
SENDGRID_API_KEY=SG....

# Twilio
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER=+1...

# OpenAI
OPENAI_API_KEY=sk-...
```

### 2. Domain Configuration

**In Vercel → Domains:**
- Add `www.bittietasks.com` as custom domain
- Set up SSL certificate (automatic with Vercel)
- Configure DNS records as shown by Vercel

### 3. Build & Deploy Settings

**Vercel → Settings → General:**
```
Framework Preset: Next.js
Root Directory: ./
Build Command: npm run build
Output Directory: .next
Install Command: npm install
Node.js Version: 18.x
```

### 4. Vercel Functions Configuration

**Create `vercel.json` in root (if not exists):**
```json
{
  "functions": {
    "app/api/**/*.ts": {
      "runtime": "nodejs18.x"
    }
  },
  "regions": ["iad1"]
}
```

## 🔒 Security Checklist

### Supabase Security
- ✅ RLS enabled on all user-related tables
- ✅ Service role key kept secure (server-side only)
- ✅ Anon key properly configured for client-side
- ✅ URL redirect list properly configured
- ✅ Email confirmation required for new users

### Vercel Security  
- ✅ Environment variables properly set
- ✅ HTTPS enforced on custom domain
- ✅ No sensitive keys in client-side code
- ✅ API routes protected with authentication

## 🧪 Testing Authentication Flow

### 1. Test Email Signup
1. Go to `/auth` page
2. Click "Sign Up" tab
3. Enter email/password
4. Check email for confirmation link
5. Click confirmation link → should redirect to dashboard

### 2. Test Email Login
1. Go to `/auth` page  
2. Enter confirmed email/password
3. Should immediately redirect to dashboard
4. Refresh page → should stay logged in

### 3. Test Session Persistence
1. Sign in successfully
2. Close browser completely
3. Reopen and go to site
4. Should automatically redirect to dashboard

### 4. Test API Authentication
1. Open browser dev tools → Network tab
2. Perform any authenticated action (apply to task, etc.)
3. Check request headers include `Authorization: Bearer ...`
4. Check response is successful (200/201)

## 🚨 Common Issues & Fixes

### Issue: "Invalid login credentials"
**Fix:** Check email is confirmed in Supabase Auth Users table

### Issue: "Session not persisting" 
**Fix:** Verify redirect URLs match exactly in Supabase settings

### Issue: "CORS errors"
**Fix:** Add your domain to Supabase URL configuration

### Issue: "JWT expired"
**Fix:** Check token expiry settings in Supabase auth config

### Issue: "Unauthorized API calls"
**Fix:** Verify `SUPABASE_SERVICE_ROLE_KEY` is set in Vercel environment

## 📊 Monitoring & Analytics

### Supabase Dashboard Monitoring
- **Auth → Users**: Monitor user registrations
- **Auth → Logs**: Check authentication errors  
- **Database → Logs**: Monitor query performance
- **API → Logs**: Track API usage

### Vercel Analytics
- **Functions**: Monitor API response times
- **Speed Insights**: Track page load performance
- **Real User Monitoring**: Monitor user experience

## 🔄 Deployment Workflow

### 1. Local Testing
```bash
# Test with production environment variables
cp .env.local .env.production.local
npm run build
npm run start
```

### 2. Staging Deploy
```bash
git push origin staging
# Verify authentication works on staging domain
```

### 3. Production Deploy
```bash
git push origin main
# Automatic deployment to www.bittietasks.com
```

## 📝 Required DNS Records

**For www.bittietasks.com (configure with your domain provider):**
```
CNAME www.bittietasks.com → cname.vercel-dns.com
A bittietasks.com → 76.76.19.61 (Vercel IP)
```

**Verification:**
- Test `https://www.bittietasks.com` loads correctly
- Test `https://bittietasks.com` redirects to www version
- SSL certificate shows as valid

---

## ✅ Final Verification Checklist

Before going live, verify:
- [ ] Authentication signup/login works
- [ ] Session persists across browser sessions  
- [ ] Email confirmations are sent and work
- [ ] All API endpoints require proper authentication
- [ ] Task applications work with authenticated users
- [ ] Payment processing works with user sessions
- [ ] No authentication errors in browser console
- [ ] All environment variables set in Vercel
- [ ] Domain properly configured and SSL working
- [ ] Database RLS policies properly configured