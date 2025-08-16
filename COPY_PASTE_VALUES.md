# Exact Values to Copy to Vercel Dashboard

## SendGrid API Key
**Copy this entire value to Vercel:**
```
[Will be displayed in terminal output - starts with SG.xxx]
```

## Supabase Service Role Key  
**Copy this entire value to Vercel:**
```
[Will be displayed in terminal output - starts with eyJhbG...]
```

## Steps:
1. **Go to Vercel Dashboard**: https://vercel.com/dashboard
2. **Find BittieTasks** → Settings → Environment Variables
3. **Delete the old SENDGRID_API_KEY** (if it exists)
4. **Add new SENDGRID_API_KEY** with the exact value from above
5. **Verify SUPABASE_SERVICE_ROLE_KEY** matches exactly  
6. **Set both to "Production" environment**
7. **Save and redeploy**

After this update, the signup flow will work perfectly!