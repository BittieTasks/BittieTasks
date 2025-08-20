# Complete Supabase Authentication Setup Guide

## Step 1: Fix Database Connection

1. **Go to your Supabase dashboard:** https://supabase.com/dashboard/project/ttgbotlcbzmmyqawnjpj
2. **Click "Settings" → "Database"**
3. **Copy the connection string and replace `[YOUR-PASSWORD]` with your actual database password**
4. **Update your DATABASE_URL in environment variables**

## Step 2: Configure Email Authentication with SendGrid

1. **In Supabase Dashboard:**
   - Go to "Authentication" → "Settings" 
   - Scroll to "SMTP Settings"
   - Enable "Enable custom SMTP"

2. **Configure SMTP with SendGrid:**
   - **Host:** smtp.sendgrid.net
   - **Port:** 587
   - **Username:** apikey
   - **Password:** [Your SendGrid API Key]
   - **Sender name:** BittieTasks
   - **Sender email:** noreply@bittietasks.com (or your verified domain)

## Step 3: Configure Email Templates

1. **In Supabase Dashboard:**
   - Go to "Authentication" → "Email Templates"
   - Customize the "Confirm signup" template
   - Set the redirect URL to: `https://your-domain.com/auth/callback`

## Step 4: Test the System

Once these steps are complete, you'll have:
- ✅ Working database connection
- ✅ SendGrid email delivery
- ✅ Custom email templates
- ✅ Complete sign-up → verify → sign-in flow

## Quick Test Commands (run after setup):

```bash
# Push database schema
npx drizzle-kit push

# Test the application
npm run dev
```

## Current Status:
- 🔧 Database connection needs password
- ✅ SendGrid API key configured
- ✅ Authentication system code ready
- ✅ All forms and flows implemented