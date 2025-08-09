'use client'

import { useAuth } from '../../components/auth/AuthProvider'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useRouter } from 'next/navigation'
import { Loader2, User, Mail, CheckCircle, AlertCircle, Crown, DollarSign, Calendar, Target } from 'lucide-react'

export default function PlatformPage() {
  const { user, session, loading, isAuthenticated, isVerified, signOut } = useAuth()
  const router = useRouter()

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}>
        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          borderRadius: '16px',
          padding: '40px',
          textAlign: 'center',
          boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
        }}>
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-blue-600 mb-4" />
          <p className="text-gray-600">Loading your BittieTasks platform...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    router.push('/auth')
    return null
  }

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px',
    }}>
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-8">
        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          borderRadius: '16px',
          padding: '24px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <div className="flex items-center gap-4">
            <div style={{
              width: '50px',
              height: '50px',
              background: '#3b82f6',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px',
            }}>
              👥
            </div>
            <div>
              <h1 className="text-2xl font-bold">Welcome to BittieTasks</h1>
              <p className="text-gray-600">Your community earnings platform</p>
            </div>
          </div>
          <Button variant="outline" onClick={handleSignOut}>
            Sign Out
          </Button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* User Profile Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Your Profile
              </CardTitle>
              <CardDescription>Account information and verification status</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-gray-400" />
                <span className="text-sm">{user?.email}</span>
                {isVerified ? (
                  <Badge variant="default" className="gap-1">
                    <CheckCircle className="h-3 w-3" />
                    Verified
                  </Badge>
                ) : (
                  <Badge variant="destructive" className="gap-1">
                    <AlertCircle className="h-3 w-3" />
                    Unverified
                  </Badge>
                )}
              </div>
              
              {user?.user_metadata?.firstName && (
                <div>
                  <p className="text-sm text-gray-600">Name</p>
                  <p className="font-medium">
                    {user.user_metadata.firstName} {user.user_metadata.lastName}
                  </p>
                </div>
              )}

              <div>
                <p className="text-sm text-gray-600">Member Since</p>
                <p className="font-medium">
                  {new Date(user?.created_at || '').toLocaleDateString()}
                </p>
              </div>

              {!isVerified && (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    Please check your email to verify your account and unlock all features.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Subscription Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="h-5 w-5" />
                Subscription
              </CardTitle>
              <CardDescription>Your current plan and benefits</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Badge variant="outline" className="text-lg font-semibold">
                  Free Plan
                </Badge>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Monthly Tasks</span>
                  <span className="font-medium">0 / 5</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Platform Fee</span>
                  <span className="font-medium">10%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Priority Support</span>
                  <span className="text-red-500">No</span>
                </div>
              </div>

              <Button className="w-full" disabled={!isVerified}>
                {isVerified ? 'Upgrade to Pro' : 'Verify Email to Upgrade'}
              </Button>
            </CardContent>
          </Card>

          {/* Earnings Dashboard */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Earnings Overview
              </CardTitle>
              <CardDescription>Your income and achievements</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Total Earned</p>
                  <p className="text-2xl font-bold text-green-600">$0.00</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">This Month</p>
                  <p className="text-2xl font-bold text-blue-600">$0.00</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Tasks Completed</span>
                  <span className="font-medium">0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Active Tasks</span>
                  <span className="font-medium">0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Referrals</span>
                  <span className="font-medium">0</span>
                </div>
              </div>

              {isVerified ? (
                <Button className="w-full">
                  Create Your First Task
                </Button>
              ) : (
                <Button disabled className="w-full">
                  Verify Email to Start Earning
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="md:col-span-2 lg:col-span-3">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                {isVerified 
                  ? "Start your BittieTasks journey with these actions"
                  : "Verify your email to unlock these features"
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Button 
                  variant="outline" 
                  className="h-auto p-4 flex flex-col items-center gap-2"
                  disabled={!isVerified}
                >
                  <Calendar className="h-6 w-6" />
                  <span className="font-medium">Share a Task</span>
                  <span className="text-xs text-gray-600 text-center">
                    Post daily activities neighbors can join
                  </span>
                </Button>

                <Button 
                  variant="outline" 
                  className="h-auto p-4 flex flex-col items-center gap-2"
                  disabled={!isVerified}
                >
                  <Target className="h-6 w-6" />
                  <span className="font-medium">Browse Tasks</span>
                  <span className="text-xs text-gray-600 text-center">
                    Find tasks in your neighborhood
                  </span>
                </Button>

                <Button 
                  variant="outline" 
                  className="h-auto p-4 flex flex-col items-center gap-2"
                  disabled={!isVerified}
                >
                  <Crown className="h-6 w-6" />
                  <span className="font-medium">Upgrade Plan</span>
                  <span className="text-xs text-gray-600 text-center">
                    Lower fees, more tasks, priority support
                  </span>
                </Button>

                <Button 
                  variant="outline" 
                  className="h-auto p-4 flex flex-col items-center gap-2"
                  disabled={!isVerified}
                >
                  <User className="h-6 w-6" />
                  <span className="font-medium">Complete Profile</span>
                  <span className="text-xs text-gray-600 text-center">
                    Add location, bio, and preferences
                  </span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}