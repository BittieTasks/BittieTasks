# URGENT: Complete Supabase SendGrid Configuration

## Step 1: Configure SMTP in Supabase Dashboard

1. **Go to:** https://supabase.com/dashboard
2. **Select:** BittieTasks project  
3. **Navigate to:** Settings → Auth
4. **Scroll to:** "SMTP Settings" section
5. **Enter these EXACT values:**

```
SMTP Host: smtp.sendgrid.net
SMTP Port: 587
SMTP User: apikey
SMTP Pass: [Your SendGrid API Key]
SMTP Admin Email: noreply@bittietasks.com
```

6. **Click:** "Save"

## Step 2: Verify Sender in SendGrid

1. **Go to:** https://app.sendgrid.com/
2. **Navigate to:** Settings → Sender Authentication  
3. **Add:** noreply@bittietasks.com as verified sender
4. **Complete verification process**

## Step 3: Enable Email Confirmations

1. **In Supabase Auth Settings**
2. **Turn ON:** "Enable email confirmations"
3. **Save settings**

## After Setup Complete:
- Friends can signup normally
- They'll receive verification emails via SendGrid
- No more rate limiting issues
- Authentication fully operational