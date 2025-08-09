import { useState } from 'react';

export default function SimpleTest() {
  const [count, setCount] = useState(0);

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ color: '#2563eb', marginBottom: '20px' }}>
        🎉 BittieTasks is Working!
      </h1>
      
      <p style={{ fontSize: '18px', marginBottom: '20px' }}>
        If you can see this page, React is rendering correctly.
      </p>
      
      <div style={{ marginBottom: '20px' }}>
        <p>Interactive test - Count: {count}</p>
        <button 
          onClick={() => setCount(count + 1)}
          style={{ 
            padding: '10px 20px', 
            backgroundColor: '#2563eb', 
            color: 'white', 
            border: 'none', 
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Click me! (+1)
        </button>
      </div>
      
      <div style={{ backgroundColor: '#f0f9ff', padding: '15px', borderRadius: '8px' }}>
        <h3>Next Steps:</h3>
        <ul>
          <li>✅ React is working</li>
          <li>✅ JavaScript is enabled</li>
          <li>✅ Vite development server is running</li>
          <li>🔄 Ready to test the full application</li>
        </ul>
        
        <div style={{ marginTop: '15px' }}>
          <a 
            href="/registration" 
            style={{ 
              color: '#2563eb', 
              textDecoration: 'none',
              fontWeight: 'bold'
            }}
          >
            → Test Registration Flow
          </a>
        </div>
      </div>
    </div>
  );
}