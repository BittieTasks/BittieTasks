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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <div className="px-6 pt-8 pb-6">
        <div className="max-w-6xl mx-auto">
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-6 flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">B</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">BittieTasks</h1>
                <p className="text-gray-400">Welcome back, {user?.user_metadata?.firstName || 'User'}!</p>
              </div>
            </div>
            <Button 
              onClick={handleSignOut}
              variant="outline" 
              className="border-gray-600 bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white"
            >
              Sign Out
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-6 pb-12">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Verification Status */}
          {!isVerified && (
            <Card className="bg-yellow-500/10 border-yellow-500/20 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <AlertCircle className="h-6 w-6 text-yellow-500" />
                  <div>
                    <h3 className="text-yellow-500 font-semibold">Email Verification Required</h3>
                    <p className="text-gray-300">Please check your email and verify your account to access all earning features.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Stats Grid */}
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="bg-gray-800/50 backdrop-blur-sm border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                    <DollarSign className="h-6 w-6 text-green-400" />
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Total Earnings</p>
                    <p className="text-2xl font-bold text-white">$0.00</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/50 backdrop-blur-sm border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                    <Target className="h-6 w-6 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Active Tasks</p>
                    <p className="text-2xl font-bold text-white">0</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/50 backdrop-blur-sm border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                    <Calendar className="h-6 w-6 text-purple-400" />
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">This Month</p>
                    <p className="text-2xl font-bold text-white">0 Tasks</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Account & Subscription Info */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="bg-gray-800/50 backdrop-blur-sm border-gray-700">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-white">
                  <User className="h-5 w-5" />
                  Account Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Email</span>
                  <div className="flex items-center gap-2">
                    <span className="text-white">{user?.email}</span>
                    {isVerified ? (
                      <Badge className="bg-green-500/20 text-green-400 border-green-500/20">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Verified
                      </Badge>
                    ) : (
                      <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/20">
                        <AlertCircle className="w-3 h-3 mr-1" />
                        Pending
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Member Since</span>
                  <span className="text-white">{user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'Today'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Profile</span>
                  <span className="text-white">{user?.user_metadata?.firstName} {user?.user_metadata?.lastName}</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/50 backdrop-blur-sm border-gray-700">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-white">
                  <Crown className="h-5 w-5 text-yellow-500" />
                  Subscription Plan
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Current Plan</span>
                  <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/20">Free</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Monthly Tasks</span>
                  <span className="text-white">5 remaining</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Platform Fee</span>
                  <span className="text-white">10%</span>
                </div>
                <Button 
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 border-0 mt-4"
                  onClick={() => router.push('/subscriptions')}
                >
                  Upgrade Plan
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card className="bg-gray-800/50 backdrop-blur-sm border-gray-700">
            <CardHeader className="pb-4">
              <CardTitle className="text-white">Quick Actions</CardTitle>
              <CardDescription className="text-gray-400">
                {isVerified 
                  ? "Ready to start earning! Create your first task or browse opportunities." 
                  : "Complete email verification to unlock earning features."}
              </CardDescription>
            </CardHeader>
            <CardContent className="grid md:grid-cols-3 gap-4">
              <Button 
                className={`h-16 ${isVerified 
                  ? 'bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 border-blue-500/20' 
                  : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                }`}
                disabled={!isVerified}
                onClick={() => router.push('/create-task')}
              >
                <div className="text-center">
                  <div className="text-2xl mb-1">➕</div>
                  <div>Create Task</div>
                </div>
              </Button>
              
              <Button 
                className={`h-16 ${isVerified 
                  ? 'bg-green-500/20 hover:bg-green-500/30 text-green-400 border-green-500/20' 
                  : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                }`}
                disabled={!isVerified}
                onClick={() => router.push('/marketplace')}
              >
                <div className="text-center">
                  <div className="text-2xl mb-1">🔍</div>
                  <div>Browse Tasks</div>
                </div>
              </Button>
              
              <Button 
                className={`h-16 ${isVerified 
                  ? 'bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 border-purple-500/20' 
                  : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                }`}
                disabled={!isVerified}
                onClick={() => router.push('/earnings')}
              >
                <div className="text-center">
                  <div className="text-2xl mb-1">📊</div>
                  <div>View Earnings</div>
                </div>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}