# 🗄️ Supabase Database Setup Guide

## Quick Setup Instructions

1. **Open your Supabase project dashboard**
   - Go to https://supabase.com/dashboard
   - Select your BittieTasks project

2. **Navigate to SQL Editor**
   - Click "SQL Editor" in the left sidebar
   - Click "New Query"

3. **Copy and run the setup script**
   - Open the `setup-database.sql` file in this project
   - Copy ALL the SQL content
   - Paste it into the Supabase SQL Editor
   - Click "Run" button

4. **Verify tables were created**
   - Go to "Table Editor" in the left sidebar
   - You should see these tables:
     - ✅ `profiles` - User accounts and subscription data
     - ✅ `tasks` - Task marketplace listings  
     - ✅ `task_participants` - User applications and completions
     - ✅ `transactions` - Payment and earnings tracking
     - ✅ `categories` - Pre-loaded task categories

## What the Setup Script Does

- **Creates 5 core tables** with proper relationships
- **Adds Row Level Security (RLS)** to protect user data
- **Pre-populates 8 task categories** (Errands, Transportation, Meal Prep, etc.)
- **Sets up automatic profile creation** when users sign up
- **Creates proper indexes** for performance
- **Adds subscription tier management** (Free/Pro/Premium)

## After Running the Script

Once the tables are created, users can:
- ✅ Sign up for accounts via the auth page
- ✅ Browse available tasks by category
- ✅ Apply to join community tasks
- ✅ Track earnings and subscription status
- ✅ Create their own tasks for others to join

The authentication system is already connected and ready to work with these tables!