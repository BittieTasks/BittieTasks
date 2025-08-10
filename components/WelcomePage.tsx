'use client'

import { useState } from 'react'

// Interactive Earnings Calculator Component
function EarningsCalculator() {
  const [tasksPerWeek, setTasksPerWeek] = useState(3)
  const [avgTaskValue, setAvgTaskValue] = useState(35)
  
  const weeklyEarnings = tasksPerWeek * avgTaskValue
  const monthlyEarnings = weeklyEarnings * 4.33 // Average weeks per month
  const yearlyEarnings = monthlyEarnings * 12
  
  return (
    <div className="space-y-8">
      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <label className="block text-white text-lg font-semibold mb-3">Tasks per week:</label>
          <div className="flex items-center space-x-4">
            <input 
              type="range" 
              min="1" 
              max="10" 
              value={tasksPerWeek}
              onChange={(e) => setTasksPerWeek(Number(e.target.value))}
              className="flex-1 h-3 bg-white/20 rounded-lg appearance-none cursor-pointer"
              style={{
                background: 'rgba(255, 255, 255, 0.2)',
                borderRadius: '8px',
                height: '12px'
              }}
            />
            <span className="text-white text-xl font-bold w-8">{tasksPerWeek}</span>
          </div>
        </div>
        <div>
          <label className="block text-white text-lg font-semibold mb-3">Average task value:</label>
          <div className="flex items-center space-x-4">
            <input 
              type="range" 
              min="15" 
              max="75" 
              step="5"
              value={avgTaskValue}
              onChange={(e) => setAvgTaskValue(Number(e.target.value))}
              className="flex-1 h-3 bg-white/20 rounded-lg appearance-none cursor-pointer"
              style={{
                background: 'rgba(255, 255, 255, 0.2)',
                borderRadius: '8px',
                height: '12px'
              }}
            />
            <span className="text-white text-xl font-bold w-12">${avgTaskValue}</span>
          </div>
        </div>
      </div>
      
      <div className="grid md:grid-cols-3 gap-6 pt-8 border-t border-white/20">
        <div className="text-center p-6 bg-white/10 rounded-2xl border border-white/20" style={{ backdropFilter: 'blur(12px)' }}>
          <div className="text-3xl font-bold text-white mb-2" style={{
            background: 'linear-gradient(135deg, #60a5fa, #c084fc, #34d399)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>${weeklyEarnings}</div>
          <p className="text-white/80 text-lg">Per Week</p>
        </div>
        <div className="text-center p-6 bg-white/10 rounded-2xl border border-white/20" style={{ backdropFilter: 'blur(12px)' }}>
          <div className="text-3xl font-bold text-white mb-2" style={{
            background: 'linear-gradient(135deg, #60a5fa, #c084fc, #34d399)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>${monthlyEarnings.toFixed(0)}</div>
          <p className="text-white/80 text-lg">Per Month</p>
        </div>
        <div className="text-center p-6 bg-white/10 rounded-2xl border border-white/20" style={{ backdropFilter: 'blur(12px)' }}>
          <div className="text-3xl font-bold text-white mb-2" style={{
            background: 'linear-gradient(135deg, #60a5fa, #c084fc, #34d399)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>${yearlyEarnings.toFixed(0)}</div>
          <p className="text-white/80 text-lg">Per Year</p>
        </div>
      </div>
    </div>
  )
}

export default function WelcomePage() {
  return (
    <div 
      className="min-h-screen relative overflow-hidden" 
      style={{
        background: 'linear-gradient(135deg, #1e40af 0%, #7c3aed 50%, #059669 100%)',
        minHeight: '100vh'
      }}
    >
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div 
          className="absolute w-80 h-80 rounded-full"
          style={{
            top: '-160px',
            right: '-160px',
            background: 'rgba(147, 51, 234, 0.2)',
            filter: 'blur(80px)'
          }}
        ></div>
        <div 
          className="absolute w-80 h-80 rounded-full"
          style={{
            bottom: '-160px',
            left: '-160px',
            background: 'rgba(59, 130, 246, 0.2)',
            filter: 'blur(80px)'
          }}
        ></div>
        <div 
          className="absolute w-96 h-96 rounded-full"
          style={{
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            background: 'rgba(34, 197, 94, 0.1)',
            filter: 'blur(80px)'
          }}
        ></div>
      </div>

      {/* Navigation */}
      <nav className="relative z-10 px-6 py-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div 
              className="w-12 h-12 rounded-2xl flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, #10b981, #3b82f6, #8b5cf6)',
                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)'
              }}
            >
              <span className="text-white font-bold text-xl">B</span>
            </div>
            <span className="text-white text-2xl font-bold tracking-tight">BittieTasks</span>
          </div>
          <a 
            href="/auth"
            className="text-gray-900 px-8 py-3 rounded-full font-semibold hover:scale-105 transition-all"
            style={{
              background: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(12px)',
              boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)'
            }}
          >
            Sign In
          </a>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative z-10 px-6 pt-20 pb-32">
        <div className="max-w-5xl mx-auto text-center">
          <div 
            className="inline-flex items-center space-x-3 text-emerald-300 px-6 py-3 rounded-full text-sm font-medium mb-10"
            style={{
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(59, 130, 246, 0.2))',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(16, 185, 129, 0.3)'
            }}
          >
            <span className="text-lg">🚀</span>
            <span className="font-semibold">Now live in your community</span>
          </div>
          
          <h1 className="text-6xl md:text-8xl font-bold text-white mb-8 leading-tight">
            Turn Daily Tasks Into
            <span 
              className="block mt-2" 
              style={{
                background: 'linear-gradient(135deg, #60a5fa, #c084fc, #34d399)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                fontSize: 'inherit',
                fontWeight: 'inherit'
              }}
            >
              Real Income
            </span>
          </h1>
          
          <p className="text-2xl text-gray-200 mb-16 max-w-3xl mx-auto leading-relaxed font-light">
            Join thousands of parents earning money by sharing everyday activities. From school pickups to grocery runs - your routine is your revenue.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-20">
            <a
              href="/auth"
              className="text-white px-10 py-5 rounded-2xl font-semibold text-xl transition-all transform hover:scale-105"
              style={{
                background: 'linear-gradient(135deg, #10b981, #3b82f6, #8b5cf6)',
                boxShadow: '0 15px 35px rgba(0, 0, 0, 0.2)',
                animation: 'pulse 2s infinite'
              }}
            >
              Start Earning Today
            </a>
            <button 
              className="text-white px-10 py-5 rounded-2xl font-semibold text-xl transition-all transform hover:scale-105"
              style={{
                border: '2px solid rgba(255, 255, 255, 0.3)',
                backdropFilter: 'blur(12px)',
                background: 'rgba(255, 255, 255, 0.1)'
              }}
            >
              Watch Demo
            </button>
          </div>

          {/* Trust Indicators */}
          <div className="grid grid-cols-3 gap-12 max-w-2xl mx-auto">
            <div className="text-center">
              <div 
                className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                style={{
                  background: 'linear-gradient(135deg, #34d399, #10b981)',
                  boxShadow: '0 8px 25px rgba(16, 185, 129, 0.3)'
                }}
              >
                <span className="text-3xl">🔒</span>
              </div>
              <p className="text-lg font-semibold text-white">Bank-level Security</p>
            </div>
            <div className="text-center">
              <div 
                className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                style={{
                  background: 'linear-gradient(135deg, #60a5fa, #3b82f6)',
                  boxShadow: '0 8px 25px rgba(59, 130, 246, 0.3)'
                }}
              >
                <span className="text-3xl">✅</span>
              </div>
              <p className="text-lg font-semibold text-white">Verified Community</p>
            </div>
            <div className="text-center">
              <div 
                className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                style={{
                  background: 'linear-gradient(135deg, #c084fc, #8b5cf6)',
                  boxShadow: '0 8px 25px rgba(139, 92, 246, 0.3)'
                }}
              >
                <span className="text-3xl">⚡</span>
              </div>
              <p className="text-lg font-semibold text-white">Instant Payouts</p>
            </div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="relative z-10 px-6 pb-32">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 
              className="text-5xl md:text-6xl font-bold text-white mb-6" 
              style={{
                background: 'linear-gradient(135deg, #60a5fa, #c084fc, #34d399)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}
            >
              How It Works
            </h2>
            <p className="text-xl text-gray-200 max-w-3xl mx-auto leading-relaxed">
              Simple steps to start earning from your daily routine
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-10">
            <div 
              className="group text-center p-10 rounded-3xl transition-all duration-300 hover:scale-105"
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255, 255, 255, 0.2)'
              }}
            >
              <div 
                className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-8 group-hover:scale-110 transition-transform duration-300"
                style={{
                  background: 'linear-gradient(135deg, #10b981, #06b6d4)',
                  boxShadow: '0 15px 35px rgba(16, 185, 129, 0.4)'
                }}
              >
                <span className="text-3xl">📅</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-6">Share Your Schedule</h3>
              <p className="text-gray-200 text-lg leading-relaxed">
                Post your daily activities and let neighbors join you. Playground trips, errands, school events.
              </p>
            </div>

            <div 
              className="group text-center p-10 rounded-3xl transition-all duration-300 hover:scale-105"
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255, 255, 255, 0.2)'
              }}
            >
              <div 
                className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-8 group-hover:scale-110 transition-transform duration-300"
                style={{
                  background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
                  boxShadow: '0 15px 35px rgba(59, 130, 246, 0.4)'
                }}
              >
                <span className="text-3xl">👥</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-6">Build Community</h3>
              <p className="text-gray-200 text-lg leading-relaxed">
                Connect with local families. Create lasting friendships while helping other parents save time.
              </p>
            </div>

            <div 
              className="group text-center p-10 rounded-3xl transition-all duration-300 hover:scale-105"
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255, 255, 255, 0.2)'
              }}
            >
              <div 
                className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-8 group-hover:scale-110 transition-transform duration-300"
                style={{
                  background: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
                  boxShadow: '0 15px 35px rgba(139, 92, 246, 0.4)'
                }}
              >
                <span className="text-3xl">💰</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-6">Earn Instantly</h3>
              <p className="text-gray-200 text-lg leading-relaxed">
                Get paid immediately when tasks complete. Track earnings and grow your income effortlessly.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Earnings Calculator */}
      <div className="relative z-10 px-6 pb-16">
        <div className="max-w-4xl mx-auto">
          <div 
            className="p-12 rounded-3xl"
            style={{
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(59, 130, 246, 0.2), rgba(139, 92, 246, 0.2))',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              backdropFilter: 'blur(12px)'
            }}
          >
            <h3 className="text-3xl font-bold text-white text-center mb-8">Calculate Your Potential Earnings</h3>
            <EarningsCalculator />
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="relative z-10 px-6 pb-32">
        <div className="max-w-6xl mx-auto">
          <div 
            className="p-16 text-center rounded-3xl"
            style={{
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(59, 130, 246, 0.2), rgba(139, 92, 246, 0.2))',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              backdropFilter: 'blur(12px)'
            }}
          >
            <div className="grid md:grid-cols-3 gap-12">
              <div className="group">
                <div 
                  className="text-5xl font-bold mb-4 group-hover:scale-110 transition-transform duration-300" 
                  style={{
                    background: 'linear-gradient(135deg, #60a5fa, #c084fc, #34d399)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text'
                  }}
                >
                  $150+
                </div>
                <p className="text-white text-lg font-semibold">Average monthly earnings</p>
              </div>
              <div className="group">
                <div 
                  className="text-5xl font-bold mb-4 group-hover:scale-110 transition-transform duration-300" 
                  style={{
                    background: 'linear-gradient(135deg, #60a5fa, #c084fc, #34d399)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text'
                  }}
                >
                  2,500+
                </div>
                <p className="text-white text-lg font-semibold">Active families</p>
              </div>
              <div className="group">
                <div 
                  className="text-5xl font-bold mb-4 group-hover:scale-110 transition-transform duration-300" 
                  style={{
                    background: 'linear-gradient(135deg, #60a5fa, #c084fc, #34d399)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text'
                  }}
                >
                  98%
                </div>
                <p className="text-white text-lg font-semibold">Satisfaction rate</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="relative z-10 px-6 pb-20">
        <div className="max-w-5xl mx-auto text-center">
          <h2 
            className="text-5xl md:text-6xl font-bold text-white mb-8" 
            style={{
              background: 'linear-gradient(135deg, #60a5fa, #c084fc, #34d399)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}
          >
            Ready to Start Earning?
          </h2>
          <p className="text-xl text-gray-200 mb-12 max-w-3xl mx-auto leading-relaxed">
            Join thousands of parents already earning from their daily routines. Setup takes less than 2 minutes.
          </p>
          <a
            href="/auth"
            className="text-white px-12 py-6 rounded-2xl font-bold text-xl transition-all transform hover:scale-105 inline-block"
            style={{
              background: 'linear-gradient(135deg, #10b981, #3b82f6, #8b5cf6)',
              boxShadow: '0 15px 35px rgba(0, 0, 0, 0.2)',
              animation: 'pulse 2s infinite'
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