// Test authentication directly in browser console
console.log('Testing Supabase authentication...');

// Check environment variables
console.log('URL:', window.location.origin);
console.log('Testing auth flow...');

// Test direct Supabase connection
const testAuth = async () => {
  try {
    // Get from window if available, or use direct values
    const supabaseUrl = 'https://ttgbotlcbzmmyqawnjpj.supabase.co';
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR0Z2JvdGxjYnptbXlxYXduanBqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ2MDA4NzksImV4cCI6MjA3MDE3Njg3OX0.jc_PZay5gUyleINrGC5d5Sd2mCkHjonP56KCLJJNM1k';
    
    console.log('Creating Supabase client...');
    const { createClient } = supabase;
    const client = createClient(supabaseUrl, supabaseKey);
    
    console.log('Testing sign up...');
    const { data: signUpData, error: signUpError } = await client.auth.signUp({
      email: 'test@example.com',
      password: 'testpass123'
    });
    
    if (signUpError) {
      console.error('Sign up error:', signUpError);
    } else {
      console.log('Sign up success:', signUpData);
    }
    
    console.log('Testing sign in...');
    const { data: signInData, error: signInError } = await client.auth.signInWithPassword({
      email: 'test@example.com', 
      password: 'testpass123'
    });
    
    if (signInError) {
      console.error('Sign in error:', signInError);
    } else {
      console.log('Sign in success:', signInData);
    }
    
  } catch (err) {
    console.error('Test exception:', err);
  }
};

testAuth();