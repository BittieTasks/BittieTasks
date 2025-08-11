'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useRouter } from 'next/navigation'

// Interactive Earnings Calculator Component
function EarningsCalculator() {
  const [tasksPerWeek, setTasksPerWeek] = useState(3)
  const [avgTaskValue, setAvgTaskValue] = useState(35)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])
  
  const weeklyEarnings = tasksPerWeek * avgTaskValue
  const monthlyEarnings = weeklyEarnings * 4.33
  const yearlyEarnings = monthlyEarnings * 12

  if (!mounted) {
    return (
      <div className="space-y-8">
        <div className="text-center">
          <h3 className="text-3xl font-bold text-white mb-4">Calculate Your Earnings</h3>
          <p className="text-white/80">Estimate your potential income from community tasks</p>
        </div>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-white font-medium mb-3">
                Tasks per week: 3
              </label>
              <div className="w-full h-3 bg-white/20 rounded-full"></div>
            </div>
            <div>
              <label className="block text-white font-medium mb-3">
                Average task value: $35
              </label>
              <div className="w-full h-3 bg-white/20 rounded-full"></div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8">
            <div className="text-center p-6 bg-gradient-to-br from-green-500/20 to-emerald-600/20 backdrop-blur-sm border border-green-300/30 rounded-2xl">
              <div className="text-3xl font-black text-yellow-400 mb-2">$105</div>
              <p className="text-white/70">Per Week</p>
            </div>
            <div className="text-center p-6 bg-gradient-to-br from-blue-500/20 to-indigo-600/20 backdrop-blur-sm border border-blue-300/30 rounded-2xl">
              <div className="text-3xl font-black text-yellow-400 mb-2">$455</div>
              <p className="text-white/70">Per Month</p>
            </div>
            <div className="text-center p-6 bg-gradient-to-br from-purple-500/20 to-pink-600/20 backdrop-blur-sm border border-purple-300/30 rounded-2xl">
              <div className="text-3xl font-black text-yellow-400 mb-2">$5,460</div>
              <p className="text-white/70">Per Year</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h3 className="text-3xl font-bold text-white mb-4">Calculate Your Earnings</h3>
        <p className="text-white/80">Estimate your potential income from community tasks</p>
      </div>
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-white font-medium mb-3">
              Tasks per week: {tasksPerWeek}
            </label>
            <input 
              type="range" 
              min="1" 
              max="10" 
              value={tasksPerWeek}
              onChange={(e) => setTasksPerWeek(parseInt(e.target.value))}
              className="w-full h-3 bg-white/20 rounded-full appearance-none cursor-pointer slider"
              style={{
                background: `linear-gradient(to right, #ec4899 0%, #ec4899 ${(tasksPerWeek / 10) * 100}%, rgba(255,255,255,0.2) ${(tasksPerWeek / 10) * 100}%, rgba(255,255,255,0.2) 100%)`
              }}
            />
          </div>
          
          <div>
            <label className="block text-white font-medium mb-3">
              Average task value: ${avgTaskValue}
            </label>
            <input 
              type="range" 
              min="15" 
              max="75" 
              step="5"
              value={avgTaskValue}
              onChange={(e) => setAvgTaskValue(parseInt(e.target.value))}
              className="w-full h-3 bg-white/20 rounded-full appearance-none cursor-pointer slider"
              style={{
                background: `linear-gradient(to right, #10b981 0%, #10b981 ${((avgTaskValue - 15) / 60) * 100}%, rgba(255,255,255,0.2) ${((avgTaskValue - 15) / 60) * 100}%, rgba(255,255,255,0.2) 100%)`
              }}
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8">
          <div className="text-center p-6 bg-gradient-to-br from-green-500/20 to-emerald-600/20 backdrop-blur-sm border border-green-300/30 rounded-2xl transform hover:scale-105 transition-all duration-300">
            <div className="text-3xl font-black text-yellow-400 mb-2">${Math.round(weeklyEarnings)}</div>
            <p className="text-white/70">Per Week</p>
          </div>
          <div className="text-center p-6 bg-gradient-to-br from-blue-500/20 to-indigo-600/20 backdrop-blur-sm border border-blue-300/30 rounded-2xl transform hover:scale-105 transition-all duration-300">
            <div className="text-3xl font-black text-yellow-400 mb-2">${Math.round(monthlyEarnings)}</div>
            <p className="text-white/70">Per Month</p>
          </div>
          <div className="text-center p-6 bg-gradient-to-br from-purple-500/20 to-pink-600/20 backdrop-blur-sm border border-purple-300/30 rounded-2xl transform hover:scale-105 transition-all duration-300">
            <div className="text-3xl font-black text-yellow-400 mb-2">${Math.round(yearlyEarnings).toLocaleString()}</div>
            <p className="text-white/70">Per Year</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function WelcomePage() {
  const router = useRouter()

  const handleSignUp = () => {
    router.push('/auth/signup')
  }

  const handleLogin = () => {
    router.push('/auth/login')
  }

  const handleViewTasks = () => {
    router.push('/platform')
  }

  return (
    <div 
      style={{
        background: 'linear-gradient(to bottom right, rgb(88, 28, 135), rgb(30, 58, 138), rgb(49, 46, 129))',
        minHeight: '100vh',
        color: 'white'
      }}
      className="overflow-x-hidden"
    >
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div 
          className="absolute -top-40 -right-40 w-80 h-80 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"
          style={{ background: 'linear-gradient(to bottom right, rgb(236, 72, 153), rgb(244, 63, 94))' }}
        ></div>
        <div 
          className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"
          style={{ background: 'linear-gradient(to bottom right, rgb(250, 204, 21), rgb(251, 146, 60))' }}
        ></div>
        <div 
          className="absolute top-40 left-1/2 w-80 h-80 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"
          style={{ background: 'linear-gradient(to bottom right, rgb(74, 222, 128), rgb(59, 130, 246))' }}
        ></div>
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-white/10 backdrop-blur-sm bg-white/5">
        <div className="container-clean py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg transform rotate-3 hover:rotate-0 transition-transform duration-300"
                style={{ background: 'linear-gradient(to right, rgb(236, 72, 153), rgb(139, 92, 246))' }}
              >
                <span className="text-white font-bold text-xl">B</span>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-pink-400 to-violet-400 bg-clip-text text-transparent">BittieTasks</span>
            </div>
            <div className="flex items-center space-x-4">
              <Button 
                variant="outline" 
                onClick={handleLogin}
                className="border-2 border-white/30 text-white hover:bg-white/10 backdrop-blur-sm font-semibold"
              >
                Log In
              </Button>
              <Button 
                onClick={handleSignUp}
                style={{ background: 'linear-gradient(to right, rgb(236, 72, 153), rgb(139, 92, 246))' }}
                className="hover:opacity-90 text-white font-semibold px-6 py-2 rounded-lg shadow-lg transform hover:scale-105 transition-all duration-300"
              >
                Sign Up
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 py-20 px-4">
        <div className="container-clean">
          <div className="text-center max-w-6xl mx-auto">
            <div className="mb-8">
              <span className="inline-block bg-gradient-to-r from-pink-500 to-violet-600 text-white px-6 py-2 rounded-full text-sm font-semibold mb-6 shadow-lg animate-pulse">
                🚀 Join 10,000+ Parents Already Earning
              </span>
            </div>
            
            <h1 className="text-6xl md:text-8xl font-black mb-8 leading-tight">
              <span className="bg-gradient-to-r from-pink-400 via-purple-400 to-violet-400 bg-clip-text text-transparent">
                Turn Your
              </span>
              <br />
              <span className="bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 bg-clip-text text-transparent">
                Daily Tasks
              </span>
              <br />
              <span className="bg-gradient-to-r from-green-400 via-teal-400 to-blue-400 bg-clip-text text-transparent">
                Into Cash
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-white/80 mb-12 max-w-3xl mx-auto font-medium leading-relaxed">
              Join the earning revolution! Share everyday parent tasks with neighbors and 
              <span className="text-yellow-400 font-bold"> earn $500-2000+ monthly </span>
              while building amazing community connections.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
              <Button 
                size="lg" 
                onClick={handleSignUp}
                className="bg-gradient-to-r from-pink-500 to-violet-600 hover:from-pink-600 hover:to-violet-700 text-white font-bold px-10 py-4 rounded-2xl shadow-2xl transform hover:scale-110 transition-all duration-300 text-lg"
              >
                💰 Start Earning Now
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                onClick={handleViewTasks}
                className="border-2 border-white/40 text-white hover:bg-white/10 backdrop-blur-sm font-semibold px-10 py-4 rounded-2xl"
              >
                🎯 See How It Works
              </Button>
            </div>

            {/* Floating Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <div className="bg-gradient-to-br from-pink-500/20 to-violet-600/20 backdrop-blur-sm border border-white/20 rounded-2xl p-6 shadow-xl">
                <div className="text-3xl md:text-4xl font-black text-yellow-400 mb-2">$847</div>
                <div className="text-white/80 font-medium">Average Monthly Earnings</div>
              </div>
              <div className="bg-gradient-to-br from-green-500/20 to-blue-600/20 backdrop-blur-sm border border-white/20 rounded-2xl p-6 shadow-xl">
                <div className="text-3xl md:text-4xl font-black text-green-400 mb-2">2.5hrs</div>
                <div className="text-white/80 font-medium">Average Daily Time</div>
              </div>
              <div className="bg-gradient-to-br from-orange-500/20 to-red-600/20 backdrop-blur-sm border border-white/20 rounded-2xl p-6 shadow-xl">
                <div className="text-3xl md:text-4xl font-black text-orange-400 mb-2">98%</div>
                <div className="text-white/80 font-medium">Parent Satisfaction</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Earnings Calculator */}
      <section className="relative z-10 py-20">
        <div className="container-clean">
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-6xl font-black mb-6">
              <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                💸 Your Earning Potential
              </span>
            </h2>
            <p className="text-xl text-white/80 max-w-2xl mx-auto">
              See exactly how much you could be earning right now by sharing tasks in your community
            </p>
          </div>
          <div className="max-w-4xl mx-auto">
            <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl">
              <EarningsCalculator />
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="relative z-10 py-20">
        <div className="container-clean">
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-6xl font-black mb-6">
              <span className="bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
                🌟 Why BittieTasks Rocks
              </span>
            </h2>
            <p className="text-xl text-white/80 max-w-2xl mx-auto">
              The most trusted platform for turning parent life into profit
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="group">
              <div className="bg-gradient-to-br from-pink-500/20 to-rose-600/20 backdrop-blur-sm border border-pink-300/30 rounded-3xl p-8 shadow-xl transform group-hover:scale-105 transition-all duration-300">
                <div className="text-6xl mb-6">⚡</div>
                <h3 className="text-2xl font-bold text-pink-400 mb-4">Lightning Fast Cash</h3>
                <p className="text-white/80 text-lg leading-relaxed">
                  Work your schedule, your way. Pick tasks that match your lifestyle and 
                  <span className="text-yellow-400 font-bold"> get paid instantly</span> for things you're already doing!
                </p>
              </div>
            </div>

            <div className="group">
              <div className="bg-gradient-to-br from-green-500/20 to-emerald-600/20 backdrop-blur-sm border border-green-300/30 rounded-3xl p-8 shadow-xl transform group-hover:scale-105 transition-all duration-300">
                <div className="text-6xl mb-6">🛡️</div>
                <h3 className="text-2xl font-bold text-green-400 mb-4">Super Safe Community</h3>
                <p className="text-white/80 text-lg leading-relaxed">
                  Every member is verified and trusted. Build amazing friendships with neighbors while 
                  <span className="text-yellow-400 font-bold"> creating multiple income streams</span>!
                </p>
              </div>
            </div>

            <div className="group">
              <div className="bg-gradient-to-br from-blue-500/20 to-indigo-600/20 backdrop-blur-sm border border-blue-300/30 rounded-3xl p-8 shadow-xl transform group-hover:scale-105 transition-all duration-300">
                <div className="text-6xl mb-6">💳</div>
                <h3 className="text-2xl font-bold text-blue-400 mb-4">Instant Payments</h3>
                <p className="text-white/80 text-lg leading-relaxed">
                  Money hits your account the moment tasks complete. Ultra-secure payment processing with 
                  <span className="text-yellow-400 font-bold"> industry-low fees</span>!
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Task Examples */}
      <section className="relative z-10 py-20">
        <div className="container-clean">
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-6xl font-black mb-6">
              <span className="bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
                🔥 Hot Money-Making Tasks
              </span>
            </h2>
            <p className="text-xl text-white/80 max-w-2xl mx-auto">
              Real earning opportunities happening in communities RIGHT NOW
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="group">
              <div className="bg-gradient-to-br from-emerald-500/20 to-teal-600/20 backdrop-blur-sm border border-emerald-300/30 rounded-3xl p-8 text-center shadow-xl transform group-hover:scale-110 group-hover:rotate-1 transition-all duration-300">
                <div className="text-6xl mb-4">🛒</div>
                <h3 className="text-xl font-bold text-emerald-400 mb-3">Group Shopping</h3>
                <div className="text-2xl font-black text-yellow-400 mb-2">$25-45</div>
                <p className="text-white/70">per trip</p>
              </div>
            </div>

            <div className="group">
              <div className="bg-gradient-to-br from-blue-500/20 to-indigo-600/20 backdrop-blur-sm border border-blue-300/30 rounded-3xl p-8 text-center shadow-xl transform group-hover:scale-110 group-hover:-rotate-1 transition-all duration-300">
                <div className="text-6xl mb-4">🚗</div>
                <h3 className="text-xl font-bold text-blue-400 mb-3">School Pickup</h3>
                <div className="text-2xl font-black text-yellow-400 mb-2">$15-30</div>
                <p className="text-white/70">per day</p>
              </div>
            </div>

            <div className="group">
              <div className="bg-gradient-to-br from-pink-500/20 to-rose-600/20 backdrop-blur-sm border border-pink-300/30 rounded-3xl p-8 text-center shadow-xl transform group-hover:scale-110 group-hover:rotate-1 transition-all duration-300">
                <div className="text-6xl mb-4">🎂</div>
                <h3 className="text-xl font-bold text-pink-400 mb-3">Event Planning</h3>
                <div className="text-2xl font-black text-yellow-400 mb-2">$40-85</div>
                <p className="text-white/70">per event</p>
              </div>
            </div>

            <div className="group">
              <div className="bg-gradient-to-br from-purple-500/20 to-violet-600/20 backdrop-blur-sm border border-purple-300/30 rounded-3xl p-8 text-center shadow-xl transform group-hover:scale-110 group-hover:-rotate-1 transition-all duration-300">
                <div className="text-6xl mb-4">👥</div>
                <h3 className="text-xl font-bold text-purple-400 mb-3">Group Activities</h3>
                <div className="text-2xl font-black text-yellow-400 mb-2">$20-50</div>
                <p className="text-white/70">per session</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-20">
        <div className="container-clean">
          <div className="bg-gradient-to-br from-pink-500/20 to-violet-600/20 backdrop-blur-xl border border-white/20 rounded-3xl p-16 text-center shadow-2xl">
            <h2 className="text-5xl md:text-6xl font-black mb-8">
              <span className="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent">
                🚀 Ready to Get Rich?
              </span>
            </h2>
            <p className="text-xl md:text-2xl text-white/80 mb-12 max-w-3xl mx-auto leading-relaxed">
              Join <span className="text-yellow-400 font-bold">10,000+ parents</span> who've transformed their daily routines into 
              <span className="text-green-400 font-bold"> serious money-making machines</span>. 
              Start your first task THIS WEEK and see the cash roll in!
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Button 
                size="lg" 
                onClick={handleSignUp}
                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold px-12 py-6 rounded-2xl shadow-2xl transform hover:scale-110 transition-all duration-300 text-xl"
              >
                💰 Start Making Money NOW
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                onClick={handleViewTasks}
                className="border-2 border-white/40 text-white hover:bg-white/10 backdrop-blur-sm font-semibold px-12 py-6 rounded-2xl text-xl"
              >
                🔍 Browse Hot Tasks
              </Button>
            </div>
            
            <div className="mt-12 flex justify-center items-center space-x-8 text-sm">
              <div className="flex items-center space-x-2">
                <span className="text-green-400">✓</span>
                <span className="text-white/80">Free to Join</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-green-400">✓</span>
                <span className="text-white/80">Instant Payments</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-green-400">✓</span>
                <span className="text-white/80">No Experience Needed</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 bg-black/20 backdrop-blur-sm">
        <div className="container-clean py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-violet-600 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-lg">B</span>
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-pink-400 to-violet-400 bg-clip-text text-transparent">BittieTasks</span>
              </div>
              <p className="text-white/70 leading-relaxed">
                Transforming parent life into profit. The #1 platform for community-based earning opportunities.
              </p>
            </div>
            
            <div>
              <h4 className="text-lg font-bold text-white mb-4">Platform</h4>
              <ul className="space-y-3 text-white/70">
                <li className="hover:text-pink-400 cursor-pointer transition-colors">How It Works</li>
                <li className="hover:text-pink-400 cursor-pointer transition-colors">Task Categories</li>
                <li className="hover:text-pink-400 cursor-pointer transition-colors">Pricing</li>
                <li className="hover:text-pink-400 cursor-pointer transition-colors">Safety</li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-bold text-white mb-4">Support</h4>
              <ul className="space-y-3 text-white/70">
                <li className="hover:text-green-400 cursor-pointer transition-colors">Help Center</li>
                <li className="hover:text-green-400 cursor-pointer transition-colors">Contact Us</li>
                <li className="hover:text-green-400 cursor-pointer transition-colors">Community</li>
                <li className="hover:text-green-400 cursor-pointer transition-colors">FAQ</li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-bold text-white mb-4">Legal</h4>
              <ul className="space-y-3 text-white/70">
                <li className="hover:text-blue-400 cursor-pointer transition-colors">Privacy Policy</li>
                <li className="hover:text-blue-400 cursor-pointer transition-colors">Terms of Service</li>
                <li className="hover:text-blue-400 cursor-pointer transition-colors">Cookie Policy</li>
                <li className="hover:text-blue-400 cursor-pointer transition-colors">Guidelines</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-white/10 mt-12 pt-8 text-center">
            <p className="text-white/60">
              © 2025 BittieTasks. All rights reserved. Making parents rich since 2025. 💰
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}