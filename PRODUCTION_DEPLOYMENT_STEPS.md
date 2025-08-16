# Step-by-Step Production Deployment Configuration

## Step 3: Configure Replit Deployment Secrets

### **Method 1: Using Replit Secrets Panel**

1. **Open Secrets Panel**:
   - In your Replit workspace, look for the "Secrets" tab (usually in left sidebar or Tools menu)
   - Or press the lock icon 🔒

2. **Add these exact environment variables**:

   **Variable 1:**
   - Name: `NEXT_PUBLIC_SUPABASE_URL`
   - Value: `https://ttgbotlcbzmmyqawnjpj.supabase.co`

   **Variable 2:**
   - Name: `NEXT_PUBLIC_SUPABASE_ANON_KEY`  
   - Value: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR0Z2JvdGxjYnptbXlxYXduanBqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ2MDA4NzksImV4cCI6MjA3MDE3Njg3OX0.jc_PZay5gUyleINrGC5d5Sd2mCkHjonP56KCLJJNM1k`

   **Variable 3:**
   - Name: `SUPABASE_SERVICE_ROLE_KEY`
   - Value: [Already exists in your secrets - will auto-sync]

   **Variable 4:**
   - Name: `SENDGRID_API_KEY`
   - Value: [Already exists in your secrets - will auto-sync]

3. **Click "Add Secret" for each variable**

### **Step 4: Deploy to Production**

1. **Click the "Deploy" button** in your Replit workspace
2. **Choose "Autoscale Deployment"**
3. **Configure deployment**:
   - Build command: `npm run build`
   - Run command: `npm run start`
4. **Click "Deploy"**

### **Step 5: Configure Custom Domain (if needed)**

1. **In Deployment Dashboard**
2. **Click "Custom Domains"**
3. **Add domain**: `www.bittietasks.com`
4. **Follow DNS configuration instructions**

### **Verification After Deployment**

Test these URLs:
- https://your-replit-app.replit.app/auth (should load)
- https://www.bittietasks.com/auth (if custom domain configured)

The signup flow should now work with proper email verification!