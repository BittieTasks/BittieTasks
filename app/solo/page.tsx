'use client'

import dynamic from 'next/dynamic'

// Dynamically import the unified app component with solo section
const UnifiedAppRouter = dynamic(() => import('@/components/UnifiedAppRouter'), {
  loading: () => (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-cyan-100 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading solo tasks...</p>
      </div>
    </div>
  )
})

export default function SoloTasksPage() {
  return <UnifiedAppRouter />
}