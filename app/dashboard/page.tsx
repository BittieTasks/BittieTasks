'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/auth/AuthProvider'
import { useToast } from '@/hooks/use-toast'
import CleanLayout from '@/components/CleanLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { 
  Coins, Award, Clock, Star, Plus, ChevronDown, Users, Calendar, MapPin, 
  TrendingUp 
} from 'lucide-react'

interface UserStats {
  total_earnings: number
  tasks_completed: number
  active_tasks: number
  rating: number
  achievements: string[]
  monthly_goal: number
  subscription_tier: string
}

interface TaskActivity {
  id: string
  title: string
  status: 'applied' | 'accepted' | 'completed' | 'verified'
  payout: number
  location: string
  applied_at: string
  task_type: 'shared' | 'solo' | 'sponsored'
}

export default function Dashboard() {
  const { user, isAuthenticated, loading: authLoading, signOut } = useAuth()
  const { toast } = useToast()
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Authentication Required</h2>
          <p className="text-gray-600 mb-6">You need to be signed in to view your dashboard.</p>
          <Button 
            onClick={() => router.push('/auth')}
            className="bg-teal-600 hover:bg-teal-700 text-white"
          >
            Sign In
          </Button>
        </div>
      </div>
    )
  }

  return (
    <CleanLayout>
      <div className="min-h-screen bg-gray-50 pb-20">
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                    Welcome back, {user?.email?.split('@')[0] || 'User'}!
                  </h1>
                  <Badge className="bg-gray-100 text-gray-800">Free</Badge>
                </div>
                <p className="text-gray-600">
                  Track your earnings, manage tasks, and grow your community impact
                </p>
              </div>
              <div className="flex items-center gap-4">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button className="bg-teal-600 hover:bg-teal-700 text-white" data-testid="dropdown-explore-tasks">
                      <Plus className="w-4 h-4 mr-2" />
                      Explore Tasks
                      <ChevronDown className="w-4 h-4 ml-2" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuItem onClick={() => router.push('/solo')} className="cursor-pointer">
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-teal-500 rounded-full mr-3"></div>
                        <div>
                          <div className="font-medium">Solo Tasks</div>
                          <div className="text-xs text-gray-500">Platform funded • 3% fee</div>
                        </div>
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push('/community')} className="cursor-pointer">
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                        <div>
                          <div className="font-medium">Community Tasks</div>
                          <div className="text-xs text-gray-500">Peer coordination • 7% fee</div>
                        </div>
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push('/corporate')} className="cursor-pointer">
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
                        <div>
                          <div className="font-medium">Corporate Tasks</div>
                          <div className="text-xs text-gray-500">Business partnerships • 15% fee</div>
                        </div>
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push('/barter')} className="cursor-pointer">
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                        <div>
                          <div className="font-medium">Barter Exchange</div>
                          <div className="text-xs text-gray-500">Trade services • 0% fees</div>
                        </div>
                      </div>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button
                  variant="outline"
                  onClick={async () => {
                    try {
                      await signOut()
                      toast({
                        title: "Signed Out",
                        description: "You have been successfully signed out.",
                      })
                    } catch (error) {
                      toast({
                        title: "Sign Out Failed",
                        description: "There was an error signing out. Please try again.",
                        variant: "destructive",
                      })
                    }
                  }}
                  className="text-gray-600 border-gray-300 hover:bg-gray-50"
                  data-testid="button-sign-out"
                >
                  Sign Out
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-6">
          <Card className="bg-white shadow-sm border border-gray-200">
            <CardContent className="p-6">
              <div className="text-center">
                <div className="text-gray-400 mb-4">
                  <Clock className="w-12 h-12 mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Dashboard Loading</h3>
                <p className="text-gray-500 mb-4">
                  Your dashboard is being set up. All authentication and task features are working properly.
                </p>
                <Button 
                  onClick={() => router.push('/solo')}
                  className="bg-teal-600 hover:bg-teal-700 text-white"
                >
                  Start with Solo Tasks
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </CleanLayout>
  )
}