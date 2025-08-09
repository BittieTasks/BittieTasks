# Supabase Email Configuration Checklist

## Issue: Email Verification Not Working

### Critical Configuration Steps

**1. Supabase Site URL Configuration**
- Go to Supabase Dashboard → Settings → General  
- Set Site URL to your Replit app URL: `https://your-repl-name.repl.co`
- This is the domain where verification links will redirect

**2. Authentication Email Settings**
- Go to Authentication → Settings → Email
- Confirm Email: Should be **Enabled**
- Email template: Should use default or custom template

**3. SMTP Configuration (SendGrid)**
- Authentication → Settings → SMTP
- Should be configured to use SendGrid
- Host: smtp.sendgrid.net
- Port: 587
- Username: apikey
- Password: Your SendGrid API key

**4. Email Templates**
- Authentication → Email Templates
- Confirm signup template should be active
- Default redirect URL should match your Site URL

### Testing Steps

**Step 1: Verify Configuration**
```bash
# Check if Site URL is correct in Supabase dashboard
# Should match your Replit app domain
```

**Step 2: Test Email Delivery**
1. Sign up with a test email
2. Check email delivery in SendGrid Activity tab
3. Look for verification email in inbox/spam

**Step 3: Debug Verification Link**
1. Click verification link from email
2. Check browser console for errors
3. Verify URL parameters are parsed correctly

**Step 4: Manual User Verification**
If automated verification fails, you can manually verify users:

```javascript
// In Supabase Dashboard → SQL Editor
UPDATE auth.users 
SET email_confirmed_at = NOW() 
WHERE email = 'test@example.com';
```

### Common Issues & Solutions

**Issue: "Invalid Link" Error**
- Solution: Site URL in Supabase doesn't match your app domain
- Fix: Update Site URL in Supabase settings

**Issue: No Email Received** 
- Solution: SMTP not configured or SendGrid key invalid
- Fix: Verify SendGrid integration in Authentication settings

**Issue: Email in Spam**
- Solution: SendGrid reputation or content filtering
- Fix: Check spam folder, whitelist sender domain

**Issue: Token Parse Error**
- Solution: Frontend can't read verification parameters
- Fix: Debug verify-email-page.tsx URL parsing

### Next Steps
1. Check Supabase dashboard configuration
2. Test with a fresh email signup
3. Monitor SendGrid delivery logs
4. Debug frontend verification process

The most common issue is incorrect Site URL configuration in Supabase.