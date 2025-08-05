import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { PaymentForm } from "@/components/ui/payment-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, Crown, Star, Zap, AlertCircle } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

// Initialize Stripe only if keys are available  
const stripePromise = import.meta.env.VITE_STRIPE_PUBLIC_KEY ? 
  loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY) : 
  null;

interface SubscriptionData {
  subscriptionId: string;
  clientSecret: string;
  status: string;
}

export default function SubscriptionCheckout() {
  const params = useParams();
  const [, setLocation] = useLocation();
  const tier = params.tier as 'pro' | 'premium';
  
  const [subscriptionData, setSubscriptionData] = useState<SubscriptionData | null>(null);

  // Subscription details
  const subscriptionDetails = {
    pro: {
      name: 'TaskParent Pro',
      price: 9.99,
      priceId: 'price_pro_monthly', // This would be set from Stripe dashboard
      features: [
        '50 tasks per month',
        '7% platform fee (vs 10%)',
        'Priority support',
        'Ad-free experience',
        'Advanced analytics'
      ],
      icon: Crown,
      color: 'text-blue-600'
    },
    premium: {
      name: 'TaskParent Premium',
      price: 19.99,
      priceId: 'price_premium_monthly', // This would be set from Stripe dashboard
      features: [
        '200 tasks per month',
        '5% platform fee (vs 10%)',
        'Priority support',
        'Ad-free experience',
        'Advanced analytics',
        'Premium badge',
        'Early access features'
      ],
      icon: Star,
      color: 'text-purple-600'
    }
  };

  const currentPlan = subscriptionDetails[tier];
  const IconComponent = currentPlan?.icon || Zap;

  // Create subscription
  const createSubscriptionMutation = useMutation({
    mutationFn: async (data: { priceId: string; tier: string }) => {
      const response = await apiRequest("POST", "/api/payments/create-subscription", data);
      return response.json();
    },
    onSuccess: (data: SubscriptionData) => {
      setSubscriptionData(data);
    }
  });

  useEffect(() => {
    if (currentPlan) {
      createSubscriptionMutation.mutate({
        priceId: currentPlan.priceId,
        tier
      });
    }
  }, [tier]);

  const handleSubscriptionSuccess = () => {
    setLocation('/subscription/success');
  };

  const handleSubscriptionError = (error: string) => {
    console.error("Subscription error:", error);
  };

  if (!currentPlan) {
    return (
      <div className="max-w-md mx-auto mt-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Invalid subscription plan. Please select a valid plan.
          </AlertDescription>
        </Alert>
        <Button 
          variant="outline" 
          className="w-full mt-4"
          onClick={() => setLocation('/subscription')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Plans
        </Button>
      </div>
    );
  }

  // Check if Stripe is available
  const isStripeAvailable = !!import.meta.env.VITE_STRIPE_PUBLIC_KEY;

  if (!isStripeAvailable) {
    return (
      <div className="max-w-md mx-auto mt-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Subscription billing is temporarily unavailable. Please try again later.
          </AlertDescription>
        </Alert>
        <Button 
          variant="outline" 
          className="w-full mt-4"
          onClick={() => setLocation('/subscription')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Plans
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="mb-6">
        <Button 
          variant="ghost" 
          onClick={() => setLocation('/subscription')}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Plans
        </Button>
        
        <h1 className="text-2xl font-bold mb-2">Subscribe to {currentPlan.name}</h1>
        <p className="text-muted-foreground">
          Upgrade your BittieTasks experience
        </p>
      </div>

      {/* Plan Summary */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <IconComponent className={`h-6 w-6 ${currentPlan.color}`} />
            {currentPlan.name}
            <Badge variant="secondary">${currentPlan.price}/month</Badge>
          </CardTitle>
          <CardDescription>
            Everything you need to maximize your earnings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {currentPlan.features.map((feature, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 bg-primary rounded-full" />
                <span className="text-sm">{feature}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Subscription Form */}
      {createSubscriptionMutation.isPending ? (
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <div className="animate-spin w-6 h-6 border-4 border-primary border-t-transparent rounded-full mr-3" />
            Setting up subscription...
          </CardContent>
        </Card>
      ) : createSubscriptionMutation.error ? (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {createSubscriptionMutation.error.message || 'Failed to set up subscription'}
          </AlertDescription>
        </Alert>
      ) : subscriptionData?.clientSecret ? (
        <Elements stripe={stripePromise} options={{ clientSecret: subscriptionData.clientSecret }}>
          <PaymentForm
            amount={currentPlan.price}
            taskTitle={`${currentPlan.name} Subscription`}
            providerName="BittieTasks"
            useEscrow={false}
            onSuccess={handleSubscriptionSuccess}
            onError={handleSubscriptionError}
          />
        </Elements>
      ) : (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Unable to set up subscription. Please try again.
          </AlertDescription>
        </Alert>
      )}

      {/* Billing Notice */}
      <div className="mt-6 p-4 bg-muted rounded-lg">
        <div className="text-sm space-y-2">
          <p className="font-medium">Billing Information</p>
          <ul className="space-y-1 text-muted-foreground">
            <li>• Billed monthly on the same date you subscribe</li>
            <li>• Cancel anytime from your account settings</li>
            <li>• Prorated billing for upgrades/downgrades</li>
            <li>• 30-day money-back guarantee</li>
          </ul>
        </div>
      </div>

      {/* Security Notice */}
      <div className="mt-4 p-4 bg-muted rounded-lg">
        <div className="flex items-start gap-2">
          <Zap className="h-4 w-4 text-primary mt-0.5" />
          <div className="text-sm">
            <p className="font-medium">Secure billing</p>
            <p className="text-muted-foreground">
              Your payment information is encrypted and processed securely through Stripe.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}