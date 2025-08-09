'use client'

export default function WelcomePage() {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <div style={{
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
          marginBottom: '32px',
          margin: '0 auto 32px auto',
          width: '80px',
          height: '80px',
          background: '#3b82f6',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '36px'
        }}>
          👥
        </div>

        <h1 style={{
          fontSize: '48px',
          fontWeight: 'bold',
          marginBottom: '24px',
          background: 'linear-gradient(to right, #3b82f6, #8b5cf6)',
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
          color: '#6b7280'
        }}>
          Turn your daily tasks into earning opportunities. Share activities with neighbors, 
          split costs, and build community while making money together.
        </p>

        <div style={{ marginBottom: '40px' }}>
          <a 
            href="/auth" 
            style={{
              background: '#3b82f6',
              color: 'white',
              padding: '16px 32px',
              borderRadius: '8px',
              fontWeight: 'bold',
              fontSize: '18px',
              marginRight: '16px',
              textDecoration: 'none',
              display: 'inline-block',
              transition: 'background-color 0.2s'
            }}
            onMouseOver={(e) => (e.target as HTMLElement).style.background = '#2563eb'}
            onMouseOut={(e) => (e.target as HTMLElement).style.background = '#3b82f6'}
          >
            Get Started Free →
          </a>
          <a 
            href="/auth" 
            style={{
              background: 'transparent',
              color: '#3b82f6',
              border: '2px solid #3b82f6',
              padding: '14px 32px',
              borderRadius: '8px',
              fontWeight: 'bold',
              fontSize: '18px',
              textDecoration: 'none',
              display: 'inline-block',
              transition: 'background-color 0.2s'
            }}
            onMouseOver={(e) => (e.target as HTMLElement).style.background = '#f3f4f6'}
            onMouseOut={(e) => (e.target as HTMLElement).style.background = 'transparent'}
          >
            Sign In
          </a>
        </div>

        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '32px',
          marginBottom: '40px',
          fontSize: '14px',
          color: '#6b7280',
          flexWrap: 'wrap'
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
            <span style={{ color: '#eab308', fontSize: '18px' }}>💰</span>
            <span>Earn $200-600/week</span>
          </div>
        </div>

        <div style={{
          padding: '32px',
          background: 'linear-gradient(to right, #f3f4f6, #e5e7eb)',
          borderRadius: '12px',
          marginBottom: '32px'
        }}>
          <h3 style={{
            fontSize: '20px',
            fontWeight: '600',
            marginBottom: '24px',
            color: '#1f2937'
          }}>
            How it Works
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '24px'
          }}>
            <div style={{
              padding: '24px',
              background: 'white',
              borderRadius: '8px'
            }}>
              <div style={{ fontSize: '24px', marginBottom: '12px' }}>1️⃣</div>
              <h4 style={{ fontWeight: '600', marginBottom: '8px', color: '#1f2937' }}>Share Tasks</h4>
              <p style={{ color: '#6b7280', fontSize: '14px' }}>
                Post daily activities like grocery runs, park visits, or errands
              </p>
            </div>
            <div style={{
              padding: '24px',
              background: 'white',
              borderRadius: '8px'
            }}>
              <div style={{ fontSize: '24px', marginBottom: '12px' }}>2️⃣</div>
              <h4 style={{ fontWeight: '600', marginBottom: '8px', color: '#1f2937' }}>Connect</h4>
              <p style={{ color: '#6b7280', fontSize: '14px' }}>
                Neighbors join and split costs, creating instant income
              </p>
            </div>
            <div style={{
              padding: '24px',
              background: 'white',
              borderRadius: '8px'
            }}>
              <div style={{ fontSize: '24px', marginBottom: '12px' }}>3️⃣</div>
              <h4 style={{ fontWeight: '600', marginBottom: '8px', color: '#1f2937' }}>Earn</h4>
              <p style={{ color: '#6b7280', fontSize: '14px' }}>
                Get paid automatically with secure payment processing
              </p>
            </div>
          </div>
        </div>

        <div style={{ fontSize: '12px', color: '#6b7280' }}>
          <p>🚀 BittieTasks is ready for registration and task sharing</p>
          <p>✅ Authentication: Ready | ✅ Payments: Configured | ✅ Subscriptions: Active</p>
        </div>
      </div>
    </div>
  )
}