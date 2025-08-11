'use client'

export default function TestBoldPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white">
      <div className="p-8">
        <h1 className="text-4xl font-bold text-white mb-4">Bold Design Test</h1>
        <div className="bg-gradient-to-r from-pink-500 to-violet-600 p-4 rounded-lg">
          <p className="text-white">If you see this with purple background and pink/violet gradient, the bold design is working!</p>
        </div>
        <div className="mt-4 bg-gradient-to-br from-green-400 to-blue-500 p-4 rounded-lg">
          <p className="text-white">Green to blue gradient test</p>
        </div>
      </div>
    </div>
  )
}