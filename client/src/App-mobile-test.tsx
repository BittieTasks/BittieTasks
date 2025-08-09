import { useState, useEffect } from 'react';

function App() {
  const [status, setStatus] = useState('Loading...');

  useEffect(() => {
    console.log('📱 Mobile test app loading...');
    setStatus('App loaded successfully!');
    
    // Test if we can detect mobile
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    console.log('📱 Is mobile device:', isMobile);
    console.log('📱 Screen width:', window.innerWidth);
    console.log('📱 User agent:', navigator.userAgent);
  }, []);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 50%, #10b981 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '30px',
        borderRadius: '12px',
        textAlign: 'center',
        maxWidth: '400px',
        width: '100%',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
      }}>
        <h1 style={{
          fontSize: '2rem',
          fontWeight: 'bold',
          marginBottom: '16px',
          color: '#1f2937'
        }}>
          BittieTasks
        </h1>
        <p style={{
          fontSize: '1.1rem',
          color: '#6b7280',
          marginBottom: '20px'
        }}>
          {status}
        </p>
        <div style={{
          padding: '15px',
          backgroundColor: '#f3f4f6',
          borderRadius: '8px',
          fontSize: '0.9rem',
          color: '#4b5563'
        }}>
          <div>Screen: {window.innerWidth}x{window.innerHeight}</div>
          <div>Time: {new Date().toLocaleTimeString()}</div>
          <div>Mobile: {/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ? 'Yes' : 'No'}</div>
        </div>
        <button 
          onClick={() => setStatus('Button clicked! App is working.')}
          style={{
            marginTop: '20px',
            padding: '12px 24px',
            backgroundColor: '#8b5cf6',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '1rem',
            cursor: 'pointer',
            width: '100%'
          }}
        >
          Test Button
        </button>
      </div>
    </div>
  );
}

export default App;