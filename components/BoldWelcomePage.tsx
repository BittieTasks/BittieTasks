'use client'

export default function BoldWelcomePage() {
  const handleSignUp = () => {
    window.location.href = '/signup'
  }

  const handleLogin = () => {
    window.location.href = '/login' 
  }

  const handleViewTasks = () => {
    window.location.href = '/platform'
  }

  return (
    <div 
      style={{
        background: 'linear-gradient(to bottom right, rgb(88, 28, 135), rgb(30, 58, 138), rgb(49, 46, 129))',
        minHeight: '100vh',
        color: 'white',
        overflowX: 'hidden'
      }}
    >
      {/* Animated Background Elements */}
      <div style={{ position: 'fixed', inset: '0', overflow: 'hidden', pointerEvents: 'none' }}>
        <div 
          style={{
            position: 'absolute',
            top: '-160px',
            right: '-160px',
            width: '320px',
            height: '320px',
            background: 'linear-gradient(to bottom right, rgb(236, 72, 153), rgb(244, 63, 94))',
            borderRadius: '50%',
            mixBlendMode: 'multiply',
            filter: 'blur(40px)',
            opacity: '0.7',
            animation: 'blob 7s infinite'
          }}
        />
        <div 
          style={{
            position: 'absolute',
            bottom: '-160px',
            left: '-160px',
            width: '320px',
            height: '320px',
            background: 'linear-gradient(to bottom right, rgb(250, 204, 21), rgb(251, 146, 60))',
            borderRadius: '50%',
            mixBlendMode: 'multiply',
            filter: 'blur(40px)',
            opacity: '0.7',
            animation: 'blob 7s infinite 2s'
          }}
        />
        <div 
          style={{
            position: 'absolute',
            top: '160px',
            left: '50%',
            width: '320px',
            height: '320px',
            background: 'linear-gradient(to bottom right, rgb(74, 222, 128), rgb(59, 130, 246))',
            borderRadius: '50%',
            mixBlendMode: 'multiply',
            filter: 'blur(40px)',
            opacity: '0.7',
            animation: 'blob 7s infinite 4s'
          }}
        />
      </div>

      <style jsx>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
      `}</style>

      {/* Header */}
      <header style={{ position: 'relative', zIndex: '10', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(10px)', background: 'rgba(255, 255, 255, 0.05)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 16px' }}>
          <div style={{ padding: '12px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 'fit-content' }}>
              <div 
                style={{
                  width: '40px',
                  height: '40px',
                  background: 'linear-gradient(to right, rgb(236, 72, 153), rgb(139, 92, 246))',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                  transform: 'rotate(3deg)',
                  transition: 'transform 0.3s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'rotate(0deg)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'rotate(3deg)'}
              >
                <span style={{ color: 'white', fontWeight: 'bold', fontSize: '18px' }}>B</span>
              </div>
              <span style={{ fontSize: '20px', fontWeight: 'bold', background: 'linear-gradient(to right, rgb(244, 114, 182), rgb(196, 181, 253))', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}>BittieTasks</span>
            </div>
            <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
              <button
                onClick={handleLogin}
                style={{
                  border: '2px solid rgba(255, 255, 255, 0.3)',
                  color: 'white',
                  background: 'transparent',
                  padding: '6px 12px',
                  borderRadius: '8px',
                  fontWeight: '600',
                  fontSize: '14px',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer',
                  backdropFilter: 'blur(10px)',
                  whiteSpace: 'nowrap'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                Log In
              </button>
              <button 
                onClick={handleSignUp}
                style={{
                  background: 'linear-gradient(to right, rgb(236, 72, 153), rgb(139, 92, 246))',
                  color: 'white',
                  fontWeight: '600',
                  padding: '8px 24px',
                  borderRadius: '8px',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                  transform: 'scale(1)',
                  transition: 'all 0.3s ease',
                  border: 'none',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.opacity = '0.9'
                  e.currentTarget.style.transform = 'scale(1.05)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = '1'
                  e.currentTarget.style.transform = 'scale(1)'
                }}
              >
                Sign Up
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main style={{ position: 'relative', zIndex: '10' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 16px' }}>
          <div style={{ paddingTop: '40px', paddingBottom: '60px', textAlign: 'center' }}>
            <h1 style={{ 
              fontSize: 'clamp(28px, 8vw, 56px)', 
              fontWeight: 'bold', 
              marginBottom: '20px', 
              lineHeight: '1.1',
              padding: '0 8px'
            }}>
              Turn Daily Tasks Into 
              <span style={{ background: 'linear-gradient(to right, rgb(244, 114, 182), rgb(196, 181, 253))', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent', display: 'block' }}>
                Earning Opportunities
              </span>
            </h1>
            <p style={{ 
              fontSize: 'clamp(16px, 4vw, 20px)', 
              marginBottom: '32px', 
              color: 'rgba(255, 255, 255, 0.8)', 
              maxWidth: '600px', 
              margin: '0 auto 32px auto',
              padding: '0 16px',
              lineHeight: '1.5'
            }}>
              Join the community marketplace where parents share tasks, split costs, and earn money together. Transform routine activities into income streams.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap', padding: '0 16px' }}>
              <button
                onClick={handleSignUp}
                style={{
                  background: 'linear-gradient(to right, rgb(236, 72, 153), rgb(139, 92, 246))',
                  color: 'white',
                  fontWeight: '600',
                  fontSize: 'clamp(14px, 3vw, 18px)',
                  padding: 'clamp(12px, 3vw, 16px) clamp(24px, 6vw, 32px)',
                  borderRadius: '12px',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                  transform: 'scale(1)',
                  transition: 'all 0.3s ease',
                  border: 'none',
                  cursor: 'pointer',
                  minWidth: 'fit-content',
                  whiteSpace: 'nowrap'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.opacity = '0.9'
                  e.currentTarget.style.transform = 'scale(1.05)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = '1'
                  e.currentTarget.style.transform = 'scale(1)'
                }}
              >
                Start Earning Today
              </button>
              <button
                onClick={handleViewTasks}
                style={{
                  border: '2px solid rgba(255, 255, 255, 0.3)',
                  color: 'white',
                  background: 'rgba(255, 255, 255, 0.1)',
                  padding: 'clamp(12px, 3vw, 16px) clamp(24px, 6vw, 32px)',
                  borderRadius: '12px',
                  fontWeight: '600',
                  fontSize: 'clamp(14px, 3vw, 18px)',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer',
                  backdropFilter: 'blur(10px)',
                  minWidth: 'fit-content',
                  whiteSpace: 'nowrap'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
              >
                Browse Tasks
              </button>
            </div>
          </div>

          {/* Features Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '60px', padding: '0 8px' }}>
            {[
              {
                title: 'Community Tasks',
                description: 'Share grocery runs, school pickups, and errands with neighbors. Split costs and earn money.',
                icon: '🏘️'
              },
              {
                title: 'Solo Earnings',
                description: 'Complete tasks independently and keep 100% of earnings. From tutoring to pet care.',
                icon: '💪'
              },
              {
                title: 'Instant Payments',
                description: 'Get paid immediately after task completion. Secure payment processing included.',
                icon: '💰'
              }
            ].map((feature, index) => (
              <div 
                key={index}
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '16px',
                  padding: 'clamp(20px, 5vw, 32px)',
                  textAlign: 'center',
                  transform: 'translateY(0)',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-8px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <div style={{ fontSize: 'clamp(32px, 8vw, 48px)', marginBottom: '12px' }}>{feature.icon}</div>
                <h3 style={{ fontSize: 'clamp(18px, 4vw, 24px)', fontWeight: 'bold', marginBottom: '12px', color: 'white' }}>{feature.title}</h3>
                <p style={{ color: 'rgba(255, 255, 255, 0.8)', lineHeight: '1.6', fontSize: 'clamp(14px, 3vw, 16px)' }}>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}