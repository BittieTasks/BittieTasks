import { useState } from "react";
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
// import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { ArrowLeft, Check, Crown, Star } from "lucide-react";
import { useLocation } from "wouter";

if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
  throw new Error('Missing required Stripe key: VITE_STRIPE_PUBLIC_KEY');
}
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const plans = [
  {
    id: 'pro',
    name: 'BittieTasks Pro',
    price: 19.99,
    description: 'For active parents earning regular income',
    features: [
      'Complete up to 50 tasks per month',
      'Keep 85% of task earnings',
      'Priority customer support',
      'Ad-free experience',
      'Advanced analytics dashboard',
      'Pro badge on profile'
    ],
    popular: true
  },
  {
    id: 'premium',
    name: 'BittieTasks Premium',
    price: 39.99,
    description: 'For power users maximizing their earnings',
    features: [
      'Unlimited monthly tasks',
      'Keep 90% of task earnings',
      '24/7 phone support',
      'Advanced analytics & insights',
      'Premium badge & priority listing',
      'Exclusive high-paying tasks',
      '1-on-1 success coaching'
    ],
    popular: false
  }
];

function CheckoutForm({ selectedPlan }: { selectedPlan: typeof plans[0] }) {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [, setLocation] = useLocation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

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
          title: "Payment Failed",
          description: error.message || "An error occurred during payment",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Upgrade Successful!",
          description: `Welcome to ${selectedPlan.name}! Your new benefits are now active.`,
        });
        setLocation('/dashboard');
      }
    } catch (error) {
      toast({
        title: "Payment Error",
        description: "Unable to process payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />
      <Button 
        type="submit" 
        disabled={!stripe || isProcessing} 
        className="w-full"
        size="lg"
      >
        {isProcessing ? "Processing..." : `Upgrade to ${selectedPlan.name} - $${selectedPlan.price}/month`}
      </Button>
    </form>
  );
}

export default function SubscriptionUpgrade() {
  // const { user, isLoading } = useAuth();
  const isLoading = false;
  const [selectedPlan, setSelectedPlan] = useState(plans[0]);
  const [clientSecret, setClientSecret] = useState("");
  const [isLoadingPayment, setIsLoadingPayment] = useState(false);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const handlePlanSelect = async (plan: typeof plans[0]) => {
    setSelectedPlan(plan);
    setIsLoadingPayment(true);

    try {
      const response = await apiRequest("POST", "/api/create-subscription", {
        planId: plan.id,
        amount: plan.price
      });
      
      const data = await response.json();
      setClientSecret(data.clientSecret);
    } catch (error) {
      toast({
        title: "Setup Error",
        description: "Unable to setup payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingPayment(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => setLocation('/dashboard')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Upgrade Your Account
            </h1>
            <p className="text-gray-600">
              Choose a plan that fits your earning goals
            </p>
          </div>
        </div>

        {/* Plan Selection */}
        {!clientSecret && (
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {plans.map((plan) => (
              <Card
                key={plan.id}
                className={`relative cursor-pointer transition-all hover:shadow-lg ${
                  selectedPlan.id === plan.id ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => handlePlanSelect(plan)}
              >
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-purple-600 to-blue-600">
                    <Star className="w-3 h-3 mr-1" />
                    Most Popular
                  </Badge>
                )}
                
                <CardHeader className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Crown className="w-6 h-6 text-primary mr-2" />
                    <CardTitle className="text-xl">{plan.name}</CardTitle>
                  </div>
                  <CardDescription>{plan.description}</CardDescription>
                  <div className="text-3xl font-bold text-primary mt-4">
                    ${plan.price}
                    <span className="text-sm font-normal text-gray-500">/month</span>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <ul className="space-y-3">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center">
                        <Check className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Button 
                    className="w-full mt-6" 
                    disabled={isLoadingPayment}
                    variant={selectedPlan.id === plan.id ? "default" : "outline"}
                  >
                    {isLoadingPayment && selectedPlan.id === plan.id 
                      ? "Setting up..." 
                      : `Select ${plan.name}`
                    }
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Payment Form */}
        {clientSecret && (
          <Card className="max-w-md mx-auto">
            <CardHeader className="text-center">
              <CardTitle>Complete Your Upgrade</CardTitle>
              <CardDescription>
                Upgrading to {selectedPlan.name} - ${selectedPlan.price}/month
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Elements stripe={stripePromise} options={{ clientSecret }}>
                <CheckoutForm selectedPlan={selectedPlan} />
              </Elements>
              
              <Button
                variant="ghost"
                onClick={() => setClientSecret("")}
                className="w-full mt-4"
              >
                Change Plan
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}