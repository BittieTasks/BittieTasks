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
  { path: '/subscribe', label: 'Plans', icon: Crown },
  { path: '/sponsors', label: 'Sponsors', icon: Briefcase },
  { path: '/create-task', label: 'Create', icon: PlusCircle },
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

  if (!mounted) {
    return null
  }

  const handleSignOut = async () => {
    try {
      await signOut()
      // AuthProvider now handles redirect to home page
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="nav-clean sticky top-0 z-50">
        <div className="nav-container">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3 group cursor-pointer" onClick={() => router.push('/')}>
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
                <span className="text-primary-foreground font-bold text-lg">B</span>
              </div>
              <span className="text-subheading">BittieTasks</span>
            </div>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center space-x-2">
              {navigationItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.path
                
                return (
                  <Button
                    key={item.path}
                    variant={isActive ? "default" : "ghost"}
                    size="sm"
                    onClick={() => router.push(item.path)}
                    className={`flex items-center space-x-2 ${
                      isActive ? 'button-clean' : 'hover:bg-muted'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="hidden lg:inline">{item.label}</span>
                  </Button>
                )
              })}
            </div>

            {/* User Menu */}
            <div className="hidden md:flex items-center space-x-3">
              {!isVerified && (
                <div className="badge-warning">
                  Email verification required
                </div>
              )}
              
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                  <User className="h-4 w-4" />
                </div>
                <span className="text-small font-medium">
                  {user?.user_metadata?.firstName || 'User'}
                </span>
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleSignOut}
                className="button-outline"
              >
                Sign Out
              </Button>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-card border-b">
          <div className="nav-container py-4 space-y-3">
            {/* User Info */}
            <div className="flex items-center space-x-3 p-3 bg-muted rounded-lg">
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                <User className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <div className="font-medium">{user?.user_metadata?.firstName || 'User'}</div>
                <div className="text-small text-muted-foreground">{user?.email}</div>
              </div>
            </div>

            {/* Verification Status */}
            {!isVerified && (
              <div className="badge-warning text-center py-2">
                Email verification required
              </div>
            )}

            {/* Navigation Links */}
            <div className="space-y-2">
              {navigationItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.path
                
                return (
                  <Button
                    key={item.path}
                    variant={isActive ? "default" : "ghost"}
                    className={`w-full justify-start ${
                      isActive ? 'button-clean' : 'hover:bg-muted'
                    }`}
                    onClick={() => {
                      router.push(item.path)
                      setMobileMenuOpen(false)
                    }}
                  >
                    <Icon className="h-4 w-4 mr-3" />
                    {item.label}
                  </Button>
                )
              })}
            </div>

            {/* Sign Out */}
            <div className="pt-3 border-t">
              <Button
                variant="outline"
                className="w-full button-outline"
                onClick={() => {
                  handleSignOut()
                  setMobileMenuOpen(false)
                }}
              >
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}