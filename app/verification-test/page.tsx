'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, XCircle, Send, Smartphone, Mail } from 'lucide-react'

export default function VerificationTestPage() {
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [emailResult, setEmailResult] = useState<any>(null)
  const [phoneResult, setPhoneResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const testEmailVerification = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/auth/send-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })
      const result = await response.json()
      setEmailResult({ ...result, status: response.status, timestamp: new Date().toISOString() })
    } catch (error: any) {
      setEmailResult({ error: error.message, status: 'ERROR', timestamp: new Date().toISOString() })
    }
    setLoading(false)
  }

  const testPhoneVerification = async () => {
    setLoading(true)
    try {
      // Test phone verification endpoint
      const response = await fetch('/api/auth/send-phone-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: phone })
      })
      const result = await response.json()
      setPhoneResult({ ...result, status: response.status, timestamp: new Date().toISOString() })
    } catch (error: any) {
      setPhoneResult({ error: error.message, status: 'ERROR', timestamp: new Date().toISOString() })
    }
    setLoading(false)
  }

  const testSendGridStatus = async () => {
    try {
      const response = await fetch('/api/auth/test-sendgrid', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ test: true })
      })
      const result = await response.json()
      setEmailResult({ ...result, status: response.status, timestamp: new Date().toISOString(), type: 'sendgrid_test' })
    } catch (error: any) {
      setEmailResult({ error: error.message, status: 'ERROR', timestamp: new Date().toISOString(), type: 'sendgrid_test' })
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="text-center py-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Verification System Test</h1>
          <p className="text-slate-600">Test email and SMS verification functionality</p>
        </div>

        {/* Email Testing */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5 text-teal-600" />
              Email Verification Test
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                type="email"
                placeholder="Enter email address to test"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1"
              />
              <Button 
                onClick={testEmailVerification}
                disabled={!email || loading}
                className="bg-teal-600 hover:bg-teal-700"
              >
                <Send className="w-4 h-4 mr-2" />
                Test Email
              </Button>
              <Button 
                onClick={testSendGridStatus}
                variant="outline"
                disabled={loading}
              >
                Test SendGrid
              </Button>
            </div>
            
            {emailResult && (
              <div className="bg-slate-50 p-4 rounded-lg border">
                <div className="flex items-center gap-2 mb-2">
                  {emailResult.success ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-600" />
                  )}
                  <Badge variant={emailResult.success ? 'default' : 'destructive'}>
                    Status {emailResult.status}
                  </Badge>
                  <span className="text-sm text-slate-500">{emailResult.timestamp}</span>
                </div>
                <pre className="text-sm text-slate-700 whitespace-pre-wrap">
                  {JSON.stringify(emailResult, null, 2)}
                </pre>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Phone Testing */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-blue-600" />
              SMS Verification Test
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                type="tel"
                placeholder="Enter phone number (e.g., +15551234567)"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="flex-1"
              />
              <Button 
                onClick={testPhoneVerification}
                disabled={!phone || loading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Send className="w-4 h-4 mr-2" />
                Test SMS
              </Button>
            </div>
            
            {phoneResult && (
              <div className="bg-slate-50 p-4 rounded-lg border">
                <div className="flex items-center gap-2 mb-2">
                  {phoneResult.success ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-600" />
                  )}
                  <Badge variant={phoneResult.success ? 'default' : 'destructive'}>
                    Status {phoneResult.status}
                  </Badge>
                  <span className="text-sm text-slate-500">{phoneResult.timestamp}</span>
                </div>
                <pre className="text-sm text-slate-700 whitespace-pre-wrap">
                  {JSON.stringify(phoneResult, null, 2)}
                </pre>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>Troubleshooting Guide</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Email Issues:</h4>
              <ul className="text-sm text-slate-600 space-y-1 ml-4">
                <li>• Check spam/junk folder for verification emails</li>
                <li>• Ensure email address matches exactly what was used to sign up</li>
                <li>• SendGrid sender verification may be required</li>
                <li>• Test with the "Test SendGrid" button above</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">SMS Issues:</h4>
              <ul className="text-sm text-slate-600 space-y-1 ml-4">
                <li>• Verify Twilio account has SMS sending enabled</li>
                <li>• Check Twilio phone number verification status</li>
                <li>• Ensure phone number includes country code (e.g., +1 for US)</li>
                <li>• Free Twilio accounts can only send to verified numbers</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-2">For Testing:</h4>
              <ul className="text-sm text-slate-600 space-y-1 ml-4">
                <li>• Use real.test@gmail.com (created user ID: 0c205d6f-eb0e-43b8-9684-6a3ccbd14a32)</li>
                <li>• Use test@example.com (created user ID: bc986173-b042-477c-8f9b-f13936c9be68)</li>
                <li>• Check browser console for additional error details</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}