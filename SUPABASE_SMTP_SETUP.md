# Supabase SMTP Configuration with SendGrid

## Quick Setup Guide

### Step 1: Configure SMTP in Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to **Settings** → **Authentication**
3. Scroll down to **SMTP Settings**
4. Enter these exact settings:

```
SMTP Host: smtp.sendgrid.net
SMTP Port: 587
SMTP Username: apikey
SMTP Password: [Your SENDGRID_API_KEY from Replit secrets]
Sender Name: BittieTasks
Sender Email: noreply@bittietasks.com
Enable SMTP: ON
```

### Step 2: Verify Domain in SendGrid (Critical!)

**Option A: Quick Single Sender Verification (Fastest)**
1. Go to SendGrid Dashboard → Settings → Sender Authentication
2. Click "Verify a Single Sender"
3. Use: `noreply@bittietasks.com` or any email you control
4. Verify the email address

**Option B: Domain Authentication (Professional)**
1. Go to SendGrid Dashboard → Settings → Sender Authentication
2. Click "Authenticate Your Domain" 
3. Enter: `bittietasks.com`
4. Add the DNS records SendGrid provides
5. Wait for verification (can take up to 48 hours)

### Step 3: Test Authentication

Once configured, test the signup flow:
1. Go to your BittieTasks app
2. Try signing up with a real email address
3. Use password format: `MySecurePass123!`
4. Check email for Supabase verification link

## Email Flow After Setup

✅ **User Signs Up** → Supabase creates account
✅ **Supabase Sends Email** → Via SendGrid SMTP
✅ **User Clicks Link** → Account verified 
✅ **User Logs In** → Full access to app

## Troubleshooting

**If emails aren't sending:**
- Check SMTP credentials match exactly
- Ensure sender email is verified in SendGrid
- Check SendGrid activity log for errors
- Verify domain authentication status

**Common Issues:**
- Wrong SMTP port (use 587, not 465)
- Unverified sender email
- API key permissions in SendGrid

## Benefits of This Setup

- Professional email delivery
- Reliable authentication flow  
- Single email provider (SendGrid)
- Supabase handles auth logic
- Clean separation of concerns