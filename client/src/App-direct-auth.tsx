import { useState } from 'react';

function App() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState('Ready');
  const [loading, setLoading] = useState(false);

  const directSupabaseTest = async () => {
    setLoading(true);
    setStatus('Testing direct Supabase connection...');
    
    const url = 'https://ttgbotlcbzmmyqawnjpj.supabase.co';
    const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR0Z2JvdGxjYnptbXlxYXduanBqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ2MDA4NzksImV4cCI6MjA3MDE3Njg3OX0.jc_PZay5gUyleINrGC5d5Sd2mCkHjonP56KCLJJNM1k';
    
    try {
      console.log('Testing Supabase connection directly...');
      
      // Test basic connectivity
      const testResponse = await fetch(`${url}/rest/v1/`, {
        method: 'HEAD',
        headers: {
          'apikey': key,
          'Authorization': `Bearer ${key}`
        }
      });
      
      setStatus(`Connection test: ${testResponse.status} ${testResponse.statusText}`);
      
      if (testResponse.ok) {
        // Test auth endpoint
        const authResponse = await fetch(`${url}/auth/v1/signup`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': key,
            'Authorization': `Bearer ${key}`
          },
          body: JSON.stringify({
            email: email || 'test@example.com',
            password: password || 'password123'
          })
        });
        
        const authData = await authResponse.json();
        setStatus(`Auth test: ${authResponse.status} - ${JSON.stringify(authData)}`);
      }
      
    } catch (error: any) {
      setStatus(`Error: ${error.message}`);
      console.error('Direct test error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      padding: '20px', 
      fontFamily: 'Arial', 
      maxWidth: '600px', 
      margin: '0 auto',
      backgroundColor: '#f5f5f5',
      minHeight: '100vh'
    }}>
      <h1>Direct Supabase Authentication Test</h1>
      
      <div style={{ 
        backgroundColor: 'white', 
        padding: '20px', 
        borderRadius: '8px', 
        marginBottom: '20px',
        border: '1px solid #ddd'
      }}>
        <h2>Test Credentials</h2>
        <div style={{ marginBottom: '10px' }}>
          <label>Email:</label><br/>
          <input 
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="test@example.com"
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          />
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label>Password:</label><br/>
          <input 
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="password123"
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          />
        </div>
        <button 
          onClick={directSupabaseTest}
          disabled={loading}
          style={{
            padding: '10px 20px',
            backgroundColor: loading ? '#ccc' : '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Testing...' : 'Test Direct Connection'}
        </button>
      </div>

      <div style={{ 
        backgroundColor: 'white', 
        padding: '20px', 
        borderRadius: '8px',
        border: '1px solid #ddd'
      }}>
        <h2>Status</h2>
        <p style={{ 
          padding: '10px', 
          backgroundColor: '#f8f9fa', 
          border: '1px solid #dee2e6',
          borderRadius: '4px',
          fontFamily: 'monospace'
        }}>
          {status}
        </p>
      </div>
    </div>
  );
}

export default App;