import { PhoneSignupForm } from '@/components/auth/phone-signup-form'

export default function SignupPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Join BittieTasks</h1>
          <p className="mt-2 text-gray-600">Start earning with community tasks</p>
        </div>
        
        <PhoneSignupForm />
      </div>
    </div>
  )
}