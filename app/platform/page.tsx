'use client'

import { useAuth } from '../../components/auth/AuthProvider'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Navigation from '@/components/Navigation'
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
      <div className="page-layout">
        <div className="container-clean section-clean flex items-center justify-center min-h-screen">
          <div className="card-clean p-12 text-center max-w-md mx-auto">
            <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary mb-4" />
            <p className="text-body text-muted-foreground">Loading your BittieTasks platform...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    router.push('/auth')
    return null
  }

  return (
    <div className="page-layout">
      <Navigation />
      
      <main className="page-content">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-heading mb-2">Welcome back, {user?.user_metadata?.firstName || 'User'}!</h1>
          <p className="text-body text-muted-foreground">
            Here's your BittieTasks dashboard
          </p>
        </div>

        {/* Verification Status */}
        {!isVerified && (
          <Card className="mb-8 border-yellow-200 bg-yellow-50">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-6 w-6 text-yellow-600" />
                <div>
                  <h3 className="font-semibold text-yellow-800">Email Verification Required</h3>
                  <p className="text-yellow-700">Please check your email and verify your account to access all earning features.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="card-clean">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-small text-muted-foreground">Total Earnings</p>
                  <p className="text-2xl font-bold">$0.00</p>
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