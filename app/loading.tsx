export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 bg-teal-600 rounded-lg flex items-center justify-center mx-auto mb-4">
          <span className="text-white font-bold text-lg">B</span>
        </div>
        <div className="animate-spin w-6 h-6 border-2 border-teal-600 border-t-transparent rounded-full mx-auto mb-2"></div>
        <p className="text-gray-600">Loading BittieTasks...</p>
      </div>
    </div>
  )
}