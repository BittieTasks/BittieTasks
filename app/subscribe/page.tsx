'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '../../hooks/use-toast';
import { Check, Coins, Crown, Zap, Calculator, TrendingUp, Star, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import { supabase } from '@/lib/supabase';
import { redirectToAuthWithIntent } from '@/lib/auth-redirect';

// Live subscription system with transparent pricing

interface PlanFeatures {
  name: string;
  price: number;
  fee: string;
  taskLimit: number;
  features: string[];
  icon: any;
  color: string;
  popular?: boolean;
}

const SUBSCRIPTION_PLANS: Record<string, PlanFeatures> = {
  free: {
    name: 'Community Member',
    price: 0,
    fee: '10%',
    taskLimit: 10,
    features: [
      'Access to Solo tasks (3% platform fee)',
      '10 Community tasks per month',
      '10% platform fee on Community tasks', 
      'Basic task categories',
      'Community messaging',
      'Email support'
    ],
    icon: Coins,
    color: 'border-gray-200'
  },
  pro: {
    name: 'Pro Earner',
    price: 9.99,
    fee: '7%',
    taskLimit: 50,
    features: [
      'Everything in Community Member',
      'Up to 50 Community tasks per month',
      '7% platform fee (save 30%)',
      'Priority task matching',
      'Access to Corporate sponsored tasks',
      'Advanced earnings analytics',
      'Priority support',
      'Early access to new features'
    ],
    icon: Zap,
    color: 'border-teal-200',
    popular: true
  },
  premium: {
    name: 'Power User',
    price: 19.99,
    fee: '5%',
    taskLimit: -1,
    features: [
      'Everything in Pro Earner',
      'Unlimited Community tasks',
      '5% platform fee (save 50%)',
      'Premium badge visibility',
      'Ad-free experience',
      'Priority Corporate task access',
      'Custom task categories',
      'Direct messaging with Corporate sponsors',
      '24/7 priority support',
      'Monthly earnings consultation'
    ],
    icon: Crown,
    color: 'border-purple-200'
  }
};

function CheckoutWrapper({ planType }: { planType: 'pro' | 'premium' }) {
  const { toast } = useToast();
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubscribe = async () => {
    setIsProcessing(true);
    
    try {
      // Debug authentication state
      const { supabase } = await import('@/lib/supabase')
      const { data: { session } } = await supabase.auth.getSession()
      
      console.log('Subscription attempt:', {
        hasSession: !!session,
        hasToken: !!session?.access_token,
        userEmail: session?.user?.email,
        tokenStart: session?.access_token?.substring(0, 20),
        planType,
        price: SUBSCRIPTION_PLANS[planType].price
      })
      
      if (!session?.access_token) {
        throw new Error('No authentication token available')
      }
      
      // Use the improved API request function with authentication
      const { apiRequest } = await import('@/lib/queryClient')
      const response = await apiRequest('POST', '/api/create-subscription', {
        planType,
        price: SUBSCRIPTION_PLANS[planType].price
      });

      const { sessionUrl } = await response.json();
      
      console.log('Subscription session created:', { sessionUrl })
      
      // Redirect to Stripe checkout
      window.location.href = sessionUrl;
      
    } catch (error: any) {
      console.error('Subscription error details:', error);
      
      let errorMessage = "Could not start subscription. Please try again."
      
      if (error.message?.includes('401')) {
        errorMessage = "Please sign in again to subscribe."
      } else if (error.message?.includes('Authentication')) {
        errorMessage = "Authentication expired. Please refresh and try again."
      }
      
      toast({
        title: "Subscription Failed", 
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="text-center space-y-4">
      <p className="text-gray-600">
        Ready to upgrade to {SUBSCRIPTION_PLANS[planType].name}?
      </p>
      <Button 
        onClick={handleSubscribe}
        disabled={isProcessing}
        className="w-full bg-teal-600 hover:bg-teal-700 text-white"
      >
        {isProcessing ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
            Processing...
          </>
        ) : (
          `Subscribe for $${SUBSCRIPTION_PLANS[planType].price}/month`
        )}
      </Button>
      <p className="text-sm text-gray-500">
        Secure payment processing via Stripe • Cancel anytime
      </p>
    </div>
  );
}

export default function Subscribe() {
  const [selectedPlan, setSelectedPlan] = useState<'pro' | 'premium' | null>(null);
  const { toast } = useToast();
  const router = useRouter();
  const { user, isAuthenticated, loading } = useAuth();

  // Allow unauthenticated users to view pricing, redirect only when they try to subscribe
  const handleAuthRequired = () => {
    toast({
      title: "Sign Up to Subscribe",
      description: "Create your account to start earning with reduced fees.",
      variant: "default",
    });
    redirectToAuthWithIntent('/subscribe');
  };

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 to-emerald-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-teal-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading subscription options...</p>
        </div>
      </div>
    );
  }

  // Show subscription page to all users - authentication happens during checkout

  if (selectedPlan) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 to-emerald-50 py-12">
        <div className="max-w-2xl mx-auto px-4">
          <div className="text-center mb-8">
            <Button
              variant="ghost"
              onClick={() => setSelectedPlan(null)}
              className="mb-4"
            >
              ← Back to Plans
            </Button>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Subscribe to {SUBSCRIPTION_PLANS[selectedPlan].name}
            </h1>
            <p className="text-gray-600">
              ${SUBSCRIPTION_PLANS[selectedPlan].price}/month • {SUBSCRIPTION_PLANS[selectedPlan].fee} platform fee
            </p>
          </div>

          <Card className="p-6">
            <CheckoutWrapper planType={selectedPlan} />
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-emerald-50 py-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Maximize Your Earnings
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-6">
            Lower platform fees, higher earning potential, and exclusive access to premium opportunities
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto">
            <p className="text-blue-800 font-medium">
              💡 Solo tasks have a low 3% platform fee - transparent pricing!
            </p>
          </div>
        </div>

        {/* Earnings Calculator */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-12 max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <Calculator className="h-6 w-6 text-teal-600" />
            <h2 className="text-2xl font-semibold text-gray-900">See Your Potential Savings</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-3xl font-bold text-gray-900 mb-2">$100</div>
              <div className="text-sm text-gray-600 mb-3">Monthly Community Task Earnings</div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Free Plan (10% fee):</span>
                  <span className="font-medium text-red-600">$10 fee</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Pro Plan (7% fee):</span>
                  <span className="font-medium text-teal-600">$7 fee</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Premium Plan (5% fee):</span>
                  <span className="font-medium text-purple-600">$5 fee</span>
                </div>
              </div>
            </div>
            <div className="text-center p-4 bg-teal-50 rounded-lg">
              <div className="text-3xl font-bold text-teal-600 mb-2">$36</div>
              <div className="text-sm text-gray-600 mb-3">Annual Savings with Pro</div>
              <div className="text-xs text-gray-500">
                $3 saved per $100 × 12 months = $36 saved annually
              </div>
              <div className="mt-2 text-sm font-medium text-teal-600">
                Pays for itself in 3.3 months!
              </div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-3xl font-bold text-purple-600 mb-2">$60</div>
              <div className="text-sm text-gray-600 mb-3">Annual Savings with Premium</div>
              <div className="text-xs text-gray-500">
                $5 saved per $100 × 12 months = $60 saved annually
              </div>
              <div className="mt-2 text-sm font-medium text-purple-600">
                Pays for itself in 4 months!
              </div>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {Object.entries(SUBSCRIPTION_PLANS).map(([key, plan]) => {
            const Icon = plan.icon;
            return (
              <Card
                key={key}
                className={`relative ${plan.color} ${plan.popular ? 'ring-2 ring-teal-500' : ''}`}
              >
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-teal-600 text-white">
                    Most Popular
                  </Badge>
                )}
                
                <CardHeader className="text-center">
                  <div className="mx-auto mb-4 p-3 bg-teal-100 rounded-full w-fit">
                    <Icon className="h-8 w-8 text-teal-600" />
                  </div>
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <CardDescription>
                    <span className="text-3xl font-bold text-gray-900">
                      ${plan.price}
                    </span>
                    {plan.price > 0 && <span className="text-gray-600">/month</span>}
                  </CardDescription>
                  <div className="text-sm text-teal-600 font-medium">
                    {plan.fee} platform fee
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <ul className="space-y-3">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start space-x-3">
                        <Check className="h-5 w-5 text-teal-600 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    onClick={() => {
                      if (key === 'free') {
                        if (isAuthenticated) {
                          router.push('/dashboard');
                        } else {
                          handleAuthRequired();
                        }
                      } else {
                        if (isAuthenticated) {
                          setSelectedPlan(key as 'pro' | 'premium');
                        } else {
                          handleAuthRequired();
                        }
                      }
                    }}
                    variant={plan.popular ? 'default' : 'outline'}
                    className={`w-full ${
                      plan.popular 
                        ? 'bg-teal-600 hover:bg-teal-700 text-white' 
                        : 'border-teal-600 text-teal-600 hover:bg-teal-50'
                    }`}
                  >
                    {key === 'free' ? 'Get Started' : selectedPlan === key ? 'Active Plan' : 'Upgrade Now'}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="mt-16 text-center">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 max-w-4xl mx-auto mb-8">
            <h3 className="text-lg font-semibold text-blue-900 mb-4">Platform Fee Breakdown</h3>
            <div className="grid md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">3%</div>
                <div className="text-sm text-gray-600">Solo Tasks</div>
                <div className="text-xs text-gray-500">Platform fee</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-600">10%</div>
                <div className="text-sm text-gray-600">Community (Free)</div>
                <div className="text-xs text-gray-500">Peer-to-peer tasks</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-teal-600">7%</div>
                <div className="text-sm text-gray-600">Community (Pro)</div>
                <div className="text-xs text-green-600">Save 30%</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">5%</div>
                <div className="text-sm text-gray-600">Community (Premium)</div>
                <div className="text-xs text-green-600">Save 50%</div>
              </div>
            </div>
          </div>
          
          {/* Success Stories */}
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-4xl mx-auto mb-8">
            <div className="flex items-center gap-3 mb-6">
              <Star className="h-6 w-6 text-yellow-500" />
              <h3 className="text-xl font-semibold text-gray-900">Why Users Upgrade</h3>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-teal-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <div className="text-sm font-medium text-teal-800">Pro Earner Success</div>
                  <Badge className="bg-teal-600 text-white text-xs">7% fee</Badge>
                </div>
                <p className="text-sm text-gray-700 mb-2">
                  "I was earning $200/month on Community tasks. The 3% fee savings from upgrading to Pro pays for the subscription and puts $6 extra in my pocket monthly."
                </p>
                <div className="text-xs text-teal-600 font-medium">
                  Monthly savings: $6 • Annual profit: $192
                </div>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <div className="text-sm font-medium text-purple-800">Power User Success</div>
                  <Badge className="bg-purple-600 text-white text-xs">5% fee</Badge>
                </div>
                <p className="text-sm text-gray-700 mb-2">
                  "Premium unlocked Corporate sponsors for me. I now earn $500/month with lower fees AND exclusive high-paying tasks. Best investment I made."
                </p>
                <div className="text-xs text-purple-600 font-medium">
                  Monthly savings: $25 • Corporate access: Priceless
                </div>
              </div>
            </div>
          </div>

          <p className="text-gray-600 mb-4">
            All plans include secure payments, community features, and email support
          </p>
          <p className="text-sm text-gray-500">
            Cancel anytime • No setup fees • 30-day money-back guarantee
          </p>
        </div>
      </div>
    </div>
  );
}