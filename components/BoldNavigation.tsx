'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from './auth/AuthProvider'
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
  { path: '/platform', label: 'Dashboard', icon: Home },
  { path: '/marketplace', label: 'Marketplace', icon: Search },
  { path: '/earnings', label: 'Earnings', icon: Coins },
  { path: '/subscriptions', label: 'Plans', icon: Crown },
  { path: '/sponsors', label: 'Sponsors', icon: Briefcase },
  { path: '/create-task', label: 'Create', icon: PlusCircle },
]

export default function BoldNavigation() {
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
      <nav style={{ 
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)', 
        backdropFilter: 'blur(10px)', 
        background: 'rgba(255, 255, 255, 0.05)',
        position: 'sticky',
        top: '0',
        zIndex: '50'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 clamp(16px, 4vw, 24px)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 'clamp(56px, 10vw, 64px)' }}>
            {/* Logo */}
            <div 
              style={{ display: 'flex', alignItems: 'center', gap: 'clamp(8px, 2vw, 12px)', cursor: 'pointer' }}
              onClick={() => router.push('/')}
            >
              <div 
                style={{
                  width: 'clamp(32px, 8vw, 40px)',
                  height: 'clamp(32px, 8vw, 40px)',
                  background: 'linear-gradient(to right, rgb(236, 72, 153), rgb(139, 92, 246))',
                  borderRadius: 'clamp(8px, 2vw, 12px)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transform: 'rotate(3deg)',
                  transition: 'transform 0.2s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'rotate(0deg) scale(1.05)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'rotate(3deg)'}
              >
                <span style={{ color: 'white', fontWeight: 'bold', fontSize: 'clamp(14px, 3vw, 18px)' }}>B</span>
              </div>
              <span style={{ fontSize: 'clamp(16px, 4vw, 20px)', fontWeight: 'bold', color: 'white' }}>BittieTasks</span>
            </div>

            {/* Mobile Menu Button */}
            <button
              style={{
                display: 'md:none',
                padding: '8px',
                background: 'transparent',
                border: 'none',
                color: 'white',
                cursor: 'pointer'
              }}
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Desktop Navigation Links */}
            <div style={{ display: 'none', alignItems: 'center', gap: '8px' }} className="hidden md:flex">
              {navigationItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.path
                
                return (
                  <button
                    key={item.path}
                    onClick={() => router.push(item.path)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 16px',
                      borderRadius: '8px',
                      background: isActive 
                        ? 'linear-gradient(to right, rgb(236, 72, 153), rgb(139, 92, 246))' 
                        : 'transparent',
                      color: 'white',
                      border: 'none',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      fontSize: '14px',
                      fontWeight: '500'
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.background = 'transparent'
                      }
                    }}
                  >
                    <Icon size={16} />
                    <span className="hidden lg:inline">{item.label}</span>
                  </button>
                )
              })}
            </div>

            {/* User Menu - Desktop */}
            <div style={{ display: 'none', alignItems: 'center', gap: '12px' }} className="hidden md:flex">
              {!isVerified && (
                <span style={{ 
                  background: 'rgba(251, 191, 36, 0.2)', 
                  color: 'rgb(251, 191, 36)', 
                  padding: '4px 12px', 
                  borderRadius: '20px', 
                  fontSize: '12px',
                  fontWeight: '500',
                  border: '1px solid rgba(251, 191, 36, 0.3)'
                }}>
                  Verify Email
                </span>
              )}
              
              <button
                onClick={handleSignOut}
                style={{
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  color: 'white',
                  background: 'transparent',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  fontWeight: '500',
                  transition: 'all 0.2s ease',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation Menu */}
      {mobileMenuOpen && (
        <div 
          style={{
            position: 'fixed',
            top: 'clamp(56px, 10vw, 64px)',
            left: '0',
            right: '0',
            background: 'rgba(0, 0, 0, 0.95)',
            backdropFilter: 'blur(10px)',
            zIndex: '40',
            padding: '16px',
            maxHeight: 'calc(100vh - 64px)',
            overflowY: 'auto'
          }}
          className="md:hidden"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {navigationItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.path
              
              return (
                <button
                  key={item.path}
                  onClick={() => {
                    router.push(item.path)
                    setMobileMenuOpen(false)
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '16px',
                    borderRadius: '12px',
                    background: isActive 
                      ? 'linear-gradient(to right, rgb(236, 72, 153), rgb(139, 92, 246))' 
                      : 'rgba(255, 255, 255, 0.1)',
                    color: 'white',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '16px',
                    fontWeight: '500',
                    textAlign: 'left',
                    width: '100%',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <Icon size={20} />
                  {item.label}
                </button>
              )
            })}
            
            {/* Mobile User Actions */}
            <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.2)', paddingTop: '16px', marginTop: '16px' }}>
              {!isVerified && (
                <div style={{ 
                  background: 'rgba(251, 191, 36, 0.2)', 
                  color: 'rgb(251, 191, 36)', 
                  padding: '12px 16px', 
                  borderRadius: '12px', 
                  fontSize: '14px',
                  fontWeight: '500',
                  border: '1px solid rgba(251, 191, 36, 0.3)',
                  marginBottom: '12px',
                  textAlign: 'center'
                }}>
                  Please verify your email
                </div>
              )}
              
              <button
                onClick={() => {
                  handleSignOut()
                  setMobileMenuOpen(false)
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  width: '100%',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  color: 'white',
                  background: 'transparent',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  fontWeight: '500',
                  fontSize: '16px',
                  cursor: 'pointer'
                }}
              >
                <User size={16} />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}