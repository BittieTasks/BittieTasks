# Supabase RLS Setup Instructions

## Apply RLS Policies

To apply the Row Level Security policies to your Supabase database:

1. **Open Supabase Dashboard**
   - Go to [supabase.com](https://supabase.com)
   - Navigate to your project
   - Click on "SQL Editor" in the left sidebar

2. **Run the RLS Policies**
   - Copy the contents of `supabase/rls-policies.sql`
   - Paste into the SQL Editor
   - Click "Run" to execute all policies

3. **Verify Policies Applied**
   - Go to "Database" → "Tables" in the left sidebar
   - Click on any table (e.g., "users")
   - You should see "RLS enabled" and listed policies

## What These Policies Do

### Security Features:
- **Users**: Can only see/edit their own data
- **Task Categories**: Public read access, admin-only management
- **Tasks**: Public read access, users can manage their own tasks
- **Task Completions**: Users see only their completions + completions for their tasks
- **Messages**: Users see only messages they sent/received
- **Achievements**: Users see only their achievements
- **Admin Access**: Special privileges for admin@bittietasks.com

### Key Benefits:
- ✅ **Data Isolation**: Users can't access other users' private data
- ✅ **Admin Controls**: Dedicated admin access for platform management
- ✅ **Public Content**: Task categories and tasks visible to all users
- ✅ **Secure Messaging**: Private message system
- ✅ **Achievement Privacy**: Personal achievements protected

## Testing RLS

After applying policies, test with:
```bash
# Should work - public data
curl -H "Authorization: Bearer [token]" http://localhost:5000/api/categories

# Should work - user's own data  
curl -H "Authorization: Bearer [token]" http://localhost:5000/api/auth/user

# Should fail - other user's data (in Supabase directly)
```

The BittieTasks application now has enterprise-grade security! 🔒