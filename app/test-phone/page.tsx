'use client'

import { useState } from 'react'
import { PhoneSignupForm } from '@/components/auth/phone-signup-form'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function TestPhonePage() {
  const [testResults, setTestResults] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const testAPI = async (endpoint: string, data: any) => {
    try {
      setIsLoading(true)
      console.log(`🧪 Testing ${endpoint} with:`, data)
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      console.log(`📊 ${endpoint} status:`, response.status)
      console.log(`📋 ${endpoint} headers:`, Object.fromEntries(response.headers.entries()))

      let result
      try {
        result = await response.json()
        console.log(`📄 ${endpoint} data:`, result)
      } catch (parseError) {
        console.error(`❌ ${endpoint} JSON parse error:`, parseError)
        setTestResults(prev => [...prev, `💥 ${endpoint}: JSON parse error - ${parseError}`])
        return
      }
      
      if (response.ok) {
        setTestResults(prev => [...prev, `✅ ${endpoint}: ${result.message || 'Success'}`])
      } else {
        setTestResults(prev => [...prev, `❌ ${endpoint}: ${result.error || 'Failed'}`])
      }
    } catch (error: any) {
      console.error(`💥 ${endpoint} fetch error:`, error)
      setTestResults(prev => [...prev, `💥 ${endpoint}: ${error.message} (${error.name})`])
    } finally {
      setIsLoading(false)
    }
  }

  const runTests = async () => {
    setTestResults([])
    
    // Test send verification
    await testAPI('/api/auth/send-verification', { phoneNumber: '+15551234567' })
    
    // Wait a bit then test verification
    setTimeout(async () => {
      await testAPI('/api/auth/verify-phone', { 
        phoneNumber: '+15551234567', 
        code: '123456' // This will fail but we can see the error
      })
    }, 1000)
  }

  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* API Test Panel */}
        <Card>
          <CardHeader>
            <CardTitle>API Test Panel</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={runTests} 
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? 'Testing...' : 'Test Phone APIs'}
            </Button>
            
            <div className="space-y-2 text-sm">
              {testResults.map((result, index) => (
                <div key={index} className="p-2 bg-gray-100 rounded">
                  {result}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Phone Signup Form */}
        <Card>
          <CardHeader>
            <CardTitle>Phone Signup Test</CardTitle>
          </CardHeader>
          <CardContent>
            <PhoneSignupForm onSuccess={() => {
              alert('Signup successful!')
            }} />
          </CardContent>
        </Card>
      </div>
      
      <div className="mt-8 text-center">
        <p className="text-sm text-gray-600">
          Use test phone number: (555) 123-4567 for development testing
        </p>
      </div>
    </div>
  )
}