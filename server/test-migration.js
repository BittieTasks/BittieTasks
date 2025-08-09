// Quick test of the migration system
const { storage } = require('./memory-storage');
const { migrateUsersToSupabase } = require('./migrations/supabase-user-migration');

async function testMigration() {
  console.log('🧪 Testing migration system...');
  
  try {
    // First check if we have users to migrate
    const users = await storage.getUsers();
    console.log(`Found ${users.length} users in memory storage`);
    
    if (users.length > 0) {
      console.log('Sample user:', {
        id: users[0].id,
        email: users[0].email,
        firstName: users[0].firstName,
        isEmailVerified: users[0].isEmailVerified
      });
    }
    
    console.log('✅ Migration system test completed');
  } catch (error) {
    console.error('❌ Migration test failed:', error.message);
  }
}

testMigration();