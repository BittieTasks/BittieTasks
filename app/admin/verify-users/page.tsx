'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, Mail, RefreshCw, Trash2 } from 'lucide-react'
import { useToast } from '@/app/hooks/use-toast'

interface UnverifiedUser {
  id: string
  email: string
  created_at: string
  user_metadata: {
    first_name: string
    last_name: string
  }
}

export default function AdminVerifyUsersPage() {
  const [users, setUsers] = useState<UnverifiedUser[]>([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState<string | null>(null)
  const { toast } = useToast()

  const fetchUnverifiedUsers = async () => {
    try {
      const response = await fetch('/api/auth/unconfirmed-users')
      const data = await response.json()
      setUsers(data.unconfirmedUsers || [])
    } catch (error) {
      console.error('Error fetching users:', error)
      toast({
        title: "Error",
        description: "Failed to fetch unverified users",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const resendEmail = async (userId: string, email: string) => {
    setProcessing(userId)
    try {
      const response = await fetch('/api/auth/send-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, email })
      })

      if (response.ok) {
        toast({
          title: "Email Sent",
          description: `Verification email sent to ${email}`
        })
      } else {
        throw new Error('Failed to send email')
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send verification email",
        variant: "destructive"
      })
    } finally {
      setProcessing(null)
    }
  }

  const manualVerify = async (userId: string, email: string) => {
    setProcessing(userId)
    try {
      // Create a valid token for immediate verification
      const response = await fetch('/api/auth/manual-verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, email })
      })

      if (response.ok) {
        toast({
          title: "User Verified",
          description: `${email} has been manually verified`
        })
        // Refresh the list
        fetchUnverifiedUsers()
      } else {
        throw new Error('Failed to verify user')
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to manually verify user",
        variant: "destructive"
      })
    } finally {
      setProcessing(null)
    }
  }

  useEffect(() => {
    fetchUnverifiedUsers()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-teal-600" />
          <p className="text-gray-600">Loading unverified users...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">User Verification Admin</h1>
          <p className="text-gray-600">Manage users who haven't verified their email addresses</p>
        </div>

        <div className="grid gap-4 mb-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Unverified Users</span>
                <Badge variant="secondary">
                  {users.length} pending
                </Badge>
              </CardTitle>
              <CardDescription>
                Users who have signed up but haven't verified their email addresses
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={fetchUnverifiedUsers} 
                variant="outline" 
                className="mb-4"
                disabled={loading}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh List
              </Button>

              {users.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-500" />
                  <p className="text-lg font-medium">All users verified!</p>
                  <p>No pending email verifications</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {users.map((user) => (
                    <div key={user.id} className="border rounded-lg p-4 bg-white">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium text-gray-900">
                            {user.user_metadata.first_name} {user.user_metadata.last_name}
                          </h3>
                          <p className="text-sm text-gray-600">{user.email}</p>
                          <p className="text-xs text-gray-400">
                            Signed up: {new Date(user.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button
                            onClick={() => resendEmail(user.id, user.email)}
                            disabled={processing === user.id}
                            variant="outline"
                            size="sm"
                          >
                            <Mail className="w-4 h-4 mr-1" />
                            Resend Email
                          </Button>
                          
                          <Button
                            onClick={() => manualVerify(user.id, user.email)}
                            disabled={processing === user.id}
                            size="sm"
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Manual Verify
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Manual Verification Instructions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Option 1: Use Admin Panel Above</h4>
              <p className="text-sm text-gray-600">Click "Manual Verify" to immediately verify any user</p>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Option 2: Supabase Dashboard</h4>
              <ol className="text-sm text-gray-600 space-y-1 ml-4">
                <li>1. Go to Supabase Dashboard → Authentication → Users</li>
                <li>2. Find user with email_confirmed_at = null</li>
                <li>3. Edit user and set email_confirmed_at to current timestamp</li>
                <li>4. Save changes</li>
              </ol>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}