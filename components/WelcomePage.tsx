'use client'

import { useState, useEffect } from 'react'

// Interactive Earnings Calculator Component
function EarningsCalculator() {
  const [tasksPerWeek, setTasksPerWeek] = useState(3)
  const [avgTaskValue, setAvgTaskValue] = useState(35)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])
  
  const weeklyEarnings = tasksPerWeek * avgTaskValue
  const monthlyEarnings = weeklyEarnings * 4.33 // Average weeks per month
  const yearlyEarnings = monthlyEarnings * 12

  if (!mounted) {
    return (
      <div className="flex flex-col gap-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <label className="block text-white bittie-body-lg font-medium mb-3">
              Tasks per week:
            </label>
            <div className="flex items-center gap-4">
              <input 
                type="range" 
                min="1" 
                max="10" 
                value={3}
                className="flex-1 h-3 bg-white/20 rounded-lg appearance-none cursor-pointer"
                disabled
              />
              <span className="text-white text-xl font-bold min-w-8">3</span>
            </div>
          </div>
          
          <div>
            <label className="block text-white bittie-body-lg font-medium mb-3">
              Average task value:
            </label>
            <div className="flex items-center gap-4">
              <input 
                type="range" 
                min="15" 
                max="75" 
                step="5"
                value={35}
                className="flex-1 h-3 bg-white/20 rounded-lg appearance-none cursor-pointer"
                disabled
              />
              <span className="text-white text-xl font-bold min-w-12">$35</span>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8 border-t border-white/20">
          <div className="text-center p-6 bg-white/10 rounded-2xl border border-white/20 backdrop-blur-sm">
            <div className="text-3xl font-bold text-white mb-2 bittie-gradient-text">
              $105
            </div>
            <p className="text-white/80 text-lg">Per Week</p>
          </div>
          
          <div className="text-center p-6 bg-white/10 rounded-2xl border border-white/20 backdrop-blur-sm">
            <div className="text-3xl font-bold text-white mb-2 bittie-gradient-text">
              $455
            </div>
            <p className="text-white/80 text-lg">Per Month</p>
          </div>
          
          <div className="text-center p-6 bg-white/10 rounded-2xl border border-white/20 backdrop-blur-sm">
            <div className="text-3xl font-bold text-white mb-2 bittie-gradient-text">
              $5,460
            </div>
            <p className="text-white/80 text-lg">Per Year</p>
          </div>
        </div>
      </div>
    )
  }
  
  return (
    <div className="flex flex-col gap-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <label className="block text-white text-lg font-semibold mb-3">
            Tasks per week:
          </label>
          <div className="flex items-center gap-4">
            <input 
              type="range" 
              min="1" 
              max="10" 
              value={tasksPerWeek}
              onChange={(e) => setTasksPerWeek(Number(e.target.value))}
              className="flex-1 h-3 bg-white/20 rounded-lg appearance-none cursor-pointer"
            />
            <span className="text-white text-xl font-bold min-w-8">
              {tasksPerWeek}
            </span>
          </div>
        </div>
        
        <div>
          <label className="block text-white text-lg font-semibold mb-3">
            Average task value:
          </label>
          <div className="flex items-center gap-4">
            <input 
              type="range" 
              min="15" 
              max="75" 
              step="5"
              value={avgTaskValue}
              onChange={(e) => setAvgTaskValue(Number(e.target.value))}
              className="flex-1 h-3 bg-white/20 rounded-lg appearance-none cursor-pointer"
            />
            <span className="text-white text-xl font-bold min-w-12">
              ${avgTaskValue}
            </span>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8 border-t border-white/20">
        <div className="text-center p-6 bg-white/10 rounded-2xl border border-white/20 backdrop-blur-sm">
          <div className="text-3xl font-bold text-white mb-2 bittie-gradient-text">
            ${weeklyEarnings}
          </div>
          <p className="text-white/80 text-lg">Per Week</p>
        </div>
        
        <div className="text-center p-6 bg-white/10 rounded-2xl border border-white/20 backdrop-blur-sm">
          <div className="text-3xl font-bold text-white mb-2 bittie-gradient-text">
            ${monthlyEarnings.toFixed(0)}
          </div>
          <p className="text-white/80 text-lg">Per Month</p>
        </div>
        
        <div className="text-center p-6 bg-white/10 rounded-2xl border border-white/20 backdrop-blur-sm">
          <div className="text-3xl font-bold text-white mb-2 bittie-gradient-text">
            ${yearlyEarnings.toFixed(0)}
          </div>
          <p className="text-white/80 text-lg">Per Year</p>
        </div>
      </div>
    </div>
  )
}

export default function WelcomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-500 via-blue-500 to-green-600 relative overflow-hidden font-sans">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-purple-500/30 blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-blue-500/30 blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-green-500/20 blur-3xl"></div>
      </div>

      {/* Navigation */}
      <nav className="relative z-10 p-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-gradient-to-br from-green-500 via-blue-500 to-purple-600 shadow-2xl">
              <span className="text-white font-bold text-xl">B</span>
            </div>
            <span className="text-white text-3xl font-bold tracking-tight">
              BittieTasks
            </span>
          </div>
          <a 
            href="/auth"
            className="text-gray-800 px-8 py-3 rounded-full font-semibold bg-white/90 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 hover:scale-105"
          >
            Sign In
          </a>
        </div>
      </nav>

      {/* Hero Section */}
      <div style={{ position: 'relative', zIndex: 10, padding: '80px 24px 128px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '12px',
            color: '#6ee7b7',
            padding: '12px 24px',
            borderRadius: '9999px',
            fontSize: '14px',
            fontWeight: '500',
            marginBottom: '40px',
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(59, 130, 246, 0.2))',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(16, 185, 129, 0.3)'
          }}>
            <span style={{ fontSize: '18px' }}>🚀</span>
            <span style={{ fontWeight: '600' }}>Now live in your community</span>
          </div>
          
          <h1 style={{ 
            fontSize: 'clamp(3rem, 8vw, 6rem)', 
            fontWeight: 'bold', 
            color: 'white', 
            marginBottom: '32px', 
            lineHeight: '1.1', 
            textAlign: 'center' 
          }}>
            Turn Daily Tasks Into
            <span style={{
              display: 'block',
              marginTop: '8px',
              fontSize: 'inherit',
              fontWeight: 'inherit',
              background: 'linear-gradient(135deg, #10b981, #3b82f6, #059669)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              Real Income
            </span>
          </h1>
          
          <p style={{ 
            fontSize: '24px', 
            color: '#d1d5db', 
            marginBottom: '64px', 
            maxWidth: '768px', 
            margin: '0 auto 64px', 
            lineHeight: '1.6', 
            fontWeight: '300' 
          }}>
            Join thousands of parents earning money by sharing everyday activities. From school pickups to grocery runs - your routine is your revenue.
          </p>

          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '24px', 
            justifyContent: 'center', 
            alignItems: 'center', 
            marginBottom: '80px' 
          }}>
            <a
              href="/auth"
              style={{
                color: 'white',
                padding: '20px 40px',
                borderRadius: '16px',
                fontWeight: '600',
                fontSize: '20px',
                textDecoration: 'none',
                display: 'inline-block',
                background: 'linear-gradient(135deg, #10b981, #3b82f6, #8b5cf6)',
                boxShadow: '0 15px 35px rgba(0, 0, 0, 0.2)',
                transition: 'all 0.3s ease',
                animation: 'pulse 2s infinite'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px) scale(1.02)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0) scale(1)'
              }}
            >
              Start Earning Today
            </a>
            <button style={{
              color: 'white',
              padding: '20px 40px',
              borderRadius: '16px',
              fontWeight: '600',
              fontSize: '20px',
              border: '2px solid rgba(255, 255, 255, 0.3)',
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(12px)',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px) scale(1.02)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0) scale(1)'
            }}>
              Watch Demo
            </button>
          </div>

          {/* Trust Indicators */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '48px', maxWidth: '512px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
                background: 'linear-gradient(135deg, #34d399, #10b981)',
                boxShadow: '0 8px 25px rgba(16, 185, 129, 0.3)'
              }}>
                <span style={{ fontSize: '28px' }}>🔒</span>
              </div>
              <p style={{ fontSize: '18px', fontWeight: '600', color: 'white' }}>Bank-level Security</p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
                background: 'linear-gradient(135deg, #60a5fa, #3b82f6)',
                boxShadow: '0 8px 25px rgba(59, 130, 246, 0.3)'
              }}>
                <span style={{ fontSize: '28px' }}>✅</span>
              </div>
              <p style={{ fontSize: '18px', fontWeight: '600', color: 'white' }}>Verified Community</p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
                background: 'linear-gradient(135deg, #c084fc, #8b5cf6)',
                boxShadow: '0 8px 25px rgba(139, 92, 246, 0.3)'
              }}>
                <span style={{ fontSize: '28px' }}>⚡</span>
              </div>
              <p style={{ fontSize: '18px', fontWeight: '600', color: 'white' }}>Instant Payouts</p>
            </div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div style={{ position: 'relative', zIndex: 10, padding: '0 24px 128px' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '80px' }}>
            <h2 style={{
              fontSize: 'clamp(3rem, 6vw, 4rem)',
              fontWeight: 'bold',
              color: 'white',
              marginBottom: '24px',
              background: 'linear-gradient(135deg, #60a5fa, #c084fc, #34d399)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              How It Works
            </h2>
            <p style={{ fontSize: '20px', color: '#d1d5db', maxWidth: '768px', margin: '0 auto', lineHeight: '1.6' }}>
              Simple steps to start earning from your daily routine
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '40px' }}>
            <div style={{
              textAlign: 'center',
              padding: '40px',
              borderRadius: '24px',
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-8px) scale(1.02)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0) scale(1)'
            }}>
              <div style={{
                width: '80px',
                height: '80px',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 32px',
                background: 'linear-gradient(135deg, #10b981, #06b6d4)',
                boxShadow: '0 15px 35px rgba(16, 185, 129, 0.4)',
                transition: 'transform 0.3s ease'
              }}>
                <span style={{ fontSize: '32px' }}>📅</span>
              </div>
              <h3 style={{ fontSize: '24px', fontWeight: 'bold', color: 'white', marginBottom: '24px' }}>
                Share Your Schedule
              </h3>
              <p style={{ color: '#d1d5db', fontSize: '18px', lineHeight: '1.6' }}>
                Post your daily activities and let neighbors join you. Playground trips, errands, school events.
              </p>
            </div>

            <div style={{
              textAlign: 'center',
              padding: '40px',
              borderRadius: '24px',
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-8px) scale(1.02)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0) scale(1)'
            }}>
              <div style={{
                width: '80px',
                height: '80px',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 32px',
                background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
                boxShadow: '0 15px 35px rgba(59, 130, 246, 0.4)',
                transition: 'transform 0.3s ease'
              }}>
                <span style={{ fontSize: '32px' }}>👥</span>
              </div>
              <h3 style={{ fontSize: '24px', fontWeight: 'bold', color: 'white', marginBottom: '24px' }}>
                Build Community
              </h3>
              <p style={{ color: '#d1d5db', fontSize: '18px', lineHeight: '1.6' }}>
                Connect with local families. Create lasting friendships while helping other parents save time.
              </p>
            </div>

            <div style={{
              textAlign: 'center',
              padding: '40px',
              borderRadius: '24px',
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-8px) scale(1.02)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0) scale(1)'
            }}>
              <div style={{
                width: '80px',
                height: '80px',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 32px',
                background: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
                boxShadow: '0 15px 35px rgba(139, 92, 246, 0.4)',
                transition: 'transform 0.3s ease'
              }}>
                <span style={{ fontSize: '32px' }}>💰</span>
              </div>
              <h3 style={{ fontSize: '24px', fontWeight: 'bold', color: 'white', marginBottom: '24px' }}>
                Earn Instantly
              </h3>
              <p style={{ color: '#d1d5db', fontSize: '18px', lineHeight: '1.6' }}>
                Get paid immediately when tasks complete. Track earnings and grow your income effortlessly.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Earnings Calculator */}
      <div style={{ position: 'relative', zIndex: 10, padding: '0 24px 64px' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <div style={{
            padding: '48px',
            borderRadius: '24px',
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(59, 130, 246, 0.2), rgba(139, 92, 246, 0.2))',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            backdropFilter: 'blur(12px)'
          }}>
            <h3 style={{ fontSize: '32px', fontWeight: 'bold', color: 'white', textAlign: 'center', marginBottom: '32px' }}>
              Calculate Your Potential Earnings
            </h3>
            <EarningsCalculator />
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div style={{ position: 'relative', zIndex: 10, padding: '0 24px 128px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{
            padding: '64px',
            textAlign: 'center',
            borderRadius: '24px',
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(59, 130, 246, 0.2), rgba(139, 92, 246, 0.2))',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            backdropFilter: 'blur(12px)'
          }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '48px' }}>
              <div style={{ transition: 'transform 0.3s ease' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.1)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)'
                }}>
                <div style={{
                  fontSize: '48px',
                  fontWeight: 'bold',
                  marginBottom: '16px',
                  background: 'linear-gradient(135deg, #60a5fa, #c084fc, #34d399)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}>
                  $150+
                </div>
                <p style={{ color: 'white', fontSize: '18px', fontWeight: '600' }}>Average monthly earnings</p>
              </div>
              <div style={{ transition: 'transform 0.3s ease' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.1)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)'
                }}>
                <div style={{
                  fontSize: '48px',
                  fontWeight: 'bold',
                  marginBottom: '16px',
                  background: 'linear-gradient(135deg, #60a5fa, #c084fc, #34d399)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}>
                  2,500+
                </div>
                <p style={{ color: 'white', fontSize: '18px', fontWeight: '600' }}>Active families</p>
              </div>
              <div style={{ transition: 'transform 0.3s ease' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.1)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)'
                }}>
                <div style={{
                  fontSize: '48px',
                  fontWeight: 'bold',
                  marginBottom: '16px',
                  background: 'linear-gradient(135deg, #60a5fa, #c084fc, #34d399)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}>
                  98%
                </div>
                <p style={{ color: 'white', fontSize: '18px', fontWeight: '600' }}>Satisfaction rate</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div style={{ position: 'relative', zIndex: 10, padding: '0 24px 80px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{
            fontSize: 'clamp(3rem, 6vw, 4rem)',
            fontWeight: 'bold',
            color: 'white',
            marginBottom: '32px',
            background: 'linear-gradient(135deg, #60a5fa, #c084fc, #34d399)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            Ready to Start Earning?
          </h2>
          <p style={{ 
            fontSize: '20px', 
            color: '#d1d5db', 
            marginBottom: '48px', 
            maxWidth: '768px', 
            margin: '0 auto 48px', 
            lineHeight: '1.6' 
          }}>
            Join thousands of parents already earning from their daily routines. Setup takes less than 2 minutes.
          </p>
          <a
            href="/auth"
            style={{
              color: 'white',
              padding: '24px 48px',
              borderRadius: '16px',
              fontWeight: 'bold',
              fontSize: '20px',
              textDecoration: 'none',
              display: 'inline-block',
              background: 'linear-gradient(135deg, #10b981, #3b82f6, #8b5cf6)',
              boxShadow: '0 15px 35px rgba(0, 0, 0, 0.2)',
              transition: 'all 0.3s ease',
              animation: 'pulse 2s infinite'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px) scale(1.05)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0) scale(1)'
            }}
          >
            Create Free Account
          </a>
        </div>
      </div>

      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.8; }
        }
        
        input[type="range"]::-webkit-slider-thumb {
          appearance: none;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: linear-gradient(135deg, #10b981, #3b82f6);
          cursor: pointer;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
          border: 2px solid white;
        }
        
        input[type="range"]::-moz-range-thumb {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: linear-gradient(135deg, #10b981, #3b82f6);
          cursor: pointer;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
          border: 2px solid white;
        }
      `}</style>
    </div>
  )
}