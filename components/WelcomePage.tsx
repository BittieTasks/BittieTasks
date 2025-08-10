'use client'

export default function WelcomePage() {
  return (
    <div className="min-h-screen hero-gradient relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-green-500/10 rounded-full blur-3xl"></div>
      </div>

      {/* Navigation */}
      <nav className="relative z-10 px-6 py-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-r from-emerald-400 via-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl">
              <span className="text-white font-bold text-xl">B</span>
            </div>
            <span className="text-white text-2xl font-bold tracking-tight">BittieTasks</span>
          </div>
          <a 
            href="/auth"
            className="bg-white/90 backdrop-blur-sm text-gray-900 px-8 py-3 rounded-full font-semibold hover:bg-white transition-all transform hover:scale-105 shadow-lg"
          >
            Sign In
          </a>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative z-10 px-6 pt-20 pb-32">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center space-x-3 bg-gradient-to-r from-emerald-500/20 to-blue-500/20 backdrop-blur-sm text-emerald-300 px-6 py-3 rounded-full text-sm font-medium mb-10 border border-emerald-500/30">
            <span className="text-lg">🚀</span>
            <span className="font-semibold">Now live in your community</span>
          </div>
          
          <h1 className="text-6xl md:text-8xl font-bold text-white mb-8 leading-tight">
            Turn Daily Tasks Into
            <span className="gradient-text block mt-2">
              Real Income
            </span>
          </h1>
          
          <p className="text-2xl text-gray-200 mb-16 max-w-3xl mx-auto leading-relaxed font-light">
            Join thousands of parents earning money by sharing everyday activities. From school pickups to grocery runs - your routine is your revenue.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-20">
            <a
              href="/auth"
              className="bg-gradient-to-r from-emerald-500 via-blue-500 to-purple-600 text-white px-10 py-5 rounded-2xl font-semibold text-xl hover:from-emerald-600 hover:via-blue-600 hover:to-purple-700 transition-all transform hover:scale-105 shadow-2xl pulse-animation"
            >
              Start Earning Today
            </a>
            <button className="text-white px-10 py-5 rounded-2xl font-semibold text-xl border-2 border-white/30 hover:border-white/60 backdrop-blur-sm transition-all transform hover:scale-105">
              Watch Demo
            </button>
          </div>

          {/* Trust Indicators */}
          <div className="grid grid-cols-3 gap-12 max-w-2xl mx-auto">
            <div className="text-center card-hover">
              <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <span className="text-3xl">🔒</span>
              </div>
              <p className="text-lg font-semibold text-white">Bank-level Security</p>
            </div>
            <div className="text-center card-hover">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <span className="text-3xl">✅</span>
              </div>
              <p className="text-lg font-semibold text-white">Verified Community</p>
            </div>
            <div className="text-center card-hover">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-400 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
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
            <h2 className="text-5xl md:text-6xl font-bold text-white mb-6 gradient-text">
              How It Works
            </h2>
            <p className="text-xl text-gray-200 max-w-3xl mx-auto leading-relaxed">
              Simple steps to start earning from your daily routine
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-10">
            <div className="group bg-white/10 backdrop-blur-sm border border-white/20 rounded-3xl p-10 text-center card-hover hover:bg-white/15 hover:border-emerald-400/50 transition-all duration-300">
              <div className="w-20 h-20 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-8 group-hover:scale-110 transition-transform duration-300 shadow-2xl">
                <span className="text-3xl">📅</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-6">Share Your Schedule</h3>
              <p className="text-gray-200 text-lg leading-relaxed">
                Post your daily activities and let neighbors join you. Playground trips, errands, school events.
              </p>
            </div>

            <div className="group bg-white/10 backdrop-blur-sm border border-white/20 rounded-3xl p-10 text-center card-hover hover:bg-white/15 hover:border-blue-400/50 transition-all duration-300">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-2xl flex items-center justify-center mx-auto mb-8 group-hover:scale-110 transition-transform duration-300 shadow-2xl">
                <span className="text-3xl">👥</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-6">Build Community</h3>
              <p className="text-gray-200 text-lg leading-relaxed">
                Connect with local families. Create lasting friendships while helping other parents save time.
              </p>
            </div>

            <div className="group bg-white/10 backdrop-blur-sm border border-white/20 rounded-3xl p-10 text-center card-hover hover:bg-white/15 hover:border-purple-400/50 transition-all duration-300">
              <div className="w-20 h-20 bg-gradient-to-r from-purple-400 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-8 group-hover:scale-110 transition-transform duration-300 shadow-2xl">
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

      {/* Stats Section */}
      <div className="relative z-10 px-6 pb-32">
        <div className="max-w-6xl mx-auto">
          <div className="bg-gradient-to-r from-emerald-500/20 via-blue-500/20 to-purple-600/20 border border-white/30 rounded-3xl p-16 text-center backdrop-blur-sm">
            <div className="grid md:grid-cols-3 gap-12">
              <div className="group">
                <div className="text-5xl font-bold gradient-text mb-4 group-hover:scale-110 transition-transform duration-300">$150+</div>
                <p className="text-white text-lg font-semibold">Average monthly earnings</p>
              </div>
              <div className="group">
                <div className="text-5xl font-bold gradient-text mb-4 group-hover:scale-110 transition-transform duration-300">2,500+</div>
                <p className="text-white text-lg font-semibold">Active families</p>
              </div>
              <div className="group">
                <div className="text-5xl font-bold gradient-text mb-4 group-hover:scale-110 transition-transform duration-300">98%</div>
                <p className="text-white text-lg font-semibold">Satisfaction rate</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="relative z-10 px-6 pb-20">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-5xl md:text-6xl font-bold text-white mb-8 gradient-text">
            Ready to Start Earning?
          </h2>
          <p className="text-xl text-gray-200 mb-12 max-w-3xl mx-auto leading-relaxed">
            Join thousands of parents already earning from their daily routines. Setup takes less than 2 minutes.
          </p>
          <a
            href="/auth"
            className="bg-gradient-to-r from-emerald-500 via-blue-500 to-purple-600 text-white px-12 py-6 rounded-2xl font-bold text-xl hover:from-emerald-600 hover:via-blue-600 hover:to-purple-700 transition-all transform hover:scale-105 shadow-2xl inline-block pulse-animation"
          >
            Create Free Account
          </a>
        </div>
      </div>
    </div>
  )
}