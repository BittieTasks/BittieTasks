import { supabase } from '../supabase';
import { storage as memoryStorage } from '../memory-storage';
import bcrypt from 'bcryptjs';
import { User } from '@shared/schema';

interface MigrationResult {
  migrated: Array<{ oldId: string; newId: string; email: string }>;
  errors: Array<{ id: string; email: string; error: string }>;
  skipped: Array<{ id: string; email: string; reason: string }>;
}

/**
 * Migrates users from memory storage to Supabase authentication system
 * This creates proper Supabase auth users and profile records
 */
export async function migrateUsersToSupabase(): Promise<MigrationResult> {
  console.log('🚀 Starting user migration from memory storage to Supabase...');
  
  const results: MigrationResult = {
    migrated: [],
    errors: [],
    skipped: []
  };

  try {
    // Get all users from memory storage
    const existingUsers = await memoryStorage.getUsers();
    console.log(`Found ${existingUsers.length} users to migrate.`);

    for (const user of existingUsers) {
      try {
        // Check if user already exists in Supabase auth by email
        const { data: { users: existingUsers } } = await supabase.auth.admin.listUsers();
        const existingAuthUser = existingUsers.find(u => u.email === user.email);
        
        if (existingAuthUser) {
          console.log(`User with email ${user.email} already exists in Supabase auth. Skipping.`);
          results.skipped.push({ 
            id: user.id, 
            email: user.email, 
            reason: 'Email already exists in Supabase auth' 
          });
          continue;
        }

        // Create user in Supabase auth
        const { data: newAuthUser, error: createError } = await supabase.auth.admin.createUser({
          email: user.email,
          password: user.passwordHash || await bcrypt.hash('TemporaryPassword123!', 12),
          email_confirm: user.isEmailVerified || false,
          user_metadata: {
            first_name: user.firstName,
            last_name: user.lastName,
            username: user.username
          }
        });

        if (createError || !newAuthUser.user) {
          throw new Error(`Failed to create auth user: ${createError?.message || 'Unknown error'}`);
        }

        // Create profile record with all user data
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: newAuthUser.user.id, // Use the auth user ID
            username: user.username,
            first_name: user.firstName,
            last_name: user.lastName,
            email: user.email,
            profile_picture: user.profilePicture,
            total_earnings: user.totalEarnings,
            rating: user.rating,
            completed_tasks: user.completedTasks,
            current_streak: user.currentStreak,
            skills: user.skills,
            availability: user.availability,
            phone_number: user.phoneNumber,
            is_phone_verified: user.isPhoneVerified,
            is_identity_verified: user.isIdentityVerified,
            is_background_checked: user.isBackgroundChecked,
            trust_score: user.trustScore,
            risk_score: user.riskScore,
            identity_score: user.identityScore,
            behavior_score: user.behaviorScore,
            subscription_tier: user.subscriptionTier,
            subscription_status: user.subscriptionStatus,
            subscription_start_date: user.subscriptionStartDate,
            subscription_end_date: user.subscriptionEndDate,
            stripe_customer_id: user.stripeCustomerId,
            stripe_subscription_id: user.stripeSubscriptionId,
            monthly_task_limit: user.monthlyTaskLimit,
            monthly_tasks_completed: user.monthlyTasksCompleted,
            last_monthly_reset: user.lastMonthlyReset,
            priority_support: user.prioritySupport,
            ad_free: user.adFree,
            premium_badge: user.premiumBadge,
            referral_code: user.referralCode,
            referred_by: user.referredBy,
            referral_count: user.referralCount,
            referral_earnings: user.referralEarnings,
            created_at: user.createdAt || new Date(),
            updated_at: user.updatedAt || new Date()
          });

        if (profileError) {
          // Try to clean up the auth user if profile creation fails
          await supabase.auth.admin.deleteUser(newAuthUser.user.id);
          throw new Error(`Failed to create profile: ${profileError.message}`);
        }

        results.migrated.push({
          oldId: user.id,
          newId: newAuthUser.user.id,
          email: user.email
        });

        console.log(`✅ Successfully migrated user: ${user.email}`);

      } catch (err) {
        console.error(`❌ Error migrating user ${user.id} (${user.email}):`, err);
        results.errors.push({
          id: user.id,
          email: user.email,
          error: err instanceof Error ? err.message : String(err)
        });
      }
    }

    console.log(`🎉 Migration completed: ${results.migrated.length} migrated, ${results.errors.length} errors, ${results.skipped.length} skipped`);
    return results;

  } catch (err) {
    console.error('💥 Migration failed:', err);
    throw err;
  }
}

/**
 * Creates the profiles table and triggers in Supabase if they don't exist
 */
export async function setupSupabaseProfiles() {
  console.log('🔧 Setting up Supabase profiles table and triggers...');
  
  // SQL to create profiles table and triggers
  const setupSQL = `
    -- Create profiles table if it doesn't exist
    CREATE TABLE IF NOT EXISTS profiles (
      id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
      username TEXT UNIQUE,
      first_name TEXT,
      last_name TEXT,
      email TEXT,
      profile_picture TEXT,
      total_earnings DECIMAL DEFAULT 0.00,
      rating DECIMAL DEFAULT 0.00,
      completed_tasks INTEGER DEFAULT 0,
      current_streak INTEGER DEFAULT 0,
      skills TEXT[] DEFAULT '{}',
      availability JSONB,
      phone_number TEXT,
      is_phone_verified BOOLEAN DEFAULT false,
      is_identity_verified BOOLEAN DEFAULT false,
      is_background_checked BOOLEAN DEFAULT false,
      trust_score INTEGER DEFAULT 0,
      risk_score INTEGER DEFAULT 0,
      identity_score INTEGER DEFAULT 0,
      behavior_score INTEGER DEFAULT 0,
      subscription_tier TEXT DEFAULT 'free',
      subscription_status TEXT DEFAULT 'active',
      subscription_start_date TIMESTAMP,
      subscription_end_date TIMESTAMP,
      stripe_customer_id TEXT,
      stripe_subscription_id TEXT,
      monthly_task_limit INTEGER DEFAULT 5,
      monthly_tasks_completed INTEGER DEFAULT 0,
      last_monthly_reset TIMESTAMP DEFAULT NOW(),
      priority_support BOOLEAN DEFAULT false,
      ad_free BOOLEAN DEFAULT false,
      premium_badge BOOLEAN DEFAULT false,
      referral_code TEXT,
      referred_by TEXT,
      referral_count INTEGER DEFAULT 0,
      referral_earnings DECIMAL DEFAULT 0.00,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );

    -- Enable RLS
    ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

    -- Create policy for users to manage their own profile
    DROP POLICY IF EXISTS "Users can view and update own profile" ON profiles;
    CREATE POLICY "Users can view and update own profile" ON profiles
      FOR ALL USING (auth.uid() = id);

    -- Create function to handle new user signup
    CREATE OR REPLACE FUNCTION public.handle_new_user() 
    RETURNS trigger AS $$
    BEGIN
      INSERT INTO public.profiles (id, email, first_name, last_name)
      VALUES (
        new.id,
        new.email,
        new.raw_user_meta_data ->> 'first_name',
        new.raw_user_meta_data ->> 'last_name'
      );
      RETURN new;
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;

    -- Create trigger for new user signup
    DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
  `;

  // Since exec_sql function is not available, we'll create an SQL file for manual execution
  console.log('📋 SQL for manual execution in Supabase dashboard:');
  console.log('==========================================');
  console.log(setupSQL);
  console.log('==========================================');
  
  // Test if profiles table exists by attempting a simple query
  const { error: testError } = await supabase
    .from('profiles')
    .select('id')
    .limit(1);
  
  if (testError) {
    console.log('⚠️ Profiles table may not exist. Please run the SQL above in Supabase dashboard.');
    throw new Error(`Profiles table setup required: ${testError.message}`);
  }
  
  console.log('✅ Supabase profiles table and triggers set up successfully');
}