'use client'

import { useEffect, useState } from 'react'

export default function HomePage() {
  const [mounted, setMounted] = useState(false)
  const [debugInfo, setDebugInfo] = useState('Initializing...')

  useEffect(() => {
    setMounted(true)
    setDebugInfo('Component mounted')
    
    // Add debug logging
    console.log('HomePage mounted, checking auth...')
  }, [])

  if (!mounted) {
    return null // Return nothing during SSR
  }

  // Temporary debug return - showing simple content first
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
      <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-8 text-center max-w-md">
        <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4">
          <span className="text-white font-bold text-2xl">B</span>
        </div>
        <h1 className="text-3xl font-bold text-white mb-4">BittieTasks</h1>
        <p className="text-gray-300 mb-4">Testing page load...</p>
        <p className="text-green-400 text-sm">Debug: {debugInfo}</p>
        <button 
          className="mt-4 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all"
          onClick={() => setDebugInfo(`Clicked at ${new Date().toLocaleTimeString()}`)}
        >
          Test Click
        </button>
      </div>
    </div>
  )
}