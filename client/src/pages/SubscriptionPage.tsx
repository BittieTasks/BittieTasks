import { useState } from 'react';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { 
  Check, 
  X, 
  Crown, 
  Zap, 
  Shield, 
  Star,
  CreditCard,
  DollarSign,
  Users,
  Headphones
} from 'lucide-react';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY!);

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  monthlyTaskLimit: number;
  platformFee: number;
  features: string[];
}

interface SubscriptionFormProps {
  planId: string;
  clientSecret: string;
  onSuccess: () => void;
}

function SubscriptionForm({ planId, clientSecret, onSuccess }: SubscriptionFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/subscription-success`,
        },
      });

      if (error) {
        toast({
          title: "Subscription Failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Subscription Successful",
          description: "Welcome to your new plan!",
        });
        onSuccess();
      }
    } catch (error) {
      toast({
        title: "Subscription Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />
      
      <div className="space-y-4 pt-4">
        <Separator />
        
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Secure Payment</span>
          <Badge variant="secondary">SSL Protected</Badge>
        </div>
        
        <Button 
          type="submit" 
          disabled={!stripe || isProcessing}
          className="w-full"
          size="lg"
        >
          {isProcessing ? (
            <>
              <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
              Processing...
            </>
          ) : (
            <>
              <CreditCard className="w-4 h-4 mr-2" />
              Subscribe Now
            </>
          )}
        </Button>
      </div>
    </form>
  );
}

export default function SubscriptionPage() {
  const { toast } = useToast();
  const [selectedPlan, setSelectedPlan] = useState<string>('');
  const [clientSecret, setClientSecret] = useState<string>('');
  const [showPaymentForm, setShowPaymentForm] = useState(false);

  const { data: plans = [] } = useQuery({
    queryKey: ['/api/subscription/plans'],
    queryFn: () => apiRequest('GET', '/api/subscription/plans').then(res => res.json())
  });

  const { data: currentSubscription } = useQuery({
    queryKey: ['/api/subscription/current'],
    queryFn: () => apiRequest('GET', '/api/subscription/current').then(res => res.json())
  });

  const createSubscriptionMutation = useMutation({
    mutationFn: async (planId: string) => {
      const response = await apiRequest('POST', '/api/create-subscription', {
        planId,
        userEmail: 'user@example.com', // This should come from auth context
        userId: 'current-user-id'
      });
      return response.json();
    },
    onSuccess: (data) => {
      if (data.clientSecret) {
        setClientSecret(data.clientSecret);
        setShowPaymentForm(true);
      } else {
        // Free plan or immediate success
        queryClient.invalidateQueries({ queryKey: ['/api/subscription/current'] });
        toast({
          title: "Plan Updated",
          description: "Your subscription has been updated successfully!",
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Subscription Error",
        description: "Failed to create subscription. Please try again.",
        variant: "destructive",
      });
    }
  });

  const cancelSubscriptionMutation = useMutation({
    mutationFn: async (subscriptionId: string) => {
      const response = await apiRequest('POST', '/api/cancel-subscription', {
        subscriptionId
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/subscription/current'] });
      toast({
        title: "Subscription Cancelled",
        description: "Your subscription has been cancelled successfully.",
      });
    }
  });

  const handleSubscribe = (planId: string) => {
    setSelectedPlan(planId);
    createSubscriptionMutation.mutate(planId);
  };

  const handleCancel = () => {
    if (currentSubscription?.stripeSubscriptionId) {
      cancelSubscriptionMutation.mutate(currentSubscription.stripeSubscriptionId);
    }
  };

  // Mock plans for demo (these come from the API in practice)
  const defaultPlans: SubscriptionPlan[] = [
    {
      id: "free",
      name: "BittieTasks Free",
      price: 0,
      monthlyTaskLimit: 5,
      platformFee: 0.10,
      features: ["5 tasks/month", "Basic support", "Standard fees"]
    },
    {
      id: "pro",
      name: "BittieTasks Pro",
      price: 9.99,
      monthlyTaskLimit: 50,
      platformFee: 0.07,
      features: ["50 tasks/month", "Priority support", "Reduced fees", "Ad-free"]
    },
    {
      id: "premium",
      name: "BittieTasks Premium",
      price: 19.99,
      monthlyTaskLimit: -1,
      platformFee: 0.05,
      features: ["Unlimited tasks", "Premium support", "Lowest fees", "Exclusive tasks"]
    }
  ];

  const displayPlans = plans.length > 0 ? plans : defaultPlans;

  if (showPaymentForm && clientSecret) {
    const options = {
      clientSecret,
      appearance: {
        theme: 'stripe' as const,
      },
    };

    return (
      <div className="container mx-auto px-4 py-8">
        <Button 
          variant="outline" 
          onClick={() => setShowPaymentForm(false)}
          className="mb-6"
        >
          ← Back to Plans
        </Button>
        
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crown className="w-5 h-5" />
              Complete Your Subscription
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Elements stripe={stripePromise} options={options}>
              <SubscriptionForm 
                planId={selectedPlan}
                clientSecret={clientSecret}
                onSuccess={() => {
                  setShowPaymentForm(false);
                  queryClient.invalidateQueries({ queryKey: ['/api/subscription/current'] });
                }}
              />
            </Elements>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Choose Your Plan
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Unlock more earning potential with BittieTasks subscriptions
        </p>
      </div>

      {currentSubscription && (
        <Card className="max-w-2xl mx-auto mb-8 border-green-200 dark:border-green-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="w-5 h-5 text-green-600" />
              Current Subscription
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{currentSubscription.planName || 'Free Plan'}</p>
                <p className="text-sm text-muted-foreground">
                  {currentSubscription.status === 'active' ? 'Active' : 'Cancelled'}
                </p>
              </div>
              <div className="text-right">
                <p className="font-bold text-green-600">
                  ${currentSubscription.price || 0}/month
                </p>
                {currentSubscription.stripeSubscriptionId && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleCancel}
                    disabled={cancelSubscriptionMutation.isPending}
                  >
                    {cancelSubscriptionMutation.isPending ? 'Cancelling...' : 'Cancel'}
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-3 max-w-6xl mx-auto">
        {displayPlans.map((plan) => (
          <Card key={plan.id} className={`relative ${plan.id === 'pro' ? 'border-blue-500 shadow-lg' : ''}`}>
            {plan.id === 'pro' && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Badge className="bg-blue-500 hover:bg-blue-600">Most Popular</Badge>
              </div>
            )}
            
            <CardHeader className="text-center">
              <div className="flex justify-center mb-2">
                {plan.id === 'free' && <Users className="w-8 h-8 text-gray-500" />}
                {plan.id === 'pro' && <Zap className="w-8 h-8 text-blue-500" />}
                {plan.id === 'premium' && <Crown className="w-8 h-8 text-purple-500" />}
              </div>
              
              <CardTitle className="text-xl">{plan.name}</CardTitle>
              
              <div className="flex items-center justify-center gap-1">
                <DollarSign className="w-4 h-4" />
                <span className="text-3xl font-bold">{plan.price}</span>
                <span className="text-muted-foreground">/month</span>
              </div>
              
              <p className="text-sm text-muted-foreground">
                Platform fee: {(plan.platformFee * 100).toFixed(0)}%
              </p>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="space-y-2">
                {plan.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>
              
              <Separator />
              
              <div className="text-center">
                <p className="text-sm font-medium mb-2">
                  {plan.monthlyTaskLimit === -1 ? 'Unlimited' : plan.monthlyTaskLimit} tasks/month
                </p>
                
                <Button 
                  className="w-full"
                  variant={plan.id === 'pro' ? 'default' : 'outline'}
                  onClick={() => handleSubscribe(plan.id)}
                  disabled={createSubscriptionMutation.isPending}
                >
                  {createSubscriptionMutation.isPending && selectedPlan === plan.id ? (
                    <>
                      <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                      Setting up...
                    </>
                  ) : (
                    <>
                      {plan.price === 0 ? 'Get Started' : 'Subscribe'}
                      {plan.id === 'premium' && <Crown className="w-4 h-4 ml-2" />}
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-12 max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold text-center mb-6">Why Subscribe?</h2>
        
        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardContent className="pt-6 text-center">
              <Shield className="w-8 h-8 text-blue-500 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Lower Platform Fees</h3>
              <p className="text-sm text-muted-foreground">
                Save money on every task with reduced platform fees
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6 text-center">
              <Headphones className="w-8 h-8 text-green-500 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Priority Support</h3>
              <p className="text-sm text-muted-foreground">
                Get faster help when you need it most
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6 text-center">
              <Star className="w-8 h-8 text-purple-500 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Exclusive Access</h3>
              <p className="text-sm text-muted-foreground">
                Access premium tasks and features first
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}