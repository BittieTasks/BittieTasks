import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { PaymentForm } from "@/components/ui/payment-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, Shield, CreditCard, AlertCircle } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

// Initialize Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || "");

interface PaymentData {
  clientSecret?: string;
  useEscrow: boolean;
  amount: number;
  escrowFee?: number;
  paymentUrl?: string;
}

export default function Payment() {
  const params = useParams();
  const [, setLocation] = useLocation();
  const taskCompletionId = params.id;
  
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'escrow'>('stripe');
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null);
  const [amount, setAmount] = useState(50); // Default amount

  // Get task completion details
  const { data: taskCompletion, isLoading: isLoadingTask } = useQuery({
    queryKey: ['/api/task-completions', taskCompletionId],
    enabled: !!taskCompletionId
  });

  // Create payment intent
  const createPaymentMutation = useMutation({
    mutationFn: async (data: { taskCompletionId: string; amount: number; useEscrow: boolean }) => {
      const response = await apiRequest("POST", "/api/payments/create-payment-intent", data);
      return response.json();
    },
    onSuccess: (data: PaymentData) => {
      setPaymentData(data);
      if (data.useEscrow && data.paymentUrl) {
        // For escrow, open payment URL
        window.open(data.paymentUrl, '_blank');
      }
    }
  });

  useEffect(() => {
    if (taskCompletion && amount) {
      createPaymentMutation.mutate({
        taskCompletionId: taskCompletionId!,
        amount,
        useEscrow: paymentMethod === 'escrow'
      });
    }
  }, [taskCompletion, amount, paymentMethod]);

  const handlePaymentSuccess = () => {
    setLocation(`/task-completion/${taskCompletionId}/success`);
  };

  const handlePaymentError = (error: string) => {
    console.error("Payment error:", error);
  };

  if (isLoadingTask) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!taskCompletion) {
    return (
      <div className="max-w-md mx-auto mt-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Task completion not found. Please check the link and try again.
          </AlertDescription>
        </Alert>
        <Button 
          variant="outline" 
          className="w-full mt-4"
          onClick={() => setLocation('/tasks')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Tasks
        </Button>
      </div>
    );
  }

  // Check if Stripe is available
  const isStripeAvailable = !!import.meta.env.VITE_STRIPE_PUBLIC_KEY;

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="mb-6">
        <Button 
          variant="ghost" 
          onClick={() => setLocation(`/task-completion/${taskCompletionId}`)}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Task
        </Button>
        
        <h1 className="text-2xl font-bold mb-2">Complete Payment</h1>
        <p className="text-muted-foreground">
          Secure payment for task completion
        </p>
      </div>

      {/* Payment Method Selection */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Choose Payment Method</CardTitle>
          <CardDescription>
            Select how you'd like to pay for this task
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Stripe Option */}
          <div 
            className={`p-4 border rounded-lg cursor-pointer transition-colors ${
              paymentMethod === 'stripe' 
                ? 'border-primary bg-primary/5' 
                : 'border-border hover:border-primary/50'
            } ${!isStripeAvailable ? 'opacity-50 cursor-not-allowed' : ''}`}
            onClick={() => isStripeAvailable && setPaymentMethod('stripe')}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CreditCard className="h-5 w-5" />
                <div>
                  <p className="font-medium">Credit/Debit Card</p>
                  <p className="text-sm text-muted-foreground">
                    {isStripeAvailable ? 'Instant payment processing' : 'Temporarily unavailable'}
                  </p>
                </div>
              </div>
              <Badge variant={paymentMethod === 'stripe' ? 'default' : 'secondary'}>
                {isStripeAvailable ? 'Instant' : 'Unavailable'}
              </Badge>
            </div>
          </div>

          {/* Escrow Option */}
          <div 
            className={`p-4 border rounded-lg cursor-pointer transition-colors ${
              paymentMethod === 'escrow' 
                ? 'border-primary bg-primary/5' 
                : 'border-border hover:border-primary/50'
            }`}
            onClick={() => setPaymentMethod('escrow')}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Shield className="h-5 w-5 text-green-600" />
                <div>
                  <p className="font-medium">Escrow Protection</p>
                  <p className="text-sm text-muted-foreground">
                    Secure payment with buyer protection
                  </p>
                </div>
              </div>
              <Badge variant={paymentMethod === 'escrow' ? 'default' : 'secondary'}>
                Protected
              </Badge>
            </div>
          </div>

          {/* Amount Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Payment Amount</label>
            <div className="flex">
              <span className="inline-flex items-center px-3 border border-r-0 border-border rounded-l-md bg-muted text-muted-foreground">
                $
              </span>
              <input
                type="number"
                min="10"
                max="5000"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                className="flex-1 px-3 py-2 border border-border rounded-r-md focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="50.00"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Minimum $10, Maximum $5,000
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Payment Form */}
      {createPaymentMutation.isPending ? (
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <div className="animate-spin w-6 h-6 border-4 border-primary border-t-transparent rounded-full mr-3" />
            Setting up payment...
          </CardContent>
        </Card>
      ) : createPaymentMutation.error ? (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {createPaymentMutation.error.message || 'Failed to set up payment'}
          </AlertDescription>
        </Alert>
      ) : paymentData ? (
        paymentData.useEscrow ? (
          <Card>
            <CardContent className="text-center py-8">
              <Shield className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Escrow Payment Ready</h3>
              <p className="text-muted-foreground mb-4">
                Click the button below to complete your secure payment
              </p>
              <Button onClick={() => window.open(paymentData.paymentUrl, '_blank')}>
                Pay ${paymentData.amount.toFixed(2)} with Escrow
              </Button>
            </CardContent>
          </Card>
        ) : paymentData.clientSecret && isStripeAvailable ? (
          <Elements stripe={stripePromise} options={{ clientSecret: paymentData.clientSecret }}>
            <PaymentForm
              amount={paymentData.amount}
              taskTitle="Task"
              providerName="Provider"
              useEscrow={false}
              onSuccess={handlePaymentSuccess}
              onError={handlePaymentError}
            />
          </Elements>
        ) : (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Payment processing is temporarily unavailable. Please try again later.
            </AlertDescription>
          </Alert>
        )
      ) : null}

      {/* Security Notice */}
      <div className="mt-6 p-4 bg-muted rounded-lg">
        <div className="flex items-start gap-2">
          <Shield className="h-4 w-4 text-green-600 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium">Your payment is secure</p>
            <p className="text-muted-foreground">
              All payments are processed through industry-leading security providers with 256-bit encryption.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}