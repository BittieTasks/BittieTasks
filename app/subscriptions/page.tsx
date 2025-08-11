'use client'

import { useState, useEffect } from 'react'
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

export default function SubscriptionsPage() {
  const { user, isAuthenticated, isVerified } = useAuth()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState('Pro')

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  if (!isAuthenticated) {
    router.push('/auth')
    return null
  }

  const calculateAnnualSavings = (monthlyPrice: number) => {
    return (monthlyPrice * 12 * 0.2).toFixed(2) // 20% annual discount
  }

  return (
    <div className="page-layout">
      <Navigation />
      
      <main className="page-content">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-display mb-4">Choose Your Plan</h1>
          <p className="text-body text-muted-foreground max-w-2xl mx-auto">
            Unlock more earning potential with reduced platform fees and premium features
          </p>
        </div>

        {/* Current Plan Benefits */}
        <Card className="card-clean mb-8 border-primary">
          <CardContent className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
                <Crown className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h3 className="text-subheading">Your Potential Savings</h3>
                <p className="text-body text-muted-foreground">
                  See how much you could save on platform fees
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-red-600">10%</div>
                <div className="text-small text-muted-foreground">Free Plan Fee</div>
                <div className="text-small text-muted-foreground">On $100: $10 fee</div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">7%</div>
                <div className="text-small text-muted-foreground">Pro Plan Fee</div>
                <div className="text-small text-green-600">On $100: $7 fee (Save $3)</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">5%</div>
                <div className="text-small text-muted-foreground">Premium Plan Fee</div>
                <div className="text-small text-green-600">On $100: $5 fee (Save $5)</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Plan Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {plans.map((plan) => (
            <Card 
              key={plan.name} 
              className={`card-clean relative ${
                plan.popular ? 'border-primary shadow-lg scale-105' : ''
              } ${plan.current ? 'border-green-500' : ''}`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground px-4 py-1">
                    Most Popular
                  </Badge>
                </div>
              )}

              {plan.current && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-green-500 text-white px-4 py-1">
                    Current Plan
                  </Badge>
                </div>
              )}

              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-xl flex items-center justify-center">
                  {plan.name === 'Free' && <Users className="h-8 w-8" />}
                  {plan.name === 'Pro' && <Crown className="h-8 w-8 text-blue-600" />}
                  {plan.name === 'Premium' && <Star className="h-8 w-8 text-purple-600" />}
                </div>
                
                <CardTitle className="text-subheading">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
                
                <div className="py-4">
                  <div className="text-4xl font-bold">
                    {plan.price === 0 ? 'Free' : `$${plan.price}`}
                  </div>
                  {plan.price > 0 && (
                    <div className="text-small text-muted-foreground">
                      per {plan.period}
                    </div>
                  )}
                  {plan.price > 0 && (
                    <div className="text-small text-green-600 mt-1">
                      Save ${calculateAnnualSavings(plan.price)} annually
                    </div>
                  )}
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Platform Fee Highlight */}
                <div className="text-center p-3 bg-muted rounded-lg">
                  <div className="text-lg font-bold">{plan.platformFee}% Platform Fee</div>
                  <div className="text-small text-muted-foreground">
                    Task Limit: {plan.taskLimit} per month
                  </div>
                </div>

                {/* Features */}
                <div className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <Check className="h-4 w-4 text-green-600 flex-shrink-0" />
                      <span className="text-small">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* CTA Button */}
                <Button
                  className={`w-full ${plan.current ? 'button-outline' : 'button-clean'}`}
                  variant={plan.current ? 'outline' : 'default'}
                  disabled={plan.current}
                  onClick={() => {
                    if (!plan.current) {
                      // In a real app, this would integrate with Stripe
                      console.log(`Upgrading to ${plan.name}`)
                    }
                  }}
                >
                  {plan.cta}
                </Button>

                {plan.price > 0 && !plan.current && (
                  <p className="text-center text-small text-muted-foreground">
                    Cancel anytime • No hidden fees
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Feature Comparison */}
        <Card className="card-clean mb-8">
          <CardHeader>
            <CardTitle className="text-subheading">Feature Comparison</CardTitle>
            <CardDescription>See what's included with each plan</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Feature</th>
                    <th className="text-center py-3 px-4">Free</th>
                    <th className="text-center py-3 px-4">Pro</th>
                    <th className="text-center py-3 px-4">Premium</th>
                  </tr>
                </thead>
                <tbody className="text-small">
                  <tr className="border-b">
                    <td className="py-3 px-4">Platform Fee</td>
                    <td className="text-center py-3 px-4">10%</td>
                    <td className="text-center py-3 px-4 text-blue-600">7%</td>
                    <td className="text-center py-3 px-4 text-purple-600">5%</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-3 px-4">Monthly Task Limit</td>
                    <td className="text-center py-3 px-4">5 tasks</td>
                    <td className="text-center py-3 px-4">25 tasks</td>
                    <td className="text-center py-3 px-4">Unlimited</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-3 px-4">Priority Support</td>
                    <td className="text-center py-3 px-4">-</td>
                    <td className="text-center py-3 px-4"><Check className="h-4 w-4 text-green-600 mx-auto" /></td>
                    <td className="text-center py-3 px-4"><Check className="h-4 w-4 text-green-600 mx-auto" /></td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-3 px-4">Advanced Analytics</td>
                    <td className="text-center py-3 px-4">-</td>
                    <td className="text-center py-3 px-4"><Check className="h-4 w-4 text-green-600 mx-auto" /></td>
                    <td className="text-center py-3 px-4"><Check className="h-4 w-4 text-green-600 mx-auto" /></td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4">Corporate Sponsorships</td>
                    <td className="text-center py-3 px-4">-</td>
                    <td className="text-center py-3 px-4">-</td>
                    <td className="text-center py-3 px-4"><Check className="h-4 w-4 text-green-600 mx-auto" /></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* FAQ */}
        <Card className="card-clean">
          <CardHeader>
            <CardTitle className="text-subheading">Frequently Asked Questions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Can I change plans anytime?</h4>
              <p className="text-small text-muted-foreground">
                Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.
              </p>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">How do platform fees work?</h4>
              <p className="text-small text-muted-foreground">
                Platform fees are automatically deducted from your earnings. Lower-tier plans have higher fees to support platform development.
              </p>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">What happens if I exceed my task limit?</h4>
              <p className="text-small text-muted-foreground">
                Free and Pro plans have monthly task limits. You'll be prompted to upgrade when you reach your limit.
              </p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}