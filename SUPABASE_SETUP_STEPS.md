# Supabase Database Setup Steps

## Quick Setup (5 minutes)

### Step 1: Open Supabase SQL Editor
1. Go to your Supabase project dashboard
2. Click "SQL Editor" in the left sidebar
3. Click "New Query"

### Step 2: Run the Database Setup
1. Copy the entire contents of `DATABASE_SETUP.sql`
2. Paste it into the SQL Editor
3. Click "Run" button

This single command will create:
- ✅ All required tables (users, tasks, applications, submissions, transactions)
- ✅ Row Level Security policies
- ✅ Storage bucket for photos
- ✅ Performance indexes
- ✅ 25 everyday platform tasks

### Step 3: Verify Setup
After running the SQL, you should see:
- Tables created in "Table Editor"
- Storage bucket "task-photos" in "Storage"
- 5 platform tasks in the tasks table

### Step 4: Authentication Settings
1. Go to "Authentication" → "Settings"
2. Enable these providers:
   - ✅ Email (already enabled)
   - ✅ Phone (for SMS verification)

### Step 5: Storage Settings (Optional)
1. Go to "Storage" → "Policies"
2. Verify bucket policies are created
3. Test file upload (optional)

## Manual Verification Commands

If you want to check the setup worked:

```sql
-- Check tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';

-- Check platform tasks loaded
SELECT id, title, payout FROM tasks WHERE category = 'solo';

-- Check RLS is enabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';

-- Check storage bucket
SELECT * FROM storage.buckets WHERE name = 'task-photos';
```

## What This Enables

After setup, your app can:
- ✅ User registration and authentication
- ✅ Task applications and submissions
- ✅ Photo uploads for verification
- ✅ AI verification system
- ✅ Payment processing through Stripe
- ✅ Real-time updates
- ✅ Secure data access with RLS

## Troubleshooting

**If SQL fails:**
- Run commands in smaller chunks
- Check for syntax errors
- Ensure you have proper permissions

**If RLS blocks access:**
- Check authentication is working
- Verify user UUID matches database records
- Test policies with simple SELECT statements

**If storage fails:**
- Verify bucket creation
- Check storage policies
- Test upload permissions

Your database is now production-ready for BittieTasks! 🚀