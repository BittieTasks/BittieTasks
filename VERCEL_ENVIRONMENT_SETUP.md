# Vercel Environment Variables Setup

## Values to Add to Vercel Dashboard

### **Step 1: Go to Vercel Dashboard**
- Visit: https://vercel.com/dashboard
- Find your BittieTasks project
- Go to: Settings → Environment Variables

### **Step 2: Add These Two Variables**

**Variable 1:**
- **Name**: `SENDGRID_API_KEY`
- **Value**: [Copy from your Replit Secrets tab - starts with SG.xxx]
- **Environment**: Production ✓ (and Preview if desired)

**Variable 2:**  
- **Name**: `SUPABASE_SERVICE_ROLE_KEY`
- **Value**: [Copy from your Replit Secrets tab - starts with eyJhbG...]
- **Environment**: Production ✓ (and Preview if desired)

### **Step 3: After Adding Variables**
1. Click "Save" for each variable
2. **Redeploy your project**:
   - Either push a new commit to trigger auto-deploy
   - Or go to Deployments tab and click "Redeploy"

### **Step 4: Test After Deployment**
- Visit: https://www.bittietasks.com/auth
- Try signing up with a test email
- Verification email should arrive within 1-2 minutes

**The signup flow will work perfectly once these environment variables are configured in Vercel!**