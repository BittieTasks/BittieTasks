'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, DollarSign, Home, Search, Plus, TrendingUp, Settings, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/components/auth/AuthProvider'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function PlatformNavigation() {
  const [isOpen, setIsOpen] = useState(false)
  const { signOut } = useAuth()
  const router = useRouter()

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
  }

  const navItems = [
    { name: 'Dashboard', href: '/platform', icon: Home },
    { name: 'Marketplace', href: '/marketplace', icon: Search },
    { name: 'Create Task', href: '/create-task', icon: Plus },
    { name: 'Earnings', href: '/earnings', icon: TrendingUp },
    { name: 'Subscriptions', href: '/subscriptions', icon: Settings },
  ]

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden lg:block bg-white/80 backdrop-blur-md border-b border-emerald-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/platform" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-blue-500 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
                BittieTasks
              </span>
            </Link>

            <div className="flex items-center space-x-8">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="flex items-center space-x-2 text-gray-700 hover:text-emerald-600 transition-colors"
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.name}</span>
                </Link>
              ))}
              <Button
                variant="outline"
                onClick={handleSignOut}
                className="border-red-300 text-red-700 hover:bg-red-50"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <nav className="lg:hidden bg-white/80 backdrop-blur-md border-b border-emerald-100 sticky top-0 z-40">
        <div className="px-4 sm:px-6">
          <div className="flex justify-between items-center h-16">
            <Link href="/platform" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-blue-500 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
                BittieTasks
              </span>
            </Link>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-700"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="border-t border-emerald-100 bg-white/95 backdrop-blur-md"
            >
              <div className="px-4 py-6 space-y-4">
                {navItems.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center space-x-3 text-gray-700 hover:text-emerald-600 transition-colors py-2"
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="font-medium">{item.name}</span>
                  </Link>
                ))}
                <Button
                  variant="outline"
                  onClick={handleSignOut}
                  className="w-full border-red-300 text-red-700 hover:bg-red-50 justify-start"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-emerald-100 z-50">
        <div className="grid grid-cols-5 py-2">
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="flex flex-col items-center justify-center py-2 text-gray-600 hover:text-emerald-600 transition-colors"
            >
              <item.icon className="w-5 h-5" />
              <span className="text-xs mt-1 font-medium">{item.name}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Add padding to prevent content from being hidden behind bottom nav on mobile */}
      <div className="lg:hidden h-20" />
    </>
  )
}