'use client'

import { useState } from 'react'
// Layout components - using simple div layouts instead of missing components
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, Star, Zap, Crown, Shield, Users } from 'lucide-react'
import { loadStripe } from '@stripe/stripe-js'
import { Elements } from '@stripe/react-stripe-js'
import { SubscriptionCheckout } from '@/components/payments/SubscriptionCheckout'
import { useAuth } from '@/components/auth/AuthProvider'

// Initialize Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || process.env.VITE_STRIPE_PUBLIC_KEY || '')

const subscriptionPlans = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    priceId: null,
    description: 'Perfect for getting started',
    platformFee: '10%',
    taskLimit: 5,
    features: [
      '5 tasks per month',
      '10% platform fee',
      'Community support',
      'Basic task categories',
      'Standard payout timing'
    ],
    color: 'border-gray-200',
    popular: false,
    icon: Users
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 9.99,
    priceId: 'pro',
    description: 'For active community members',
    platformFee: '7%',
    taskLimit: 50,
    features: [
      '50 tasks per month',
      '7% platform fee (save 30%)',
      'Priority support',
      'All task categories',
      'Faster payouts',
      'Task performance analytics'
    ],
    color: 'border-teal-200',
    popular: true,
    icon: Star
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 19.99,
    priceId: 'premium',
    description: 'For power earners',
    platformFee: '5%',
    taskLimit: -1,
    features: [
      'Unlimited tasks',
      '5% platform fee (save 50%)',
      'Premium support',
      'Early access to sponsored tasks',
      'Instant payouts',
      'Premium badge',
      'Ad-free experience',
      'Advanced analytics'
    ],
    color: 'border-purple-200',
    popular: false,
    icon: Crown
  }
]

export default function SubscriptionPage() {
  const { isAuthenticated, user } = useAuth()
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
  const [clientSecret, setClientSecret] = useState<string | null>(null)

  if (!isAuthenticated) {
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
              <a href="/auth" className="px-4 py-2 text-gray-700 hover:text-teal-600 font-medium">
                Sign In
              </a>
            </div>
          </div>
        </header>
        <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-4">Sign in to view subscription plans</h1>
            <p className="text-gray-600 mb-8">
              Access our subscription tiers to reduce platform fees and unlock premium features.
            </p>
            <Button asChild>
              <a href="/auth">Sign In</a>
            </Button>
          </div>
        </main>
      </div>
    )
  }

  const handleSelectPlan = async (planId: string) => {
    if (planId === 'free') {
      // Handle free plan selection - just update user tier
      return
    }

    try {
      setSelectedPlan(planId)
      
      const response = await fetch('/api/stripe/create-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ planType: planId })
      })

      if (!response.ok) {
        throw new Error('Failed to create subscription')
      }

      const { clientSecret } = await response.json()
      setClientSecret(clientSecret)
    } catch (error) {
      console.error('Error creating subscription:', error)
      setSelectedPlan(null)
    }
  }

  if (clientSecret && selectedPlan) {
    return (
      <Elements stripe={stripePromise} options={{ clientSecret }}>
        <div className="min-h-screen bg-gray-50">
          <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
            <SubscriptionCheckout 
              planId={selectedPlan}
              onCancel={() => {
                setSelectedPlan(null)
                setClientSecret(null)
              }}
            />
          </main>
        </div>
      </Elements>
    )
  }

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
              <a href="/subscription" className="text-teal-600 font-medium">
                Plans
              </a>
              <a href="/dashboard" className="text-gray-700 hover:text-teal-600 font-medium">
                Dashboard
              </a>
            </div>
          </div>
        </div>
      </header>
      
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Choose Your
            <span className="text-teal-600 block">Earning Plan</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Reduce platform fees and unlock premium features to maximize your earning potential 
            in the BittieTasks community.
          </p>
          
          {/* Savings Highlight */}
          <div className="inline-flex items-center space-x-2 bg-green-50 text-green-700 px-6 py-3 rounded-lg mb-8">
            <CheckCircle className="h-5 w-5" />
            <span className="font-semibold">Save up to 50% in platform fees with Premium</span>
          </div>
        </div>

        {/* Subscription Plans */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {subscriptionPlans.map((plan) => {
            const IconComponent = plan.icon
            return (
              <Card 
                key={plan.id} 
                className={`${plan.color} ${plan.popular ? 'ring-2 ring-teal-500' : ''} relative hover:shadow-lg transition-shadow`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-teal-600 text-white px-4 py-1">
                      Most Popular
                    </Badge>
                  </div>
                )}
                
                <CardHeader className="text-center pb-4">
                  <div className={`w-12 h-12 ${plan.id === 'free' ? 'bg-gray-100' : plan.id === 'pro' ? 'bg-teal-100' : 'bg-purple-100'} rounded-xl flex items-center justify-center mx-auto mb-4`}>
                    <IconComponent className={`h-6 w-6 ${plan.id === 'free' ? 'text-gray-600' : plan.id === 'pro' ? 'text-teal-600' : 'text-purple-600'}`} />
                  </div>
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <CardDescription className="text-base">{plan.description}</CardDescription>
                  
                  <div className="mt-4">
                    <div className="flex items-baseline justify-center">
                      <span className="text-4xl font-bold">
                        {plan.price === 0 ? 'Free' : `$${plan.price}`}
                      </span>
                      {plan.price > 0 && (
                        <span className="text-gray-500 ml-1">/month</span>
                      )}
                    </div>
                    <div className="text-lg font-semibold text-teal-600 mt-2">
                      {plan.platformFee} platform fee
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-6">
                  <div className="space-y-3">
                    {plan.features.map((feature, index) => (
                      <div key={index} className="flex items-start space-x-3">
                        <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <Button 
                    className={`w-full ${plan.id === 'free' ? 'bg-gray-600 hover:bg-gray-700' : plan.id === 'pro' ? 'bg-teal-600 hover:bg-teal-700' : 'bg-purple-600 hover:bg-purple-700'}`}
                    onClick={() => handleSelectPlan(plan.id)}
                    disabled={selectedPlan === plan.id}
                  >
                    {selectedPlan === plan.id ? 'Processing...' : 
                     plan.id === 'free' ? 'Current Plan' : 
                     `Upgrade to ${plan.name}`}
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* FAQ */}
        <Card className="border-gray-200">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Frequently Asked Questions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-semibold mb-2">Can I change my plan anytime?</h3>
                <p className="text-gray-600 text-sm">
                  Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">How do platform fees work?</h3>
                <p className="text-gray-600 text-sm">
                  Platform fees are deducted from your task earnings. Higher tiers mean lower fees and more money in your pocket.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">What payment methods do you accept?</h3>
                <p className="text-gray-600 text-sm">
                  We accept all major credit cards, debit cards, and digital wallets through Stripe.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Is there a contract?</h3>
                <p className="text-gray-600 text-sm">
                  No contracts! All subscriptions are month-to-month and you can cancel anytime.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}