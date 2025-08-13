import { PhoneLoginForm } from '@/components/auth/phone-login-form'

export default function PhoneLoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">BittieTasks</h1>
          <p className="text-gray-600">Welcome back to your neighborhood marketplace.</p>
        </div>
        
        <PhoneLoginForm />
        
        <div className="text-center mt-6">
          <p className="text-sm text-gray-600">
            Don't have an account?{' '}
            <a href="/auth/phone-signup" className="text-blue-600 hover:underline font-medium">
              Join BittieTasks
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}