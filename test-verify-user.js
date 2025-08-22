// Quick admin script to verify a test user
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

async function verifyTestUser() {
  try {
    // Update user to be verified
    const { data, error } = await supabaseAdmin.auth.admin.updateUserById(
      'aadd85b2-78b2-4bb0-bf6e-974aff156f72', // User ID from signup logs
      {
        email_confirm: true
      }
    );

    if (error) {
      console.error('Error verifying user:', error);
    } else {
      console.log('User verified successfully:', data);
    }
  } catch (err) {
    console.error('Script error:', err);
  }
}

verifyTestUser();