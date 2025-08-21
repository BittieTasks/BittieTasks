'use client'

import { useAuth } from '@/components/auth/SimpleAuthProvider'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle, XCircle, Loader2, User, Mail, Clock } from 'lucide-react'

interface AuthStatusProps {
  showDetails?: boolean
}

export function AuthStatus({ showDetails = true }: AuthStatusProps) {
  const { user, isAuthenticated, loading, signOut } = useAuth()

  if (loading) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            Authentication Loading
          </CardTitle>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            {isAuthenticated ? (
              <CheckCircle className="h-5 w-5 text-green-600" />
            ) : (
              <XCircle className="h-5 w-5 text-red-500" />
            )}
            Authentication Status
          </span>
          <Badge variant={isAuthenticated ? "default" : "secondary"}>
            {isAuthenticated ? "Authenticated" : "Not Authenticated"}
          </Badge>
        </CardTitle>
        {showDetails && (
          <CardDescription>
            {isAuthenticated ? (
              "Session is active and ready for platform use"
            ) : (
              "Please sign in to access platform features"
            )}
          </CardDescription>
        )}
      </CardHeader>

      {showDetails && (
        <CardContent className="space-y-4">
          {isAuthenticated && user ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                <User className="h-4 w-4 text-gray-600" />
                <div>
                  <p className="text-sm font-medium">User ID</p>
                  <p className="text-xs text-gray-600">{user.id}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                <Mail className="h-4 w-4 text-gray-600" />
                <div>
                  <p className="text-sm font-medium">Email</p>
                  <p className="text-xs text-gray-600">{user.email}</p>
                </div>
              </div>

              {user.email_confirmed_at && (
                <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <div>
                    <p className="text-sm font-medium text-green-800">Email Verified</p>
                    <p className="text-xs text-green-600">
                      Verified on {new Date(user.email_confirmed_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              )}

              {user.created_at && (
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                  <Clock className="h-4 w-4 text-gray-600" />
                  <div>
                    <p className="text-sm font-medium">Member Since</p>
                    <p className="text-xs text-gray-600">
                      {new Date(user.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              )}

              <Button 
                onClick={signOut} 
                variant="outline" 
                size="sm"
                className="w-full"
              >
                Sign Out
              </Button>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-sm text-gray-600 mb-4">
                No active session found. Please sign in to continue.
              </p>
              <Button 
                onClick={() => window.location.href = '/auth'} 
                className="w-full"
              >
                Go to Sign In
              </Button>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  )
}

export default AuthStatus