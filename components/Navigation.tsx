'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from './auth/AuthProvider'
import { Button } from '@/components/ui/button'
import { 
  Home, 
  Search, 
  PlusCircle, 
  DollarSign, 
  User, 
  Settings,
  Crown,
  Briefcase,
  Menu,
  X,
  Star,
  BarChart3
} from 'lucide-react'

const navigationItems = [
  { path: '/platform', label: 'Dashboard', icon: Home },
  { path: '/marketplace', label: 'Marketplace', icon: Search },
  { path: '/earnings', label: 'Earnings', icon: DollarSign },
  { path: '/achievements', label: 'Achievements', icon: Star },
  { path: '/subscriptions', label: 'Plans', icon: Crown },
  { path: '/sponsors', label: 'Sponsors', icon: Briefcase },
]

export default function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { user, signOut, isVerified } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    setMounted(true)
  }, [])

  // Don't render anything during SSR to prevent location errors
  if (!mounted) {
    return null
  }

  const handleSignOut = async () => {
    try {
      await signOut()
      router.push('/')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="bittie-card border-b sticky top-0 z-50">
        <div className="bittie-container">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3 group cursor-pointer" onClick={() => router.push('/')}>
              <div className="w-10 h-10 bg-gradient-to-r from-green-600 to-blue-600 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform duration-200 shadow-sm">
                <span className="text-white font-bold text-lg">B</span>
              </div>
              <span className="bittie-heading-sm bittie-gradient-text">
                BittieTasks
              </span>
            </div>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center space-x-2">
              {navigationItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.path
                const isDisabled = !isVerified && item.path !== '/platform'
                
                return (
                  <button
                    key={item.path}
                    onClick={() => !isDisabled && router.push(item.path)}
                    disabled={isDisabled}
                    className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-gradient-to-r from-green-100 to-blue-100 text-green-700 shadow-sm'
                        : isDisabled 
                        ? 'text-gray-400 cursor-not-allowed opacity-50'
                        : 'text-gray-600 hover:text-green-700 hover:bg-gradient-to-r hover:from-green-50 hover:to-blue-50'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </button>
                )
              })}
            </div>

            {/* User Menu */}
            <div className="hidden md:flex items-center space-x-4">
              <div className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl border border-green-200">
                <User className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-green-700">
                  {user?.email?.split('@')[0] || 'User'}
                </span>
                {!isVerified && (
                  <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full">
                    Verify Email
                  </span>
                )}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSignOut}
                className="bittie-button-secondary text-sm"
              >
                Sign Out
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-gray-600 hover:text-green-700 hover:bg-green-50"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white/95 backdrop-blur-sm border-t border-green-200 bittie-fade-in">
            <div className="px-4 py-6 space-y-3">
              {navigationItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.path
                const isDisabled = !isVerified && item.path !== '/platform'
                
                return (
                  <button
                    key={item.path}
                    onClick={() => {
                      if (!isDisabled) {
                        router.push(item.path)
                        setMobileMenuOpen(false)
                      }
                    }}
                    disabled={isDisabled}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-gradient-to-r from-green-100 to-blue-100 text-green-700 shadow-sm'
                        : isDisabled 
                        ? 'text-gray-400 cursor-not-allowed opacity-50'
                        : 'text-gray-600 hover:text-green-700 hover:bg-gradient-to-r hover:from-green-50 hover:to-blue-50'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </button>
                )
              })}
              
              <div className="border-t border-green-200 pt-6 mt-6">
                <div className="flex items-center space-x-3 px-4 py-3 mb-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl">
                  <User className="w-5 h-5 text-green-600" />
                  <div className="flex-1">
                    <span className="text-sm font-medium text-green-700 block">
                      {user?.email?.split('@')[0] || 'User'}
                    </span>
                    {!isVerified && (
                      <span className="text-xs text-yellow-600">
                        Please verify your email
                      </span>
                    )}
                  </div>
                </div>
                <Button
                  variant="outline"
                  onClick={handleSignOut}
                  className="w-full bittie-button-secondary"
                >
                  Sign Out
                </Button>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Bottom Navigation for Mobile */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-green-200 z-50 safe-area-pb">
        <div className="grid grid-cols-5 h-16">
          {navigationItems.slice(0, 5).map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.path
            const isDisabled = !isVerified && item.path !== '/platform'
            
            return (
              <button
                key={item.path}
                onClick={() => !isDisabled && router.push(item.path)}
                disabled={isDisabled}
                className={`flex flex-col items-center justify-center space-y-1 transition-all duration-200 ${
                  isActive
                    ? 'text-green-600 bg-gradient-to-b from-green-50 to-transparent scale-105'
                    : isDisabled
                    ? 'text-gray-300 cursor-not-allowed'
                    : 'text-gray-500 hover:text-green-600 hover:bg-green-50'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs font-medium">{item.label}</span>
              </button>
            )
          })}
        </div>
      </div>
    </>
  )
}