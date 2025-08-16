'use client'

import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/auth/AuthProvider'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Coins, 
  Users, 
  Star, 
  TrendingUp, 
  Shield, 
  Heart,
  ArrowRight,
  CheckCircle,
  Crown,
  Target,
  User
} from 'lucide-react'

export default function HomePage() {
  const router = useRouter()
  const { user, isAuthenticated, loading } = useAuth()
  
  // Show loading only for a brief moment, then show content
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-teal-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">B</span>
              </div>
              <span className="text-xl font-semibold text-gray-900">BittieTasks</span>
            </div>
            
            {/* Navigation Links */}
            <div className="flex items-center space-x-6">
              <button 
                onClick={() => router.push('/earnings')}
                className="text-gray-700 hover:text-teal-600 font-medium"
              >
                Our Progress
              </button>
              <button 
                onClick={() => router.push('/subscribe')}
                className="text-gray-700 hover:text-teal-600 font-medium"
              >
                Subscription
              </button>
              <button 
                onClick={() => router.push('/sponsors')}
                className="text-gray-700 hover:text-teal-600 font-medium"
              >
                Sponsors
              </button>
              
              {/* Authentication-aware navigation */}
              {isAuthenticated ? (
                <div className="flex items-center space-x-3">
                  <Button
                    onClick={() => router.push('/dashboard')}
                    variant="outline"
                    className="border-teal-600 text-teal-600 hover:bg-teal-50"
                  >
                    <User className="w-4 h-4 mr-2" />
                    Dashboard
                  </Button>
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <Button
                    onClick={() => router.push('/auth')}
                    variant="outline"
                    className="border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    Sign In
                  </Button>
                  <Button
                    onClick={() => router.push('/auth')}
                    className="bg-teal-600 hover:bg-teal-700 text-white"
                  >
                    Sign Up
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Little Tasks,
            <span className="text-teal-600 block">Real Income</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Connect with neighbors to share tasks, earn money, and build stronger communities. 
            Transform everyday activities into profitable opportunities.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {isAuthenticated ? (
              <>
                <button 
                  onClick={() => router.push('/dashboard')}
                  className="inline-flex items-center justify-center px-8 py-4 bg-teal-600 hover:bg-teal-700 text-white text-lg font-semibold rounded-lg transition-colors"
                >
                  <User size={20} className="mr-2" />
                  Go to Dashboard
                  <ArrowRight size={20} className="ml-2" />
                </button>
                <button 
                  onClick={() => router.push('/sample-tasks')}
                  className="inline-flex items-center justify-center px-8 py-4 border border-teal-600 text-teal-600 hover:bg-teal-50 text-lg font-semibold rounded-lg transition-colors"
                  data-testid="button-view-tasks-auth"
                >
                  View Tasks
                </button>
              </>
            ) : (
              <>
                <button 
                  onClick={() => router.push('/auth')}
                  className="inline-flex items-center justify-center px-8 py-4 bg-teal-600 hover:bg-teal-700 text-white text-lg font-semibold rounded-lg transition-colors"
                >
                  Get Started
                  <ArrowRight size={20} className="ml-2" />
                </button>
                <button 
                  onClick={() => router.push('/sample-tasks')}
                  className="inline-flex items-center justify-center px-8 py-4 border border-teal-600 text-teal-600 hover:bg-teal-50 text-lg font-semibold rounded-lg transition-colors"
                  data-testid="button-view-tasks"
                >
                  <TrendingUp size={20} className="mr-2" />
                  View Tasks
                </button>
              </>
            )}
          </div>
        </div>

        {/* How It Works Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
            How BittieTasks Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-teal-600 font-bold text-xl">1</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Sign Up & Browse</h3>
              <p className="text-gray-600">
                Create your profile and explore available tasks in your neighborhood. 
                Choose what fits your schedule and skills.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-green-600 font-bold text-xl">2</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Complete Tasks</h3>
              <p className="text-gray-600">
                Accept tasks, coordinate with neighbors, and complete them safely. 
                Share verification photos when done.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-purple-600 font-bold text-xl">3</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Get Paid</h3>
              <p className="text-gray-600">
                Receive secure payments directly to your account after task completion. 
                Build your reputation and earnings.
              </p>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <Card className="border-gray-200 hover:shadow-lg transition-shadow">
            <CardHeader className="text-center pb-4">
              <div className="w-16 h-16 bg-teal-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Coins size={32} className="text-teal-600" />
              </div>
              <CardTitle className="text-xl text-gray-900">Earn From Daily Life</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-center">
                Transform daily tasks into income opportunities. Share errands, household help, 
                pet care, and more with trusted neighbors.
              </p>
            </CardContent>
          </Card>

          <Card className="border-gray-200 hover:shadow-lg transition-shadow">
            <CardHeader className="text-center pb-4">
              <div className="w-16 h-16 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Users size={32} className="text-green-600" />
              </div>
              <CardTitle className="text-xl text-gray-900">Build Community</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-center">
                Connect with trusted neighbors, create lasting friendships, and build a 
                supportive community through shared everyday experiences.
              </p>
            </CardContent>
          </Card>

          <Card className="border-gray-200 hover:shadow-lg transition-shadow">
            <CardHeader className="text-center pb-4">
              <div className="w-16 h-16 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Target size={32} className="text-purple-600" />
              </div>
              <CardTitle className="text-xl text-gray-900">Flexible Goals</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-center">
                Set your own schedule, choose tasks that fit your lifestyle, and earn 
                money on your terms while helping your community.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Value Proposition Section */}
        <div className="bg-white rounded-2xl p-8 mb-16 border border-gray-200">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Turn Everyday Tasks Into Income</h2>
            <p className="text-lg text-gray-600">A new way for adults to earn money while helping neighbors</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-teal-600 mb-2">$25-50</div>
              <div className="text-gray-600">Per Task Average</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">120+</div>
              <div className="text-gray-600">Available Tasks</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">4</div>
              <div className="text-gray-600">Task Categories</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">24/7</div>
              <div className="text-gray-600">Platform Access</div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-teal-600 rounded-2xl p-12 text-center text-white">
          {isAuthenticated ? (
            <>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Welcome back!</h2>
              <p className="text-xl mb-8 text-teal-100">
                Ready to continue earning from your daily tasks?
              </p>
              <button
                onClick={() => router.push('/dashboard')}
                className="inline-flex items-center justify-center px-8 py-4 bg-white text-teal-600 hover:bg-gray-100 text-lg font-semibold rounded-lg transition-colors"
              >
                Go to Dashboard
                <ArrowRight size={20} className="ml-2" />
              </button>
            </>
          ) : (
            <>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Get Started?</h2>
              <p className="text-xl mb-8 text-teal-100">
                Be among the first to earn money from your daily tasks
              </p>
              <button
                onClick={() => router.push('/auth')}
                className="inline-flex items-center justify-center px-8 py-4 bg-white text-teal-600 hover:bg-gray-100 text-lg font-semibold rounded-lg transition-colors"
              >
                Sign Up Now
                <ArrowRight size={20} className="ml-2" />
              </button>
            </>
          )}
        </div>
      </main>
      
      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-200 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-6 text-sm text-gray-500 mb-4">
              <a href="/policies" className="hover:text-teal-600 transition-colors">
                Community Guidelines & Safety
              </a>
              <span className="text-gray-300">|</span>
              <a href="/policies" className="hover:text-teal-600 transition-colors">
                Terms of Service
              </a>
              <span className="text-gray-300">|</span>
              <a href="/policies" className="hover:text-teal-600 transition-colors">
                Privacy Policy
              </a>
            </div>
            <p className="text-xs text-gray-400">
              © 2025 BittieTasks. Building stronger communities through shared tasks and mutual support.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}