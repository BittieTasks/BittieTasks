'use client'

import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/auth/AuthProvider'
import { Button } from '@/components/ui/button'
import { User, ArrowLeft } from 'lucide-react'

interface NavigationProps {
  showBackButton?: boolean
  backUrl?: string
  title?: string
}

export default function Navigation({ showBackButton = false, backUrl = '/', title }: NavigationProps) {
  const router = useRouter()
  const { user, isAuthenticated, loading } = useAuth()

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex justify-between items-center h-16">
          {/* Left section - Logo/Back button */}
          <div className="flex items-center space-x-4">
            {showBackButton && (
              <Button
                onClick={() => router.push(backUrl)}
                variant="ghost"
                size="sm"
                className="text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            )}
            
            {!showBackButton && (
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-teal-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">B</span>
                </div>
                <span className="text-xl font-semibold text-gray-900">BittieTasks</span>
              </div>
            )}
            
            {title && (
              <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
            )}
          </div>
          
          {/* Right section - Navigation Links */}
          <div className="flex items-center space-x-6">
            <button 
              onClick={() => router.push('/earnings')}
              className="text-gray-700 hover:text-teal-600 font-medium hidden sm:block"
            >
              Our Progress
            </button>
            <button 
              onClick={() => router.push('/subscribe')}
              className="text-gray-700 hover:text-teal-600 font-medium hidden sm:block"
            >
              Subscription
            </button>
            <button 
              onClick={() => router.push('/sponsors')}
              className="text-gray-700 hover:text-teal-600 font-medium hidden sm:block"
            >
              Sponsors
            </button>
            
            {/* Authentication-aware navigation */}
            {loading ? (
              <div className="w-20 h-9 bg-gray-100 rounded animate-pulse"></div>
            ) : isAuthenticated ? (
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
  )
}