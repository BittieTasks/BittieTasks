# How to Get Your SendGrid API Key

## It's Already Available!

Your SendGrid API key is already stored in your Replit project secrets as `SENDGRID_API_KEY`.

## To View Your API Key:

1. **In Replit:**
   - Click on "Secrets" tab in the left sidebar 
   - Look for `SENDGRID_API_KEY`
   - Click the eye icon to reveal the value
   - Copy this value for Supabase SMTP setup

2. **If You Need a New One:**
   - Go to SendGrid Dashboard: https://app.sendgrid.com/
   - Navigate to Settings → API Keys
   - Click "Create API Key"
   - Choose "Full Access" permissions
   - Copy the generated key (starts with `SG.`)

## For Supabase SMTP Configuration:

Use these settings in Supabase → Settings → Authentication → SMTP Settings:

```
SMTP Host: smtp.sendgrid.net
SMTP Port: 587
SMTP User: apikey
SMTP Pass: [Paste your SENDGRID_API_KEY here]
Admin Email: noreply@bittietasks.com
Enable SMTP: ON
```

**Important:** 
- For "SMTP User" literally type `apikey`
- For "SMTP Pass" use your actual SendGrid API key
- Make sure to toggle SMTP to "ON"

## Next Steps After SMTP Setup:

1. Test signup flow in your app
2. Check email delivery works
3. Move forward with revenue generation features

The authentication system will then be fully functional with professional email delivery!