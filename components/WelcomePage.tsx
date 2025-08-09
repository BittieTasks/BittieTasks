import Link from 'next/link'

export default function WelcomePage() {
  return (
    <div className="welcome-container">
      <div className="welcome-card">
        <div className="mb-8 mx-auto w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center text-3xl">
          👥
        </div>

        <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Welcome to BittieTasks
        </h1>

        <p className="text-xl leading-relaxed mb-10 text-gray-600">
          Turn your daily tasks into earning opportunities. Share activities with neighbors, 
          split costs, and build community while making money together.
        </p>

        <div className="mb-10">
          <Link 
            href="/registration" 
            className="bg-blue-600 text-white px-8 py-4 rounded-lg font-bold text-lg mr-4 inline-block hover:bg-blue-700 transition-colors"
          >
            Get Started Free →
          </Link>
          <Link 
            href="/auth" 
            className="bg-transparent text-blue-600 border-2 border-blue-600 px-8 py-4 rounded-lg font-bold text-lg inline-block hover:bg-blue-50 transition-colors"
          >
            Sign In
          </Link>
        </div>

        <div className="flex justify-center items-center gap-8 mb-10 text-sm text-gray-600 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-green-500 text-lg">✓</span>
            <span>Free to start</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-blue-600 text-lg">🛡️</span>
            <span>Secure payments</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-yellow-500 text-lg">💰</span>
            <span>Earn $200-600/week</span>
          </div>
        </div>

        <div className="p-8 bg-gradient-to-r from-gray-100 to-gray-200 rounded-xl mb-8">
          <h3 className="text-xl font-semibold mb-6 text-gray-800">How it Works</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 bg-white rounded-lg">
              <div className="text-2xl mb-3">1️⃣</div>
              <h4 className="font-semibold mb-2 text-gray-800">Share Tasks</h4>
              <p className="text-gray-600 text-sm">
                Post daily activities like grocery runs, park visits, or errands
              </p>
            </div>
            <div className="p-6 bg-white rounded-lg">
              <div className="text-2xl mb-3">2️⃣</div>
              <h4 className="font-semibold mb-2 text-gray-800">Connect</h4>
              <p className="text-gray-600 text-sm">
                Neighbors join and split costs, creating instant income
              </p>
            </div>
            <div className="p-6 bg-white rounded-lg">
              <div className="text-2xl mb-3">3️⃣</div>
              <h4 className="font-semibold mb-2 text-gray-800">Earn</h4>
              <p className="text-gray-600 text-sm">
                Get paid automatically with secure payment processing
              </p>
            </div>
          </div>
        </div>

        <div className="text-xs text-gray-500">
          <p>🚀 BittieTasks is ready for registration and task sharing</p>
          <p>✅ Authentication: Ready | ✅ Payments: Configured | ✅ Subscriptions: Active</p>
        </div>
      </div>
    </div>
  )
}