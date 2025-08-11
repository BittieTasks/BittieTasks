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

        {/* Quick Actions */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '32px' }}>
          <button
            onClick={() => router.push('/marketplace')}
            style={{
              height: '96px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              background: 'linear-gradient(to right, rgb(236, 72, 153), rgb(139, 92, 246))',
              color: 'white',
              borderRadius: '12px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: '500',
              transition: 'all 0.2s ease',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            <BarChart3 size={24} />
            <span>Browse Tasks</span>
          </button>

          <button
            onClick={() => router.push('/create-task')}
            style={{
              height: '96px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              color: 'white',
              borderRadius: '12px',
              cursor: 'pointer',
              fontWeight: '500',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
          >
            <Target size={24} />
            <span>Create Task</span>
          </button>

          <button
            onClick={() => router.push('/earnings')}
            style={{
              height: '96px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              color: 'white',
              borderRadius: '12px',
              cursor: 'pointer',
              fontWeight: '500',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
          >
            <DollarSign size={24} />
            <span>View Earnings</span>
          </button>

          <button
            onClick={() => router.push('/subscriptions')}
            style={{
              height: '96px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              color: 'white',
              borderRadius: '12px',
              cursor: 'pointer',
              fontWeight: '500',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
          >
            <Crown size={24} />
            <span>Upgrade Plan</span>
          </button>
        </div>

        {/* Getting Started */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '16px',
            padding: '24px'
          }}>
            <h3 style={{ fontSize: '20px', fontWeight: '600', color: 'white', marginBottom: '16px' }}>Getting Started</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <CheckCircle size={20} color="rgb(34, 197, 94)" />
                <span style={{ color: 'rgba(255, 255, 255, 0.9)' }}>Set up your profile</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <AlertCircle size={20} color="rgb(251, 191, 36)" />
                <span style={{ color: 'rgba(255, 255, 255, 0.9)' }}>Complete email verification</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <AlertCircle size={20} color="rgba(255, 255, 255, 0.4)" />
                <span style={{ color: 'rgba(255, 255, 255, 0.9)' }}>Browse available tasks</span>
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
            <h3 style={{ fontSize: '20px', fontWeight: '600', color: 'white', marginBottom: '16px' }}>Latest Activity</h3>
            <p style={{ color: 'rgba(255, 255, 255, 0.7)', textAlign: 'center', padding: '40px 0' }}>
              No recent activity yet. Start by browsing available tasks!
            </p>
          </div>
        </div>
      </main>
    </BoldLayout>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-clean">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Target className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-small text-muted-foreground">Active Tasks</p>
                  <p className="text-2xl font-bold">0</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-clean">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-small text-muted-foreground">This Month</p>
                  <p className="text-2xl font-bold">0 Tasks</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Button 
            className="h-24 flex-col space-y-2 button-clean"
            onClick={() => router.push('/marketplace')}
          >
            <BarChart3 className="h-6 w-6" />
            <span>Browse Tasks</span>
          </Button>

          <Button 
            className="h-24 flex-col space-y-2 button-outline"
            onClick={() => router.push('/create-task')}
            variant="outline"
          >
            <Target className="h-6 w-6" />
            <span>Create Task</span>
          </Button>

          <Button 
            className="h-24 flex-col space-y-2 button-outline"
            onClick={() => router.push('/earnings')}
            variant="outline"
          >
            <DollarSign className="h-6 w-6" />
            <span>View Earnings</span>
          </Button>

          <Button 
            className="h-24 flex-col space-y-2 button-outline"
            onClick={() => router.push('/subscriptions')}
            variant="outline"
          >
            <Crown className="h-6 w-6" />
            <span>Upgrade Plan</span>
          </Button>
        </div>

        {/* Getting Started */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="card-clean">
            <CardHeader>
              <CardTitle className="text-subheading">Getting Started</CardTitle>
              <CardDescription>Complete these steps to start earning</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                {isVerified ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <div className="w-5 h-5 border-2 border-muted rounded-full" />
                )}
                <span className={isVerified ? 'text-green-600' : 'text-muted-foreground'}>
                  Verify your email address
                </span>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 border-2 border-muted rounded-full" />
                <span className="text-muted-foreground">Complete your profile</span>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 border-2 border-muted rounded-full" />
                <span className="text-muted-foreground">Join your first task</span>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 border-2 border-muted rounded-full" />
                <span className="text-muted-foreground">Create your first task</span>
              </div>
            </CardContent>
          </Card>

          <Card className="card-clean">
            <CardHeader>
              <CardTitle className="text-subheading">Your Plan</CardTitle>
              <CardDescription>Free plan with 10% platform fees</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Platform Fee</span>
                  <span className="font-semibold">10%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Monthly Task Limit</span>
                  <span className="font-semibold">5 tasks</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Support Level</span>
                  <span className="font-semibold">Email</span>
                </div>
                
                <Button 
                  className="w-full button-clean mt-4"
                  onClick={() => router.push('/subscriptions')}
                >
                  Upgrade to Pro
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}