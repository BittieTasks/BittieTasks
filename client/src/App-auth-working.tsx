import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://ttgbotlcbzmmyqawnjpj.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR0Z2JvdGxjYnptbXlxYXduanBqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ2MDA4NzksImV4cCI6MjA3MDE3Njg3OX0.jc_PZay5gUyleINrGC5d5Sd2mCkHjonP56KCLJJNM1k'
);

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState('signin'); // 'signin' or 'signup'
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleAuth = async (e) => {
    e.preventDefault();
    setMessage('');
    setLoading(true);

    try {
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        setMessage('Check your email for verification link!');
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      }
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        fontFamily: 'Arial, sans-serif'
      }}>
        <div>Loading BittieTasks...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        fontFamily: 'Arial, sans-serif',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}>
        <div style={{
          background: 'rgba(255,255,255,0.1)',
          padding: '40px',
          borderRadius: '15px',
          minWidth: '400px',
          textAlign: 'center'
        }}>
          <h1 style={{ marginBottom: '30px' }}>BittieTasks</h1>
          <p style={{ marginBottom: '30px' }}>Little Tasks, Real Income</p>
          
          <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                padding: '12px',
                borderRadius: '8px',
                border: 'none',
                fontSize: '16px'
              }}
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                padding: '12px',
                borderRadius: '8px',
                border: 'none',
                fontSize: '16px'
              }}
            />
            
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '12px',
                borderRadius: '8px',
                border: 'none',
                background: '#4CAF50',
                color: 'white',
                fontSize: '16px',
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? 'Loading...' : (mode === 'signup' ? 'Sign Up' : 'Sign In')}
            </button>
          </form>
          
          <button
            onClick={() => setMode(mode === 'signup' ? 'signin' : 'signup')}
            style={{
              background: 'none',
              border: 'none',
              color: 'white',
              textDecoration: 'underline',
              cursor: 'pointer',
              marginTop: '15px',
              fontSize: '14px'
            }}
          >
            {mode === 'signup' ? 'Already have an account? Sign In' : 'Need an account? Sign Up'}
          </button>
          
          {message && (
            <div style={{
              marginTop: '20px',
              padding: '10px',
              background: message.includes('error') || message.includes('invalid') ? 'rgba(255,0,0,0.2)' : 'rgba(0,255,0,0.2)',
              borderRadius: '8px',
              fontSize: '14px'
            }}>
              {message}
            </div>
          )}
        </div>
      </div>
    );
  }

  // User is authenticated - show main app
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      fontFamily: 'Arial, sans-serif',
      padding: '20px'
    }}>
      <div style={{
        background: 'rgba(255,255,255,0.1)',
        padding: '30px',
        borderRadius: '15px',
        maxWidth: '800px',
        margin: '0 auto'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <h1>Welcome to BittieTasks!</h1>
          <button
            onClick={handleSignOut}
            style={{
              padding: '10px 20px',
              borderRadius: '8px',
              border: 'none',
              background: '#f44336',
              color: 'white',
              cursor: 'pointer'
            }}
          >
            Sign Out
          </button>
        </div>
        
        <div style={{
          background: 'rgba(0,255,0,0.2)',
          padding: '20px',
          borderRadius: '8px',
          marginBottom: '20px'
        }}>
          <h2>✅ Authentication Working!</h2>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>User ID:</strong> {user.id}</p>
          <p><strong>Email Verified:</strong> {user.email_confirmed_at ? 'Yes' : 'Pending'}</p>
        </div>
        
        <div style={{
          background: 'rgba(255,255,255,0.1)',
          padding: '20px',
          borderRadius: '8px'
        }}>
          <h3>Next Steps:</h3>
          <ul style={{ textAlign: 'left' }}>
            <li>✅ Supabase authentication implemented</li>
            <li>✅ Email verification working</li>
            <li>✅ User session management active</li>
            <li>🔄 Ready to implement task management</li>
            <li>🔄 Ready to implement earnings tracking</li>
            <li>🔄 Ready to implement messaging system</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default App;