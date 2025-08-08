import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, CreditCard, Shield, Zap, AlertCircle } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { PaymentForm } from "@/components/ui/payment-form";

// Make sure to call `loadStripe` outside of a component's render to avoid
// recreating the `Stripe` object on every render.
const stripePromise = import.meta.env.VITE_STRIPE_PUBLIC_KEY ? 
  loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY) : null;

interface CheckoutData {
  amount: number;
  taskId?: string;
  subscriptionTier?: 'pro' | 'premium';
  taskTitle?: string;
  description?: string;
}

export default function Checkout() {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<'stripe' | 'paypal' | 'escrow'>('stripe');
  const [clientSecret, setClientSecret] = useState<string>("");
  const [paypalApprovalUrl, setPaypalApprovalUrl] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);

  // Get checkout data from URL params or localStorage
  const [checkoutData, setCheckoutData] = useState<CheckoutData>({
    amount: 50,
    description: "BittieTasks Payment"
  });

  useEffect(() => {
    // Try to get checkout data from localStorage or URL params
    const urlParams = new URLSearchParams(window.location.search);
    const amount = urlParams.get('amount');
    const taskId = urlParams.get('taskId');
    const tier = urlParams.get('tier');
    
    if (amount || taskId || tier) {
      setCheckoutData({
        amount: amount ? parseFloat(amount) : 50,
        taskId: taskId || undefined,
        subscriptionTier: (tier as 'pro' | 'premium') || undefined,
        taskTitle: urlParams.get('title') || undefined,
        description: urlParams.get('description') || "BittieTasks Payment"
      });
    }
  }, []);

  // Create Stripe payment intent
  const createStripePayment = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/payments/create-payment-intent", {
        amount: checkoutData.amount,
        taskId: checkoutData.taskId,
        useEscrow: false
      });
      return response.json();
    },
    onSuccess: (data) => {
      if (data.clientSecret) {
        setClientSecret(data.clientSecret);
      }
    },
    onError: (error) => {
      console.error("Stripe payment creation failed:", error);
    }
  });

  // Create PayPal payment
  const createPayPalPayment = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/payments/create-paypal-order", {
        amount: checkoutData.amount,
        taskId: checkoutData.taskId
      });
      return response.json();
    },
    onSuccess: (data) => {
      if (data.success && data.approvalUrl) {
        setPaypalApprovalUrl(data.approvalUrl);
        window.open(data.approvalUrl, '_blank');
      }
    },
    onError: (error) => {
      console.error("PayPal payment creation failed:", error);
    }
  });

  // Create escrow payment
  const createEscrowPayment = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/payments/create-escrow", {
        amount: checkoutData.amount,
        buyerEmail: "buyer@example.com", // Should come from user data
        sellerEmail: "seller@example.com", // Should come from task provider
        description: checkoutData.description
      });
      return response.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        // Handle escrow payment success
        console.log("Escrow payment created:", data);
      }
    }
  });

  useEffect(() => {
    if (activeTab === 'stripe' && !clientSecret) {
      createStripePayment.mutate();
    }
  }, [activeTab]);

  const handlePaymentSuccess = () => {
    setLocation('/payment/success');
  };

  const handlePaymentError = (error: string) => {
    console.error("Payment error:", error);
  };

  const isStripeAvailable = !!stripePromise;
  const isPayPalAvailable = true; // PayPal doesn't require client-side keys
  const isEscrowAvailable = checkoutData.amount >= 100; // Escrow for high-value transactions

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="mb-6">
        <Button 
          variant="ghost" 
          onClick={() => window.history.back()}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        
        <h1 className="text-2xl font-bold mb-2">Secure Checkout</h1>
        <p className="text-muted-foreground">
          Choose your preferred payment method
        </p>
      </div>

      {/* Order Summary */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Order Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>{checkoutData.description}</span>
              <span className="font-medium">${checkoutData.amount.toFixed(2)}</span>
            </div>
            {checkoutData.subscriptionTier && (
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>{checkoutData.subscriptionTier.charAt(0).toUpperCase() + checkoutData.subscriptionTier.slice(1)} Plan</span>
                <span>Monthly</span>
              </div>
            )}
            <div className="border-t pt-2 flex justify-between font-semibold">
              <span>Total</span>
              <span>${checkoutData.amount.toFixed(2)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Methods */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Method</CardTitle>
          <CardDescription>
            All payment methods are secure and encrypted
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as typeof activeTab)}>
            <TabsList className="grid grid-cols-3 w-full">
              <TabsTrigger value="stripe" disabled={!isStripeAvailable}>
                <CreditCard className="h-4 w-4 mr-2" />
                Card
              </TabsTrigger>
              <TabsTrigger value="paypal" disabled={!isPayPalAvailable}>
                <div className="flex items-center">
                  <span className="mr-2">💙</span>
                  PayPal
                </div>
              </TabsTrigger>
              <TabsTrigger value="escrow" disabled={!isEscrowAvailable}>
                <Shield className="h-4 w-4 mr-2" />
                Escrow
              </TabsTrigger>
            </TabsList>

            {/* Stripe Payment */}
            <TabsContent value="stripe" className="space-y-4">
              {!isStripeAvailable ? (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Credit card payments are temporarily unavailable. Please try PayPal or contact support.
                  </AlertDescription>
                </Alert>
              ) : createStripePayment.isPending ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin w-6 h-6 border-4 border-primary border-t-transparent rounded-full mr-3" />
                  Setting up secure payment...
                </div>
              ) : createStripePayment.error ? (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Failed to set up payment. Please try another method.
                  </AlertDescription>
                </Alert>
              ) : clientSecret ? (
                <Elements stripe={stripePromise} options={{ clientSecret }}>
                  <PaymentForm
                    amount={checkoutData.amount}
                    taskTitle={checkoutData.taskTitle || "BittieTasks Payment"}
                    providerName="BittieTasks"
                    useEscrow={false}
                    onSuccess={handlePaymentSuccess}
                    onError={handlePaymentError}
                  />
                </Elements>
              ) : (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Unable to initialize payment. Please refresh and try again.
                  </AlertDescription>
                </Alert>
              )}
            </TabsContent>

            {/* PayPal Payment */}
            <TabsContent value="paypal" className="space-y-4">
              <div className="text-center">
                <div className="mb-4">
                  <div className="text-6xl mb-2">💙</div>
                  <h3 className="text-lg font-semibold">Pay with PayPal</h3>
                  <p className="text-muted-foreground">
                    Secure payments with buyer protection
                  </p>
                </div>
                
                {createPayPalPayment.isPending ? (
                  <Button disabled className="w-full">
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                    Creating PayPal Payment...
                  </Button>
                ) : (
                  <Button 
                    onClick={() => createPayPalPayment.mutate()}
                    className="w-full bg-[#0070ba] hover:bg-[#005ea6] text-white"
                    size="lg"
                  >
                    <span className="mr-2">💙</span>
                    Pay ${checkoutData.amount.toFixed(2)} with PayPal
                  </Button>
                )}

                {createPayPalPayment.error && (
                  <Alert variant="destructive" className="mt-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      PayPal payment setup failed. Please try another method.
                    </AlertDescription>
                  </Alert>
                )}

                <div className="mt-4 text-xs text-muted-foreground">
                  You'll be redirected to PayPal to complete your payment
                </div>
              </div>
            </TabsContent>

            {/* Escrow Payment */}
            <TabsContent value="escrow" className="space-y-4">
              {!isEscrowAvailable ? (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Escrow protection is available for payments of $100 or more.
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="text-center">
                  <div className="mb-4">
                    <Shield className="h-16 w-16 text-green-600 mx-auto mb-2" />
                    <h3 className="text-lg font-semibold">Escrow Protection</h3>
                    <p className="text-muted-foreground">
                      Maximum security for high-value transactions
                    </p>
                  </div>

                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                    <div className="flex items-center justify-center gap-2 text-green-800 font-medium mb-2">
                      <Shield className="h-4 w-4" />
                      Buyer Protection Included
                    </div>
                    <ul className="text-sm text-green-700 space-y-1">
                      <li>• Funds held securely until delivery</li>
                      <li>• Dispute resolution support</li>
                      <li>• Money-back guarantee</li>
                    </ul>
                  </div>

                  <Button 
                    onClick={() => createEscrowPayment.mutate()}
                    disabled={createEscrowPayment.isPending}
                    className="w-full"
                    size="lg"
                  >
                    {createEscrowPayment.isPending ? (
                      <>
                        <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                        Setting up Escrow...
                      </>
                    ) : (
                      <>
                        <Shield className="h-4 w-4 mr-2" />
                        Pay ${checkoutData.amount.toFixed(2)} with Escrow
                      </>
                    )}
                  </Button>

                  {createEscrowPayment.error && (
                    <Alert variant="destructive" className="mt-4">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        Escrow payment setup failed. Please try another method.
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Security Notice */}
      <div className="mt-6 p-4 bg-muted rounded-lg">
        <div className="flex items-start gap-2">
          <Shield className="h-4 w-4 text-green-600 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium">Secure & Encrypted</p>
            <p className="text-muted-foreground">
              All payments are protected with bank-level security and 256-bit SSL encryption.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}