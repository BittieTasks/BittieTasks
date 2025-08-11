'use client'

// Simple, reliable welcome page component for development preview
export default function SafeWelcomePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-teal-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">B</span>
              </div>
              <span className="text-xl font-semibold text-gray-900">BittieTasks</span>
            </div>
            
            {/* Auth Buttons */}
            <div className="flex items-center space-x-3">
              <a
                href="/auth"
                className="px-4 py-2 text-teal-600 font-medium hover:bg-teal-50 rounded-lg transition-colors"
              >
                Log In
              </a>
              <a
                href="/auth"
                className="px-4 py-2 bg-teal-600 text-white font-medium rounded-lg hover:bg-teal-700 transition-colors"
              >
                Join Community
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
            Turn daily tasks into{' '}
            <span className="text-teal-600">earning opportunities</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Connect with neighbors to share activities, split costs, and build community while creating income opportunities from your everyday routine.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a
              href="/auth"
              className="w-full sm:w-auto px-8 py-4 bg-teal-600 text-white text-lg font-semibold rounded-lg hover:bg-teal-700 transition-colors"
            >
              Join the Community
            </a>
            <a
              href="/platform"
              className="w-full sm:w-auto px-8 py-4 border border-gray-300 text-gray-700 text-lg font-semibold rounded-lg hover:bg-gray-50 transition-colors"
            >
              Explore Opportunities
            </a>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="text-center p-6 bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="w-16 h-16 bg-teal-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <span className="text-teal-600 text-2xl">💰</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Earn from Daily Tasks</h3>
            <p className="text-gray-600">Transform routine activities into income opportunities by sharing with neighbors.</p>
          </div>
          
          <div className="text-center p-6 bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="w-16 h-16 bg-teal-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <span className="text-teal-600 text-2xl">🤝</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Build Community</h3>
            <p className="text-gray-600">Connect with neighbors and build lasting relationships while sharing costs and activities.</p>
          </div>
          
          <div className="text-center p-6 bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="w-16 h-16 bg-teal-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <span className="text-teal-600 text-2xl">🎯</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Flexible Schedule</h3>
            <p className="text-gray-600">Work around your existing routine - earn money without changing your lifestyle.</p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to get started?</h2>
          <p className="text-lg text-gray-600 mb-6">Join thousands of neighbors already earning through community task sharing.</p>
          <a
            href="/auth"
            className="inline-flex px-8 py-4 bg-teal-600 text-white text-lg font-semibold rounded-lg hover:bg-teal-700 transition-colors"
          >
            Let's Get Started
          </a>
        </div>
      </main>
    </div>
  )
}