'use client';

import { useState, useEffect } from 'react';
import { useStripe, useElements, PaymentElement, Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '../../hooks/use-toast';
import { Check, Coins, Crown, Zap } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useRouter } from 'next/navigation';

// Load Stripe  
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_VITE_STRIPE_PUBLIC_KEY || process.env.VITE_STRIPE_PUBLIC_KEY!);

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
    name: 'Free Plan',
    price: 0,
    fee: '10%',
    taskLimit: 5,
    features: [
      'Up to 5 tasks per month',
      '10% platform fee',
      'Basic task categories',
      'Community messaging',
      'Email support'
    ],
    icon: Coins,
    color: 'border-gray-200'
  },
  pro: {
    name: 'Pro Plan',
    price: 9.99,
    fee: '7%',
    taskLimit: 50,
    features: [
      'Up to 50 tasks per month',
      '7% platform fee (save 30%)',
      'Priority task matching',
      'Advanced analytics',
      'Priority support',
      'Early access to new features'
    ],
    icon: Zap,
    color: 'border-teal-200',
    popular: true
  },
  premium: {
    name: 'Premium Plan',
    price: 19.99,
    fee: '5%',
    taskLimit: -1,
    features: [
      'Unlimited tasks',
      '5% platform fee (save 50%)',
      'Premium badge visibility',
      'Ad-free experience',
      'Custom task categories',
      'Direct messaging with sponsors',
      '24/7 priority support',
      'Monthly strategy consultation'
    ],
    icon: Crown,
    color: 'border-yellow-200'
  }
};

function SubscribeForm({ planType }: { planType: 'pro' | 'premium' }) {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/dashboard?subscription=success`,
      },
    });

    if (error) {
      toast({
        title: "Payment Failed",
        description: error.message,
        variant: "destructive",
      });
    }

    setIsLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />
      <Button 
        type="submit" 
        disabled={!stripe || isLoading}
        className="w-full bg-teal-600 hover:bg-teal-700"
      >
        {isLoading ? 'Processing...' : `Subscribe to ${SUBSCRIPTION_PLANS[planType].name}`}
      </Button>
    </form>
  );
}

function CheckoutWrapper({ planType }: { planType: 'pro' | 'premium' }) {
  const [clientSecret, setClientSecret] = useState('');
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!user) return;

    // Create subscription
    fetch('/api/stripe/create-subscription', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${user.access_token}`
      },
      body: JSON.stringify({ planType }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          toast({
            title: "Error",
            description: data.error,
            variant: "destructive",
          });
          return;
        }
        setClientSecret(data.clientSecret);
      })
      .catch((error) => {
        toast({
          title: "Error",
          description: "Failed to initialize payment",
          variant: "destructive",
        });
      });
  }, [user, planType, toast]);

  if (!clientSecret) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <Elements stripe={stripePromise} options={{ clientSecret }}>
      <SubscribeForm planType={planType} />
    </Elements>
  );
}

export default function Subscribe() {
  const [selectedPlan, setSelectedPlan] = useState<'pro' | 'premium' | null>(null);
  const { user, isLoading } = useAuth();
  const router = useRouter();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user) {
    router.push('/auth');
    return null;
  }

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
            Choose Your Plan
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Unlock better earning potential with lower platform fees and premium features
          </p>
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
                        router.push('/dashboard');
                      } else {
                        setSelectedPlan(key as 'pro' | 'premium');
                      }
                    }}
                    variant={plan.popular ? 'default' : 'outline'}
                    className={`w-full ${
                      plan.popular 
                        ? 'bg-teal-600 hover:bg-teal-700 text-white' 
                        : 'border-teal-600 text-teal-600 hover:bg-teal-50'
                    }`}
                  >
                    {key === 'free' ? 'Current Plan' : 'Upgrade Now'}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="mt-16 text-center">
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