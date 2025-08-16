'use client'

import dynamic from 'next/dynamic'

// Dynamically import the unified app component with barter section
const UnifiedAppRouter = dynamic(() => import('@/components/UnifiedAppRouter'), {
  loading: () => (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading barter exchange...</p>
      </div>
    </div>
  )
})

export default function BarterTasksPage() {
  return <UnifiedAppRouter />
}