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
  X
} from 'lucide-react'

const navigationItems = [
  { path: '/platform', label: 'Dashboard', icon: Home },
  { path: '/marketplace', label: 'Marketplace', icon: Search },
  { path: '/create-task', label: 'Create Task', icon: PlusCircle },
  { path: '/earnings', label: 'Earnings', icon: DollarSign },
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
      <nav className="hidden lg:flex fixed top-0 left-0 right-0 z-50 bg-gray-900/95 backdrop-blur-md border-b border-gray-700">
        <div className="max-w-7xl mx-auto w-full px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">B</span>
              </div>
              <span className="text-white text-xl font-bold">BittieTasks</span>
            </div>

            {/* Navigation Links */}
            <div className="flex items-center gap-1">
              {navigationItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.path
                const isDisabled = !isVerified && item.path !== '/platform'
                
                return (
                  <Button
                    key={item.path}
                    variant="ghost"
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
                      isActive 
                        ? 'bg-blue-500/20 text-blue-400 border border-blue-500/20' 
                        : isDisabled
                        ? 'text-gray-600 cursor-not-allowed'
                        : 'text-gray-400 hover:text-white hover:bg-gray-800'
                    }`}
                    onClick={() => !isDisabled && router.push(item.path)}
                    disabled={isDisabled}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-sm">{item.label}</span>
                  </Button>
                )
              })}
            </div>

            {/* User Menu */}
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-white text-sm font-medium">
                  {user?.user_metadata?.firstName || 'User'}
                </p>
                <p className="text-gray-400 text-xs">{user?.email}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSignOut}
                className="border-gray-600 bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white"
              >
                <User className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <div className="lg:hidden">
        {/* Mobile Header */}
        <nav className="fixed top-0 left-0 right-0 z-50 bg-gray-900/95 backdrop-blur-md border-b border-gray-700">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              {/* Logo */}
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">B</span>
                </div>
                <span className="text-white text-lg font-bold">BittieTasks</span>
              </div>

              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-gray-400 hover:text-white"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            </div>
          </div>
        </nav>

        {/* Mobile Menu Overlay */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <div className="fixed inset-0 bg-black/50" onClick={() => setMobileMenuOpen(false)} />
            <div className="fixed top-16 left-0 right-0 bg-gray-900/98 backdrop-blur-md border-b border-gray-700 p-6">
              <div className="space-y-4">
                {navigationItems.map((item) => {
                  const Icon = item.icon
                  const isActive = pathname === item.path
                  const isDisabled = !isVerified && item.path !== '/platform'
                  
                  return (
                    <Button
                      key={item.path}
                      variant="ghost"
                      className={`w-full justify-start gap-3 py-3 px-4 rounded-xl ${
                        isActive 
                          ? 'bg-blue-500/20 text-blue-400 border border-blue-500/20' 
                          : isDisabled
                          ? 'text-gray-600 cursor-not-allowed'
                          : 'text-gray-400 hover:text-white hover:bg-gray-800'
                      }`}
                      onClick={() => {
                        if (!isDisabled) {
                          router.push(item.path)
                          setMobileMenuOpen(false)
                        }
                      }}
                      disabled={isDisabled}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{item.label}</span>
                    </Button>
                  )
                })}
                
                <div className="pt-4 border-t border-gray-700">
                  <div className="flex items-center gap-3 mb-4 px-4">
                    <div>
                      <p className="text-white text-sm font-medium">
                        {user?.user_metadata?.firstName || 'User'}
                      </p>
                      <p className="text-gray-400 text-xs">{user?.email}</p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    className="w-full border-gray-600 bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white"
                    onClick={() => {
                      handleSignOut()
                      setMobileMenuOpen(false)
                    }}
                  >
                    <User className="w-4 h-4 mr-2" />
                    Sign Out
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Spacer for fixed navigation */}
      <div className="h-20" />
    </>
  )
}