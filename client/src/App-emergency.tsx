import { useState } from 'react';

function App() {
  const [status, setStatus] = useState('Checking...');
  const [details, setDetails] = useState<any>({});

  const checkEverything = () => {
    const envCheck = {
      url: import.meta.env.VITE_SUPABASE_URL,
      key: import.meta.env.VITE_SUPABASE_ANON_KEY,
      urlExists: !!import.meta.env.VITE_SUPABASE_URL,
      keyExists: !!import.meta.env.VITE_SUPABASE_ANON_KEY,
      mode: import.meta.env.MODE,
      dev: import.meta.env.DEV,
      allEnv: Object.keys(import.meta.env).filter(k => k.startsWith('VITE_'))
    };
    
    console.log('EMERGENCY DEBUG:', envCheck);
    setDetails(envCheck);
    
    if (!envCheck.urlExists) {
      setStatus('VITE_SUPABASE_URL is missing!');
    } else if (!envCheck.keyExists) {
      setStatus('VITE_SUPABASE_ANON_KEY is missing!');
    } else {
      setStatus('Environment variables are set - testing Supabase...');
      testSupabase();
    }
  };

  const testSupabase = async () => {
    try {
      const url = import.meta.env.VITE_SUPABASE_URL;
      const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      const response = await fetch(`${url}/rest/v1/`, {
        method: 'HEAD',
        headers: { 'apikey': key }
      });
      
      setStatus(`Supabase response: ${response.status} ${response.statusText}`);
      console.log('Supabase test result:', response.status, response.statusText);
    } catch (error: any) {
      setStatus(`Supabase error: ${error.message}`);
      console.error('Supabase test error:', error);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      padding: '20px',
      backgroundColor: '#1a1a1a',
      color: 'white',
      fontFamily: 'monospace'
    }}>
      <h1>Emergency Debug Mode</h1>
      <button 
        onClick={checkEverything}
        style={{
          padding: '10px 20px',
          backgroundColor: '#333',
          color: 'white',
          border: '1px solid #666',
          borderRadius: '4px',
          cursor: 'pointer',
          marginBottom: '20px'
        }}
      >
        Check Environment
      </button>
      
      <div style={{ marginBottom: '20px' }}>
        <strong>Status:</strong> {status}
      </div>
      
      <div style={{ backgroundColor: '#333', padding: '15px', borderRadius: '4px' }}>
        <h3>Environment Details:</h3>
        <pre>{JSON.stringify(details, null, 2)}</pre>
      </div>
    </div>
  );
}

export default App;