'use client'

import { useState } from 'react'
import { useAuth } from '../../components/auth/AuthProvider'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useRouter } from 'next/navigation'
import { Check, Crown, Star, Zap, Shield, TrendingUp, Users, DollarSign } from 'lucide-react'
import Navigation from '@/components/Navigation'

const plans = [
  {
    name: 'Free',
    price: 0,
    period: 'month',
    description: 'Perfect for getting started',
    platformFee: 10,
    taskLimit: 5,
    features: [
      '5 tasks per month',
      '10% platform fee',
      'Basic task creation',
      'Community access',
      'Email support'
    ],
    limitations: [
      'Limited task visibility',
      'Standard support only',
      'Ads included'
    ],
    current: true,
    cta: 'Current Plan'
  },
  {
    name: 'Pro',
    price: 9.99,
    period: 'month',
    description: 'For active community members',
    platformFee: 7,
    taskLimit: 25,
    features: [
      '25 tasks per month',
      '7% platform fee (save 30%)',
      'Priority task placement',
      'Advanced analytics',
      'Direct messaging',
      'Custom task categories',
      'Ad-free experience',
      'Priority email support'
    ],
    popular: true,
    cta: 'Upgrade to Pro'
  },
  {
    name: 'Premium',
    price: 19.99,
    period: 'month',
    description: 'For power users and entrepreneurs',
    platformFee: 5,
    taskLimit: 'Unlimited',
    features: [
      'Unlimited tasks',
      '5% platform fee (save 50%)',
      'Featured task promotion',
      'Advanced matching algorithm',
      'Corporate sponsorship access',
      'Bulk task management',
      'Premium badge & verification',
      'Phone & chat support',
      'Early access to new features',
      'Revenue analytics dashboard'
    ],
    cta: 'Upgrade to Premium'
  }
]

const annualDiscount = 0.2 // 20% off

export default function SubscriptionsPage() {
  const { user, isAuthenticated, isVerified } = useAuth()
  const router = useRouter()
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly')
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)

  if (!isAuthenticated) {
    router.push('/auth')
    return null
  }

  const handlePlanSelection = (planName: string) => {
    if (planName === 'Free') return
    
    setSelectedPlan(planName)
    // Here we would integrate with Stripe
    console.log(`Selected plan: ${planName} - ${billingCycle}`)
  }

  const calculatePrice = (basePrice: number) => {
    if (billingCycle === 'annual') {
      return basePrice * 12 * (1 - annualDiscount)
    }
    return basePrice
  }

  const formatPrice = (price: number) => {
    if (billingCycle === 'annual') {
      return `$${(price / 12).toFixed(2)}/month`
    }
    return `$${price.toFixed(2)}/month`
  }

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <div className="px-6 pt-8 pb-6">
        <div className="max-w-7xl mx-auto text-center">
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-8">
            <div className="inline-flex items-center space-x-2 bg-purple-500/20 text-purple-300 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Crown className="w-4 h-4" />
              <span>Choose Your Earning Potential</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Subscription Plans
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Unlock higher earnings with lower platform fees and premium features
            </p>

            {/* Billing Toggle */}
            <div className="flex items-center justify-center gap-4 mb-8">
              <span className={`text-sm ${billingCycle === 'monthly' ? 'text-white' : 'text-gray-400'}`}>
                Monthly
              </span>
              <button
                onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'annual' : 'monthly')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  billingCycle === 'annual' ? 'bg-blue-600' : 'bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    billingCycle === 'annual' ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
              <span className={`text-sm ${billingCycle === 'annual' ? 'text-white' : 'text-gray-400'}`}>
                Annual
              </span>
              {billingCycle === 'annual' && (
                <Badge className="bg-green-500/20 text-green-400 border-green-500/20">
                  Save 20%
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="px-6 pb-12">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-8">
            {plans.map((plan) => (
              <Card 
                key={plan.name} 
                className={`relative bg-gray-800/50 backdrop-blur-sm border-gray-700 hover:border-gray-600 transition-all duration-300 ${
                  plan.popular ? 'ring-2 ring-blue-500/50 transform scale-105' : ''
                } ${
                  plan.current ? 'ring-2 ring-green-500/50' : ''
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-blue-500 text-white px-4 py-1">
                      <Star className="w-3 h-3 mr-1" />
                      Most Popular
                    </Badge>
                  </div>
                )}

                {plan.current && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-green-500 text-white px-4 py-1">
                      <Check className="w-3 h-3 mr-1" />
                      Current Plan
                    </Badge>
                  </div>
                )}

                <CardHeader className="text-center pb-8">
                  <div className="mb-4">
                    {plan.name === 'Free' && <Users className="w-8 h-8 text-gray-400 mx-auto" />}
                    {plan.name === 'Pro' && <TrendingUp className="w-8 h-8 text-blue-400 mx-auto" />}
                    {plan.name === 'Premium' && <Crown className="w-8 h-8 text-yellow-500 mx-auto" />}
                  </div>
                  
                  <CardTitle className="text-2xl font-bold text-white mb-2">
                    {plan.name}
                  </CardTitle>
                  
                  <CardDescription className="text-gray-400 mb-4">
                    {plan.description}
                  </CardDescription>

                  <div className="text-center">
                    {plan.price === 0 ? (
                      <div className="text-4xl font-bold text-white">Free</div>
                    ) : (
                      <div>
                        <div className="text-4xl font-bold text-white">
                          {formatPrice(calculatePrice(plan.price))}
                        </div>
                        {billingCycle === 'annual' && (
                          <div className="text-sm text-gray-400 mt-1">
                            ${(calculatePrice(plan.price)).toFixed(2)} billed annually
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Key Metrics */}
                  <div className="grid grid-cols-2 gap-4 mt-6 p-4 bg-gray-700/30 rounded-lg">
                    <div className="text-center">
                      <div className="text-sm text-gray-400">Platform Fee</div>
                      <div className="text-lg font-bold text-white">{plan.platformFee}%</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-gray-400">Monthly Tasks</div>
                      <div className="text-lg font-bold text-white">{plan.taskLimit}</div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-6">
                  {/* Features */}
                  <div>
                    <h4 className="text-white font-semibold mb-3">Included Features</h4>
                    <ul className="space-y-2">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-center gap-2 text-sm text-gray-300">
                          <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Limitations (for Free plan) */}
                  {plan.limitations && (
                    <div>
                      <h4 className="text-gray-400 font-semibold mb-3">Limitations</h4>
                      <ul className="space-y-2">
                        {plan.limitations.map((limitation, index) => (
                          <li key={index} className="flex items-center gap-2 text-sm text-gray-400">
                            <div className="w-4 h-4 rounded-full border border-gray-500 flex-shrink-0" />
                            {limitation}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Action Button */}
                  <Button
                    onClick={() => handlePlanSelection(plan.name)}
                    className={`w-full ${
                      plan.current
                        ? 'bg-gray-600 text-gray-300 cursor-default'
                        : plan.popular
                        ? 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 border-0'
                        : 'bg-gray-700 hover:bg-gray-600 text-white border-gray-600'
                    }`}
                    disabled={plan.current || !isVerified}
                  >
                    {!isVerified ? 'Verify Email First' : plan.cta}
                  </Button>

                  {plan.name !== 'Free' && (
                    <div className="text-center">
                      <p className="text-xs text-gray-400">
                        {billingCycle === 'monthly' ? 'No commitment • Cancel anytime' : 'Best value • Save 20%'}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Revenue Projection */}
          <div className="mt-12">
            <Card className="bg-gray-800/50 backdrop-blur-sm border-gray-700">
              <CardHeader className="text-center">
                <CardTitle className="text-white text-2xl mb-2">
                  <DollarSign className="w-6 h-6 inline mr-2" />
                  Potential Monthly Earnings Comparison
                </CardTitle>
                <CardDescription className="text-gray-400">
                  See how much more you could earn with lower platform fees
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-6">
                  {plans.map((plan) => (
                    <div key={plan.name} className="text-center p-4 bg-gray-700/30 rounded-lg">
                      <h4 className="text-white font-semibold mb-2">{plan.name}</h4>
                      <div className="space-y-2 text-sm">
                        <div className="text-gray-400">
                          Task earnings: <span className="text-white">$500</span>
                        </div>
                        <div className="text-gray-400">
                          Platform fee ({plan.platformFee}%): <span className="text-red-400">-${(500 * plan.platformFee / 100).toFixed(0)}</span>
                        </div>
                        {plan.price > 0 && (
                          <div className="text-gray-400">
                            Subscription: <span className="text-yellow-400">-${plan.price}</span>
                          </div>
                        )}
                        <div className="border-t border-gray-600 pt-2 font-semibold">
                          <span className="text-gray-400">You keep: </span>
                          <span className="text-green-400 text-lg">
                            ${(500 * (1 - plan.platformFee / 100) - plan.price).toFixed(0)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="text-center mt-6 text-sm text-gray-400">
                  * Example based on $500 in monthly task earnings
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
    </>
  )
}