# Email Verification Debug Guide

## Current Issue: Email Verification Not Working

### Problem Analysis
User reports that email verification is not working properly. Let's diagnose the complete flow:

### Step 1: Check Supabase Email Configuration

**In Supabase Dashboard:**
1. Go to Authentication > Settings
2. Verify Site URL is set to your Replit domain
3. Check if SMTP is configured (should be SendGrid)
4. Verify email templates are enabled

**Expected Settings:**
- Site URL: `https://your-app-name.repl.co`
- Confirm email: Enabled
- SMTP: SendGrid configured

### Step 2: Debug Email Delivery

**Check SendGrid:**
1. Log into SendGrid dashboard
2. Go to Activity tab
3. Look for recent email delivery attempts
4. Check if emails are being sent but not delivered

### Step 3: Verify Email Link Format

**Supabase sends emails with this format:**
```
https://your-app-name.repl.co/verify-email?access_token=XXX&refresh_token=XXX&type=signup
```

**Or hash format:**
```
https://your-app-name.repl.co/verify-email#access_token=XXX&refresh_token=XXX&type=signup
```

### Step 4: Debug Frontend Processing

The verify-email-page.tsx should:
1. Parse URL parameters or hash
2. Extract access_token and refresh_token  
3. Call supabase.auth.setSession()
4. Redirect to home page

### Step 5: Common Issues

**Issue 1: Wrong Site URL**
- Supabase sends emails with wrong domain
- Fix: Update Site URL in Supabase settings

**Issue 2: SMTP Not Configured**
- Emails not being sent
- Fix: Configure SendGrid SMTP in Supabase

**Issue 3: Email in Spam**
- User doesn't see verification email
- Fix: Check spam folder, whitelist sender

**Issue 4: Token Parsing Error**
- Frontend can't parse verification link
- Fix: Debug URL parsing in verify-email-page.tsx

**Issue 5: Session Setting Error**
- Tokens are valid but session fails
- Fix: Check supabase.auth.setSession() errors

### Quick Test Commands

```bash
# Test if user was created
node -e "
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
supabase.auth.admin.listUsers().then(r => console.log('Users:', r.data.users.length));
"

# Check profiles table
node -e "
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
supabase.from('profiles').select('count').then(r => console.log('Profiles:', r));
"
```

### Immediate Fixes Needed

1. **Fix Supabase Site URL** - Most common issue
2. **Verify SendGrid Integration** - Check email delivery
3. **Test Manual Verification** - Create test user and verify
4. **Debug Console Logs** - Check browser console during verification
5. **Test Different Email Providers** - Gmail, Yahoo, etc.

The verification system is built correctly, likely a configuration issue in Supabase dashboard.