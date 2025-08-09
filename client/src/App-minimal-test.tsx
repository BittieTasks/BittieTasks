function App() {
  const urlExists = !!import.meta.env.VITE_SUPABASE_URL;
  const keyExists = !!import.meta.env.VITE_SUPABASE_ANON_KEY;
  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
  
  console.log('MINIMAL TEST:', {
    urlExists,
    keyExists,
    url: url?.substring(0, 30) + '...',
    key: key?.substring(0, 30) + '...'
  });

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial', backgroundColor: '#f0f0f0', minHeight: '100vh' }}>
      <h1>Minimal Auth Test</h1>
      
      <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
        <h2>Environment Variables</h2>
        <p><strong>VITE_SUPABASE_URL:</strong> {urlExists ? '✅ SET' : '❌ MISSING'}</p>
        <p><strong>VITE_SUPABASE_ANON_KEY:</strong> {keyExists ? '✅ SET' : '❌ MISSING'}</p>
        {url && <p><strong>URL:</strong> {url.substring(0, 40)}...</p>}
        {key && <p><strong>Key:</strong> {key.substring(0, 40)}...</p>}
      </div>

      <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px' }}>
        <h2>Status</h2>
        {urlExists && keyExists ? (
          <p style={{ color: 'green' }}>✅ Both environment variables are available</p>
        ) : (
          <p style={{ color: 'red' }}>❌ Environment variables missing - this is why auth fails</p>
        )}
      </div>
    </div>
  );
}

export default App;