# Configure Supabase SMTP Settings

## NEXT STEP: Configure Supabase to Use SendGrid

### Go to Supabase Dashboard
1. **Visit:** https://supabase.com/dashboard
2. **Select:** Your BittieTasks project
3. **Navigate to:** Settings → Auth
4. **Scroll down to:** "SMTP Settings"

### Enter These Exact Settings:
```
SMTP Host: smtp.sendgrid.net
SMTP Port: 587
SMTP User: apikey
SMTP Pass: [Your SendGrid API Key]
SMTP Admin Email: noreply@bittietasks.com
```

### Important Notes:
- Use **apikey** as the username (not your actual SendGrid username)
- Use your **SendGrid API Key** as the password
- Use **noreply@bittietasks.com** since that's your verified sender

### After Saving:
1. **Turn ON:** "Enable email confirmations" 
2. **Click:** "Save"

### What This Fixes:
- Your friends can signup without rate limit errors
- They'll receive verification emails via SendGrid
- Authentication will work completely

Once you've configured this, let me know and I'll test the complete signup flow!