'use client'

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
  Target
} from 'lucide-react'

export default function HomePage() {
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
            
            {/* Auth Buttons */}
            <div className="flex items-center space-x-3">
              <a
                href="/auth"
                className="px-4 py-2 text-gray-700 hover:text-teal-600 font-medium"
              >
                Sign In
              </a>
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
            <a
              href="/auth"
              className="inline-flex items-center justify-center px-8 py-4 bg-teal-600 hover:bg-teal-700 text-white text-lg font-semibold rounded-lg transition-colors"
            >
              Let's Get Started
              <ArrowRight size={20} className="ml-2" />
            </a>
            <a
              href="/examples"
              className="inline-flex items-center justify-center px-8 py-4 border border-teal-600 text-teal-600 hover:bg-teal-50 text-lg font-semibold rounded-lg transition-colors"
            >
              Explore Opportunities
            </a>
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
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-xl mb-8 text-teal-100">
            Be among the first to earn money from your daily tasks
          </p>
          <a
            href="/auth"
            className="inline-flex items-center justify-center px-8 py-4 bg-white text-teal-600 hover:bg-gray-100 text-lg font-semibold rounded-lg transition-colors"
          >
            Join the Community
            <ArrowRight size={20} className="ml-2" />
          </a>
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