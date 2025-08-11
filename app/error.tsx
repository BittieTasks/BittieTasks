'use client'

import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('App error:', error)
  }, [error])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center max-w-md mx-auto px-4">
        <div className="w-8 h-8 bg-teal-600 rounded-lg flex items-center justify-center mx-auto mb-4">
          <span className="text-white font-bold text-lg">B</span>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Something went wrong!</h2>
        <p className="text-gray-600 mb-6">We're having trouble loading the page. Let's try again.</p>
        <button
          onClick={() => reset()}
          className="px-6 py-3 bg-teal-600 text-white font-medium rounded-lg hover:bg-teal-700 transition-colors"
        >
          Try again
        </button>
      </div>
    </div>
  )
}