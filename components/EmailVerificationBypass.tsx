'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useToast } from '@/app/hooks/use-toast'
import { AlertTriangle, Mail, Settings } from 'lucide-react'

// TEMPORARY: Development component for bypassing SendGrid limitations
// This should be removed once SendGrid is properly configured

export default function EmailVerificationBypass() {
  const [email, setEmail] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const { toast } = useToast()

  const handleBypassVerification = async () => {
    if (!email) {
      toast({
        title: "Email Required",
        description: "Please enter the email address to bypass verification.",
        variant: "destructive"
      })
      return
    }

    setIsProcessing(true)
    
    try {
      const response = await fetch('/api/auth/bypass-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email })
      })

      if (!response.ok) {
        throw new Error('Failed to bypass verification')
      }

      toast({
        title: "Verification Bypassed",
        description: "Email verification has been bypassed for development. You can now sign in.",
      })

      // Redirect to auth page for sign in
      window.location.href = '/auth'

    } catch (error) {
      console.error('Bypass error:', error)
      toast({
        title: "Bypass Failed",
        description: "Could not bypass email verification. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-orange-100">
          <Settings className="h-5 w-5 text-orange-600" />
        </div>
        <CardTitle className="text-xl font-semibold">Development Mode</CardTitle>
        <CardDescription>
          Bypass email verification for development due to SendGrid limitations
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
            <p className="text-sm text-yellow-800">
              This is a temporary development feature
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email to verify"
              className="w-full"
            />
          </div>

          <Button 
            onClick={handleBypassVerification}
            disabled={isProcessing}
            className="w-full"
          >
            {isProcessing ? (
              <>
                <Mail className="mr-2 h-4 w-4 animate-spin" />
                Bypassing...
              </>
            ) : (
              <>
                <Settings className="mr-2 h-4 w-4" />
                Bypass Verification
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}