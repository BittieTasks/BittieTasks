'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
// Layout components - using simple div layouts
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle, Star, Crown, ArrowRight } from 'lucide-react'

const planDetails = {
  pro: {
    name: 'Pro Plan',
    icon: Star,
    color: 'text-teal-600',
    bgColor: 'bg-teal-100',
    features: ['50 tasks per month', '7% platform fee', 'Priority support', 'Performance analytics']
  },
  premium: {
    name: 'Premium Plan',
    icon: Crown,
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
    features: ['Unlimited tasks', '5% platform fee', 'Premium support', 'Ad-free experience', 'Premium badge']
  }
}

function SubscriptionSuccessContent() {
  const searchParams = useSearchParams()
  const planId = searchParams.get('plan') || 'pro'
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <div>Loading...</div>
  }

  const plan = planDetails[planId as keyof typeof planDetails]
  
  if (!plan) {
    return (
      <div className="min-h-screen bg-gray-50">
        <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Invalid Plan</h1>
            <Button asChild>
              <a href="/marketplace">Go to Marketplace</a>
            </Button>
          </div>
        </main>
      </div>
    )
  }

  const IconComponent = plan.icon

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex justify-between items-center h-16">
            <a href="/" className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-teal-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">B</span>
              </div>
              <span className="text-xl font-semibold text-gray-900">BittieTasks</span>
            </a>
            <div className="flex items-center space-x-6">
              <a href="/marketplace" className="text-gray-700 hover:text-teal-600 font-medium">
                Marketplace
              </a>
              <a href="/dashboard" className="text-gray-700 hover:text-teal-600 font-medium">
                Dashboard
              </a>
            </div>
          </div>
        </div>
      </header>
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <div className="text-center">
          {/* Success Animation */}
          <div className="mb-8">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <h1 className="text-4xl font-bold mb-2">Subscription Active!</h1>
            <p className="text-xl text-gray-600">
              Welcome to the {plan.name} - you're all set to maximize your earnings!
            </p>
          </div>

          {/* Plan Details Card */}
          <Card className="max-w-2xl mx-auto mb-8">
            <CardHeader className="text-center">
              <div className={`w-16 h-16 ${plan.bgColor} rounded-xl flex items-center justify-center mx-auto mb-4`}>
                <IconComponent className={`h-8 w-8 ${plan.color}`} />
              </div>
              <CardTitle className="text-2xl">{plan.name}</CardTitle>
              <CardDescription>Your new subscription is now active</CardDescription>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h3 className="font-semibold text-green-800 mb-2">What happens now?</h3>
                  <ul className="text-sm text-green-700 space-y-1">
                    <li>• Lower platform fees apply to all new task earnings</li>
                    <li>• Enhanced features are immediately available</li>
                    <li>• Your monthly task limit has been increased</li>
                    <li>• Priority support is now enabled</li>
                  </ul>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="font-medium">Your Benefits:</h4>
                    <ul className="space-y-1">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-center gap-2 text-sm">
                          <CheckCircle className="h-3 w-3 text-green-500" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium mb-2">Next Steps:</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>1. Browse available tasks</li>
                      <li>2. Join tasks you're interested in</li>
                      <li>3. Complete tasks and earn more</li>
                      <li>4. Track your progress in dashboard</li>
                    </ul>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 pt-6">
                  <Button asChild className="bg-teal-600 hover:bg-teal-700 flex-1">
                    <a href="/marketplace" className="flex items-center justify-center gap-2">
                      Start Earning Now
                      <ArrowRight className="h-4 w-4" />
                    </a>
                  </Button>
                  <Button asChild variant="outline" className="flex-1">
                    <a href="/dashboard">View Dashboard</a>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Additional Info */}
          <div className="text-center text-sm text-gray-500">
            <p>Questions about your subscription? Contact our support team anytime.</p>
            <p className="mt-1">You can manage your subscription in your account settings.</p>
          </div>
        </div>
      </main>
    </div>
  )
}

export default function SubscriptionSuccessPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SubscriptionSuccessContent />
    </Suspense>
  )
}