# Supabase Production URL Configuration

## Required Supabase Settings for www.bittietasks.com

### **Site URL Configuration:**
```
Site URL: https://www.bittietasks.com
```

### **Redirect URLs (Authentication):**
Add these URLs to your Supabase project:

```
https://www.bittietasks.com/auth/callback
https://www.bittietasks.com/auth
https://www.bittietasks.com/dashboard
https://www.bittietasks.com/verify-email
https://www.bittietasks.com/
```

### **Email Templates (if using Supabase Auth UI):**
- **Confirm your signup**: `https://www.bittietasks.com/verify-email?token={{ .Token }}`
- **Magic Link**: `https://www.bittietasks.com/auth/callback?token={{ .Token }}&type=magiclink`
- **Change Email Address**: `https://www.bittietasks.com/auth/callback?token={{ .Token }}&type=email_change&redirect_to=https://www.bittietasks.com/dashboard`
- **Reset Password**: `https://www.bittietasks.com/auth/callback?token={{ .Token }}&type=recovery&redirect_to=https://www.bittietasks.com/auth`

### **Environment Variables for Production:**
Your hosting platform (Vercel/Netlify) needs these exact variables:

```
NEXT_PUBLIC_SUPABASE_URL=[Your Supabase Project URL]
NEXT_PUBLIC_SUPABASE_ANON_KEY=[Your Supabase Anon Key]
SUPABASE_SERVICE_ROLE_KEY=[Your Supabase Service Role Key]
SENDGRID_API_KEY=[Your SendGrid API Key]
```

### **Steps to Configure:**

1. **In Supabase Dashboard:**
   - Go to Authentication → Settings → Site URL
   - Set: `https://www.bittietasks.com`

2. **In Supabase Dashboard:**
   - Go to Authentication → URL Configuration → Redirect URLs
   - Add all the URLs listed above

3. **In Your Hosting Platform:**
   - Add all environment variables with the exact same values as development

### **Test After Configuration:**
- Visit: `https://www.bittietasks.com/auth`
- Try signup with a test email
- Verification email should arrive and work correctly