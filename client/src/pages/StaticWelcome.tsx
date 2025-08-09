export default function StaticWelcome() {
  return (
    <div className="gradient-bg" style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <div className="welcome-card" style={{
        maxWidth: '800px',
        margin: '0 auto',
        background: 'rgba(255, 255, 255, 0.95)',
        borderRadius: '16px',
        padding: '40px',
        color: '#333',
        textAlign: 'center',
        boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
      }}>
        <div style={{ 
          width: '80px', 
          height: '80px', 
          background: '#3b82f6', 
          borderRadius: '50%', 
          margin: '0 auto 30px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '32px'
        }}>
          👥
        </div>

        <h1 style={{ 
          fontSize: '48px', 
          marginBottom: '20px',
          background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>
          Welcome to BittieTasks
        </h1>

        <p style={{ 
          fontSize: '20px', 
          lineHeight: '1.6', 
          marginBottom: '40px',
          color: '#666'
        }}>
          Turn your daily tasks into earning opportunities. Share activities with neighbors, 
          split costs, and build community while making money together.
        </p>

        <div style={{ marginBottom: '40px' }}>
          <a 
            href="/registration" 
            style={{
              background: '#3b82f6',
              color: 'white',
              padding: '16px 32px',
              borderRadius: '8px',
              border: 'none',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer',
              margin: '0 10px',
              textDecoration: 'none',
              display: 'inline-block',
              transition: 'all 0.2s'
            }}
          >
            Get Started Free →
          </a>
          <a 
            href="/auth" 
            style={{
              background: 'transparent',
              color: '#3b82f6',
              border: '2px solid #3b82f6',
              padding: '16px 32px',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer',
              margin: '0 10px',
              textDecoration: 'none',
              display: 'inline-block',
              transition: 'all 0.2s'
            }}
          >
            Sign In
          </a>
        </div>

        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          gap: '30px',
          flexWrap: 'wrap',
          fontSize: '14px',
          color: '#666',
          marginBottom: '40px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: '#10b981', fontSize: '18px' }}>✓</span>
            <span>Free to start</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: '#3b82f6', fontSize: '18px' }}>🛡️</span>
            <span>Secure payments</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: '#f59e0b', fontSize: '18px' }}>💰</span>
            <span>Earn $200-600/week</span>
          </div>
        </div>

        <div style={{ 
          padding: '30px',
          background: 'linear-gradient(135deg, #f3f4f6, #e5e7eb)',
          borderRadius: '12px',
          marginBottom: '30px'
        }}>
          <h3 style={{ marginBottom: '20px', color: '#374151' }}>How it Works</h3>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '20px',
            textAlign: 'left'
          }}>
            <div style={{ padding: '20px', background: 'white', borderRadius: '8px' }}>
              <div style={{ fontSize: '24px', marginBottom: '10px' }}>1️⃣</div>
              <h4 style={{ marginBottom: '8px', color: '#374151' }}>Share Tasks</h4>
              <p style={{ color: '#6b7280', fontSize: '14px' }}>
                Post daily activities like grocery runs, park visits, or errands
              </p>
            </div>
            <div style={{ padding: '20px', background: 'white', borderRadius: '8px' }}>
              <div style={{ fontSize: '24px', marginBottom: '10px' }}>2️⃣</div>
              <h4 style={{ marginBottom: '8px', color: '#374151' }}>Connect</h4>
              <p style={{ color: '#6b7280', fontSize: '14px' }}>
                Neighbors join and split costs, creating instant income
              </p>
            </div>
            <div style={{ padding: '20px', background: 'white', borderRadius: '8px' }}>
              <div style={{ fontSize: '24px', marginBottom: '10px' }}>3️⃣</div>
              <h4 style={{ marginBottom: '8px', color: '#374151' }}>Earn</h4>
              <p style={{ color: '#6b7280', fontSize: '14px' }}>
                Get paid automatically with secure payment processing
              </p>
            </div>
          </div>
        </div>

        <div style={{ 
          fontSize: '12px',
          color: '#9ca3af'
        }}>
          <p>🚀 BittieTasks is ready for registration and task sharing</p>
          <p>✅ Authentication: Ready | ✅ Payments: Configured | ✅ Subscriptions: Active</p>
        </div>
      </div>
    </div>
  );
}