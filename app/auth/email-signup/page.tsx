import { EmailSignupForm } from '@/components/auth/email-signup-form'

export default function EmailSignupPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">BittieTasks</h1>
          <p className="text-gray-600">Connect with your neighbors. Start earning today.</p>
        </div>
        
        <EmailSignupForm />
        
        <div className="text-center mt-6 space-y-2">
          <p className="text-sm text-gray-600">
            Prefer phone verification?{' '}
            <a href="/auth/phone-signup" className="text-blue-600 hover:underline font-medium">
              Sign up with phone
            </a>
          </p>
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <a href="/auth/phone-login" className="text-blue-600 hover:underline font-medium">
              Sign in here
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}