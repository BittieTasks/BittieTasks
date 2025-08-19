'use client'

import { useEffect, useState } from 'react'

interface EnvStatus {
  supabaseUrl: boolean
  supabaseKey: boolean  
  nodeEnv: string
  timestamp: string
}

export default function ProductionStatus() {
  const [envStatus, setEnvStatus] = useState<EnvStatus | null>(null)

  useEffect(() => {
    // Check environment variables on client
    const status: EnvStatus = {
      supabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      supabaseKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      nodeEnv: process.env.NODE_ENV || 'unknown',
      timestamp: new Date().toISOString()
    }
    
    console.log('=== PRODUCTION ENV STATUS ===', {
      supabaseUrl: status.supabaseUrl ? 'LOADED' : 'MISSING',
      supabaseKey: status.supabaseKey ? 'LOADED' : 'MISSING', 
      nodeEnv: status.nodeEnv,
      actualUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Present' : 'Missing',
      actualKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Present' : 'Missing'
    })
    
    setEnvStatus(status)
  }, [])

  if (!envStatus) return null

  // Only show in development or if there are issues
  if (envStatus.nodeEnv === 'production' && envStatus.supabaseUrl && envStatus.supabaseKey) {
    return null
  }

  return (
    <div className="fixed top-0 left-0 right-0 bg-red-600 text-white text-center py-2 z-50">
      <div className="text-sm">
        🚨 ENV CHECK - URL: {envStatus.supabaseUrl ? '✅' : '❌'} | 
        KEY: {envStatus.supabaseKey ? '✅' : '❌'} | 
        MODE: {envStatus.nodeEnv} | 
        TIME: {envStatus.timestamp.split('T')[1].substring(0, 8)}
      </div>
    </div>
  )
}