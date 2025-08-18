'use client'

import { SubscriptionButton } from '@/components/SubscriptionButton'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Check, Zap, Crown } from 'lucide-react'

interface SubscriptionPlan {
  name: string
  price: number
  features: string[]
  icon: React.ReactNode
  popular?: boolean
}

const SUBSCRIPTION_PLANS: Record<string, SubscriptionPlan> = {
  pro: {
    name: 'Pro',
    price: 9.99,
    icon: <Zap className="h-6 w-6" />,
    features: [
      'Apply to unlimited tasks',
      'Priority task matching',
      'Advanced filters',
      'Email notifications',
      'Mobile app access'
    ]
  },
  premium: {
    name: 'Premium',
    price: 19.99,
    icon: <Crown className="h-6 w-6" />,
    popular: true,
    features: [
      'Everything in Pro',
      'Create unlimited tasks',
      'Featured task listings',
      'AI-powered verification',
      'Priority customer support',
      '24/7 live chat'
    ]
  }
}

export default function SubscribePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Choose Your Plan
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Unlock premium features and earn more with BittieTasks
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          {Object.entries(SUBSCRIPTION_PLANS).map(([planType, plan]) => (
            <Card 
              key={planType} 
              className={`relative ${plan.popular ? 'ring-2 ring-blue-500 shadow-lg scale-105' : ''}`}
              data-testid={`plan-card-${planType}`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                    Most Popular
                  </span>
                </div>
              )}
              
              <CardHeader className="text-center pb-6">
                <div className="flex justify-center mb-4">
                  <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
                    {plan.icon}
                  </div>
                </div>
                <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                <CardDescription className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  ${plan.price}
                  <span className="text-base font-normal text-gray-600 dark:text-gray-400">/month</span>
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <ul className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-3">
                      <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                      <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <SubscriptionButton
                  planType={planType as 'pro' | 'premium'}
                  planName={plan.name}
                  price={plan.price}
                  className={`w-full py-3 ${
                    plan.popular 
                      ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-900 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white'
                  }`}
                />
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Cancel anytime. No hidden fees. Secure payments powered by Stripe.
          </p>
        </div>
      </div>
    </div>
  )
}