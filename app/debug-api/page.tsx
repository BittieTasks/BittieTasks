'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function DebugAPIPage() {
  const [results, setResults] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const log = (message: string) => {
    setResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`])
    console.log(message)
  }

  const testDirectFetch = async () => {
    setResults([])
    setIsLoading(true)
    
    try {
      log('🚀 Starting direct fetch test...')
      
      const testData = { phoneNumber: '+15551234567' }
      log(`📦 Sending: ${JSON.stringify(testData)}`)
      
      const response = await fetch('/api/auth/send-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testData),
      })
      
      log(`📊 Status: ${response.status}`)
      log(`🔍 OK: ${response.ok}`)
      log(`📋 Headers: ${JSON.stringify(Object.fromEntries(response.headers.entries()))}`)
      
      const text = await response.text()
      log(`📝 Raw response: ${text}`)
      
      try {
        const data = JSON.parse(text)
        log(`📄 Parsed JSON: ${JSON.stringify(data)}`)
        
        if (response.ok) {
          log('✅ SUCCESS!')
        } else {
          log(`❌ ERROR: ${data.error || 'Unknown error'}`)
        }
      } catch (parseError) {
        log(`❌ JSON Parse Error: ${parseError}`)
      }
      
    } catch (fetchError: any) {
      log(`💥 FETCH ERROR: ${fetchError.message}`)
      log(`💥 Error name: ${fetchError.name}`)
      log(`💥 Error stack: ${fetchError.stack}`)
    } finally {
      setIsLoading(false)
    }
  }

  const testWithXHR = async () => {
    setResults([])
    setIsLoading(true)
    
    try {
      log('🚀 Starting XMLHttpRequest test...')
      
      const xhr = new XMLHttpRequest()
      xhr.open('POST', '/api/auth/send-verification')
      xhr.setRequestHeader('Content-Type', 'application/json')
      
      xhr.onload = () => {
        log(`📊 XHR Status: ${xhr.status}`)
        log(`📝 XHR Response: ${xhr.responseText}`)
        setIsLoading(false)
      }
      
      xhr.onerror = () => {
        log(`❌ XHR Error occurred`)
        setIsLoading(false)
      }
      
      const testData = { phoneNumber: '+15551234567' }
      xhr.send(JSON.stringify(testData))
      
    } catch (error: any) {
      log(`💥 XHR ERROR: ${error.message}`)
      setIsLoading(false)
    }
  }

  const testNetworkInfo = () => {
    setResults([])
    log('🌐 Network Information:')
    log(`- URL: ${window.location.href}`)
    log(`- Origin: ${window.location.origin}`)
    log(`- Protocol: ${window.location.protocol}`)
    log(`- Host: ${window.location.host}`)
    log(`- User Agent: ${navigator.userAgent}`)
    log(`- Online: ${navigator.onLine}`)
    
    if ('connection' in navigator) {
      const connection = (navigator as any).connection
      log(`- Connection type: ${connection?.effectiveType || 'unknown'}`)
    }
  }

  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>API Debug Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Button 
              onClick={testDirectFetch} 
              disabled={isLoading}
              variant="default"
            >
              {isLoading ? 'Testing...' : 'Test Fetch API'}
            </Button>
            
            <Button 
              onClick={testWithXHR} 
              disabled={isLoading}
              variant="outline"
            >
              {isLoading ? 'Testing...' : 'Test XMLHttpRequest'}
            </Button>
            
            <Button 
              onClick={testNetworkInfo} 
              variant="secondary"
            >
              Network Info
            </Button>
          </div>
          
          <div className="bg-gray-100 p-4 rounded-lg max-h-96 overflow-y-auto">
            <div className="text-sm font-mono space-y-1">
              {results.map((result, index) => (
                <div key={index}>{result}</div>
              ))}
              {results.length === 0 && (
                <div className="text-gray-500">Click a test button to see results...</div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}