'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle, Crown, Zap, Star, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import PlatformNavigation from '@/components/platform/PlatformNavigation'
import { loadStripe } from '@stripe/stripe-js'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_VITE_STRIPE_PUBLIC_KEY!)

export default function SubscriptionsPage() {
  const [loading, setLoading] = useState<string | null>(null)

  const plans = [
    {
      id: 'free',
      name: 'Free',
      price: 0,
      fee: 10,
      description: 'Perfect for getting started',
      features: [
        'Basic task access',
        'Community support',
        'Mobile app access',
        'Standard payment processing',
        'Basic analytics'
      ],
      popular: false,
      icon: Zap,
      color: 'gray'
    },
    {
      id: 'pro',
      name: 'Pro',
      price: 9.99,
      fee: 7,
      description: 'Most popular for regular earners',
      features: [
        'Everything in Free',
        'Priority task notifications',
        'Advanced analytics',
        'Higher-paying task access',
        'Direct messaging',
        'Custom scheduling',
        'Priority support'
      ],
      popular: true,
      icon: Star,
      color: 'emerald',
      priceId: 'price_pro_monthly' // Replace with actual Stripe price ID
    },
    {
      id: 'premium',
      name: 'Premium',
      price: 19.99,
      fee: 5,
      description: 'Maximum earnings for power users',
      features: [
        'Everything in Pro',
        'Exclusive high-value tasks',
        'Personal success coach',
        'VIP community access',
        'Advanced scheduling tools',
        'White-glove support',
        'Early feature access',
        'Monthly strategy calls'
      ],
      popular: false,
      icon: Crown,
      color: 'purple',
      priceId: 'price_premium_monthly' // Replace with actual Stripe price ID
    }
  ]

  const handleUpgrade = async (plan: typeof plans[0]) => {
    if (plan.id === 'free') return

    setLoading(plan.id)

    try {
      const stripe = await stripePromise
      if (!stripe) throw new Error('Stripe failed to load')

      const response = await fetch('/api/stripe/create-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId: plan.priceId,
        }),
      })

      const { clientSecret, error } = await response.json()

      if (error) {
        throw new Error(error)
      }

      const { error: stripeError } = await stripe.confirmPayment({
        clientSecret,
        confirmParams: {
          return_url: `${window.location.origin}/platform?subscription=success`,
        },
      })

      if (stripeError) {
        throw new Error(stripeError.message)
      }
    } catch (err: any) {
      console.error('Subscription error:', err)
      alert('Failed to process subscription. Please try again.')
    } finally {
      setLoading(null)
    }
  }

  const calculateSavings = (fee: number) => {
    const baseFee = 10
    const savings = ((baseFee - fee) / baseFee) * 100
    return Math.round(savings)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-blue-50 to-purple-50">
      <PlatformNavigation />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 lg:pb-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Choose Your Earning Plan
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Lower platform fees mean higher earnings for you. Upgrade to unlock premium features and maximize your income.
          </p>
        </motion.div>

        {/* Earnings Calculator */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-r from-emerald-500 to-blue-500 rounded-2xl p-6 text-white mb-12"
        >
          <h2 className="text-2xl font-bold mb-4">See Your Potential Earnings</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <div key={plan.id} className="bg-white/20 rounded-lg p-4">
                <div className="text-lg font-semibold mb-2">{plan.name} Plan</div>
                <div className="text-sm opacity-90 mb-3">{plan.fee}% platform fee</div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>$100 earned:</span>
                    <span className="font-bold">${(100 * (1 - plan.fee / 100)).toFixed(0)} to you</span>
                  </div>
                  <div className="flex justify-between">
                    <span>$500 earned:</span>
                    <span className="font-bold">${(500 * (1 - plan.fee / 100)).toFixed(0)} to you</span>
                  </div>
                  <div className="flex justify-between">
                    <span>$1000 earned:</span>
                    <span className="font-bold">${(1000 * (1 - plan.fee / 100)).toFixed(0)} to you</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
              className="relative"
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                  <Badge className="bg-gradient-to-r from-emerald-500 to-blue-500 text-white px-4 py-1">
                    Most Popular
                  </Badge>
                </div>
              )}
              
              <Card className={`h-full ${plan.popular ? 'ring-2 ring-emerald-500 shadow-xl scale-105' : ''} bg-white/90 backdrop-blur-sm border-0`}>
                <CardHeader className="text-center pb-6">
                  <div className={`w-16 h-16 bg-${plan.color}-100 rounded-full flex items-center justify-center mx-auto mb-4`}>
                    <plan.icon className={`w-8 h-8 text-${plan.color}-600`} />
                  </div>
                  <CardTitle className="text-2xl font-bold text-gray-900">{plan.name}</CardTitle>
                  <div className="space-y-2">
                    <div className="text-4xl font-bold text-gray-900">
                      ${plan.price}
                      <span className="text-lg text-gray-600">/month</span>
                    </div>
                    <div className="text-lg font-semibold text-emerald-600">
                      {plan.fee}% platform fee
                    </div>
                    {plan.fee < 10 && (
                      <Badge className="bg-green-100 text-green-800">
                        Save {calculateSavings(plan.fee)}% on fees
                      </Badge>
                    )}
                  </div>
                  <CardDescription className="text-gray-600">{plan.description}</CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                  <ul className="space-y-3">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start">
                        <CheckCircle className="w-5 h-5 text-emerald-500 mr-3 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    className={`w-full py-6 text-lg font-semibold ${
                      plan.popular
                        ? 'bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600 text-white'
                        : plan.id === 'free'
                        ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                        : 'bg-white border-2 border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                    onClick={() => handleUpgrade(plan)}
                    disabled={loading === plan.id || plan.id === 'free'}
                  >
                    {loading === plan.id ? (
                      <div className="flex items-center">
                        <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2" />
                        Processing...
                      </div>
                    ) : plan.id === 'free' ? (
                      'Current Plan'
                    ) : (
                      <>
                        Upgrade to {plan.name}
                        <ArrowRight className="w-5 h-5 ml-2" />
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* FAQ Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-16"
        >
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
            Frequently Asked Questions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {[
              {
                question: 'Can I change plans anytime?',
                answer: 'Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately.'
              },
              {
                question: 'How does billing work?',
                answer: 'You\'re billed monthly on the same date you subscribed. Platform fees are deducted from each task payout automatically.'
              },
              {
                question: 'What if I want to cancel?',
                answer: 'You can cancel anytime from your account settings. You\'ll keep premium features until your current billing period ends.'
              },
              {
                question: 'Do higher plans get better tasks?',
                answer: 'Yes! Pro and Premium members get early access to high-paying sponsored tasks and exclusive opportunities.'
              }
            ].map((faq, index) => (
              <Card key={index} className="bg-white/80 backdrop-blur-sm border-0">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-gray-900 mb-2">{faq.question}</h3>
                  <p className="text-gray-600">{faq.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>
      </main>
    </div>
  )
}