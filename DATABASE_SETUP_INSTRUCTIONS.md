# Database Setup Instructions

## Alternative Approach - Manual SQL Setup

Since the automated database push is having connectivity issues, here's how to set up your database manually:

### Step 1: Copy the SQL Script

1. **Open the file:** `setup-database.sql` 
2. **Copy all the SQL content**

### Step 2: Run in Supabase SQL Editor

1. **Go to your Supabase dashboard:** https://supabase.com/dashboard/project/ttgbotlcbzmmyqawnjpj
2. **Click "SQL Editor" in the left sidebar**
3. **Click "New Query"**
4. **Paste the entire SQL script from `setup-database.sql`**
5. **Click "Run" button**

### Step 3: Verify Tables Were Created

After running the script, you should see these tables in your database:
- ✅ users
- ✅ tasks  
- ✅ task_participants
- ✅ transactions
- ✅ verification_submissions
- ✅ phone_verification_codes
- ✅ sessions

### Step 4: Test Your Authentication

Once the database is set up:

1. **Go to your app:** Your Replit preview URL
2. **Visit `/auth` page**
3. **Try signing up with an email**
4. **Check if user profile is created in database**

## What This Sets Up:

- ✅ Complete database schema with all tables
- ✅ Proper indexes for performance
- ✅ Row Level Security policies
- ✅ All enums and data types
- ✅ Foreign key relationships
- ✅ Authentication-ready user table

## Next Steps After Database Setup:

1. **Configure SendGrid SMTP** in Supabase Authentication settings
2. **Set up email templates** for verification emails  
3. **Test complete sign-up flow**

The SQL script creates everything your authentication system needs to work properly!