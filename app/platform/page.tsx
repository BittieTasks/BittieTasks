'use client'

import { useAuth } from '../../components/auth/AuthProvider'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import CleanNavigation from '@/components/CleanNavigation'
import CleanLayout from '@/components/CleanLayout'
import { Badge } from '@/components/ui/badge'
import { useRouter } from 'next/navigation'
import { Loader2, User, Mail, CheckCircle, AlertCircle, Crown, Coins, Calendar, Target, TrendingUp, Users, BarChart3 } from 'lucide-react'
import { useState, useEffect } from 'react'

export default function PlatformPage() {
  const { user, session, loading, isAuthenticated, isVerified, signOut } = useAuth()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  if (loading) {
    return (
      <CleanLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="bg-white rounded-xl shadow-lg p-12 text-center max-w-md mx-auto">
            <Loader2 className="h-12 w-12 mx-auto mb-4 animate-spin text-teal-600" />
            <p className="text-gray-600">Loading your BittieTasks platform...</p>
          </div>
        </div>
      </CleanLayout>
    )
  }

  if (!isAuthenticated) {
    router.push('/auth')
    return null
  }

  return (
    <CleanLayout>
      <CleanNavigation />
      
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2 text-gray-900">
            Welcome back, {user?.user_metadata?.firstName || 'User'}!
          </h1>
          <p className="text-lg text-gray-600">
            Here's your BittieTasks dashboard
          </p>
        </div>

        {/* Verification Status */}
        {!isVerified && (
          <div style={{
            background: 'rgba(251, 191, 36, 0.2)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(251, 191, 36, 0.3)',
            borderRadius: '16px',
            padding: '24px',
            marginBottom: '32px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <AlertCircle size={24} color="rgb(251, 191, 36)" />
              <div>
                <h3 style={{ fontWeight: '600', color: 'rgb(251, 191, 36)', marginBottom: '4px' }}>Email Verification Required</h3>
                <p style={{ color: 'rgba(255, 255, 255, 0.9)', margin: 0 }}>Please check your email and verify your account to access all earning features.</p>
              </div>
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', marginBottom: '32px' }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '16px',
            padding: '24px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{
                width: '48px',
                height: '48px',
                background: 'linear-gradient(to right, rgb(34, 197, 94), rgb(22, 163, 74))',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Coins size={24} color="white" />
              </div>
              <div>
                <p style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.6)', marginBottom: '4px' }}>Total Earnings</p>
                <p style={{ fontSize: '24px', fontWeight: 'bold', color: 'white', margin: 0 }}>$0.00</p>
              </div>
            </div>
          </div>

          <div style={{
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '16px',
            padding: '24px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{
                width: '48px',
                height: '48px',
                background: 'linear-gradient(to right, rgb(59, 130, 246), rgb(37, 99, 235))',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Target size={24} color="white" />
              </div>
              <div>
                <p style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.6)', marginBottom: '4px' }}>Active Tasks</p>
                <p style={{ fontSize: '24px', fontWeight: 'bold', color: 'white', margin: 0 }}>0</p>
              </div>
            </div>
          </div>

          <div style={{
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '16px',
            padding: '24px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{
                width: '48px',
                height: '48px',
                background: 'linear-gradient(to right, rgb(139, 92, 246), rgb(124, 58, 237))',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Calendar size={24} color="white" />
              </div>
              <div>
                <p style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.6)', marginBottom: '4px' }}>This Month</p>
                <p style={{ fontSize: '24px', fontWeight: 'bold', color: 'white', margin: 0 }}>0 Tasks</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </CleanLayout>
  )
}