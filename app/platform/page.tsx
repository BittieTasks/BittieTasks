'use client'

import { useAuth } from '../../components/auth/AuthProvider'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import BoldNavigation from '@/components/BoldNavigation'
import BoldLayout from '@/components/BoldLayout'
import { Badge } from '@/components/ui/badge'
import { useRouter } from 'next/navigation'
import { Loader2, User, Mail, CheckCircle, AlertCircle, Crown, DollarSign, Calendar, Target, TrendingUp, Users, BarChart3 } from 'lucide-react'
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
      <BoldLayout>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '16px',
            padding: '48px',
            textAlign: 'center',
            maxWidth: '400px',
            margin: '0 auto'
          }}>
            <Loader2 style={{ margin: '0 auto 16px auto', animation: 'spin 1s linear infinite' }} size={48} color="white" />
            <p style={{ color: 'rgba(255, 255, 255, 0.8)', margin: 0 }}>Loading your BittieTasks platform...</p>
          </div>
        </div>
      </BoldLayout>
    )
  }

  if (!isAuthenticated) {
    router.push('/auth')
    return null
  }

  return (
    <BoldLayout>
      <BoldNavigation />
      
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '48px 24px' }}>
        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '36px', fontWeight: 'bold', marginBottom: '8px', color: 'white' }}>
            Welcome back, {user?.user_metadata?.firstName || 'User'}!
          </h1>
          <p style={{ fontSize: '18px', color: 'rgba(255, 255, 255, 0.8)' }}>
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
                <DollarSign size={24} color="white" />
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
    </BoldLayout>
  )
}