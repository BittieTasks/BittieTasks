// Test script to verify Supabase database setup
// Run this in your browser console or Node.js after setting up the project

// Replace these with your actual Supabase credentials
const SUPABASE_URL = 'https://your-project.supabase.co'
const SUPABASE_ANON_KEY = 'your-anon-key'

// Simple test to check if database is working
async function testSupabaseConnection() {
  try {
    // Test fetching task categories
    const response = await fetch(`${SUPABASE_URL}/rest/v1/task_categories`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      }
    });
    
    const categories = await response.json();
    console.log('✅ Database connection successful!');
    console.log('📂 Task categories:', categories);
    
    return categories;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
  }
}

// Run the test
testSupabaseConnection();