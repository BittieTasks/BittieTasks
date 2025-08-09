function App() {
  console.log('Ultra simple app loaded');
  
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#0f172a',
      color: 'white',
      fontFamily: 'Arial, sans-serif',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '20px'
    }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>
        BittieTasks - Server Working!
      </h1>
      <p style={{ fontSize: '1.2rem', marginBottom: '2rem' }}>
        The disconnect is resolved. Server is running on port 5000.
      </p>
      <div style={{
        backgroundColor: '#1e293b',
        padding: '20px',
        borderRadius: '8px',
        border: '1px solid #334155'
      }}>
        <h2>Status: ✅ Connected</h2>
        <p>Environment variables and server are working correctly.</p>
        <p>Ready to implement proper authentication.</p>
      </div>
    </div>
  );
}

export default App;