'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from './auth/AuthProvider'
import { Button } from '@/components/ui/button'
import { 
  Home, 
  Search, 
  PlusCircle, 
  Coins, 
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
  { path: '/dashboard', label: 'Dashboard', icon: Home },
  { path: '/marketplace', label: 'Marketplace', icon: Search },
  { path: '/earnings', label: 'Earnings', icon: Coins },
  { path: '/subscriptions', label: 'Plans', icon: Crown },
  { path: '/sponsors', label: 'Sponsors', icon: Briefcase },
  { path: '/create-task', label: 'Create', icon: PlusCircle },
]

const footerItems = [
  { path: '/policies', label: 'Policies & Guidelines', icon: Settings },
]

export default function CleanNavigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { user, signOut, isVerified } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    setMounted(true)
  }, [])

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
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-1">
              {navigationItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.path
                return (
                  <Button
                    key={item.path}
                    variant={isActive ? "default" : "ghost"}
                    className={`px-4 py-2 ${isActive 
                      ? 'bg-teal-600 text-white hover:bg-teal-700' 
                      : 'text-gray-700 hover:text-teal-600 hover:bg-teal-50'
                    }`}
                    onClick={() => router.push(item.path)}
                  >
                    <Icon size={16} className="mr-2" />
                    {item.label}
                  </Button>
                )
              })}
            </nav>

            {/* User Menu */}
            <div className="flex items-center space-x-3">
              <div className="hidden md:flex items-center space-x-2">
                <User size={20} className="text-gray-600" />
                <span className="text-sm font-medium text-gray-700">
                  {user?.user_metadata?.firstName || 'User'}
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSignOut}
                className="hidden md:inline-flex"
              >
                Sign Out
              </Button>
              
              {/* Mobile menu button */}
              <Button
                variant="ghost"
                size="sm"
                className="md:hidden"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 md:hidden">
          <div className="fixed right-0 top-0 h-full w-80 bg-white shadow-xl">
            <div className="p-4">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-teal-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-lg">B</span>
                  </div>
                  <span className="text-xl font-semibold text-gray-900">BittieTasks</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <X size={20} />
                </Button>
              </div>

              <nav className="space-y-2">
                {navigationItems.map((item) => {
                  const Icon = item.icon
                  const isActive = pathname === item.path
                  return (
                    <Button
                      key={item.path}
                      variant="ghost"
                      className={`w-full justify-start px-4 py-3 h-auto ${
                        isActive ? 'bg-teal-50 text-teal-600' : 'text-gray-700 hover:bg-gray-50'
                      }`}
                      onClick={() => {
                        router.push(item.path)
                        setMobileMenuOpen(false)
                      }}
                    >
                      <Icon size={18} className="mr-3" />
                      {item.label}
                    </Button>
                  )
                })}
                
                <div className="border-t pt-4 mt-4">
                  <Button
                    variant="ghost"
                    className="w-full justify-start px-4 py-3 h-auto text-gray-700 hover:bg-gray-50 mb-2"
                    onClick={() => {
                      router.push('/policies')
                      setMobileMenuOpen(false)
                    }}
                  >
                    <Settings size={18} className="mr-3" />
                    Policies & Guidelines
                  </Button>
                  
                  <div className="flex items-center space-x-3 px-4 py-2 mb-2">
                    <User size={20} className="text-gray-600" />
                    <span className="font-medium text-gray-700">
                      {user?.user_metadata?.firstName || 'User'}
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={handleSignOut}
                  >
                    Sign Out
                  </Button>
                </div>
              </nav>
            </div>
          </div>
        </div>
      )}
    </>
  )
}