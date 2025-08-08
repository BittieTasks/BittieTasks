import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useLocation } from "wouter";
import { 
  CreditCard, 
  Shield, 
  DollarSign, 
  CheckCircle, 
  AlertCircle,
  ArrowLeft,
  Plus,
  Zap,
  Lock
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface PaymentStatus {
  stripe: {
    enabled: boolean;
    features: string[];
  };
  escrow: {
    enabled: boolean;
    minimumAmount: number;
    features: string[];
  };
  paypalEnabled?: boolean;
}

export default function PaymentMethods() {
  const [, setLocation] = useLocation();

  const { data: paymentStatus, isLoading } = useQuery<PaymentStatus>({
    queryKey: ['/api/payments/status'],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/payments/status");
      return response.json();
    }
  });

  const { data: userPaymentMethods } = useQuery({
    queryKey: ['/api/payments/payment-methods']
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="mb-6">
        <Button 
          variant="ghost" 
          onClick={() => setLocation('/profile')}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Profile
        </Button>
        
        <h1 className="text-2xl font-bold mb-2">Payment Methods</h1>
        <p className="text-muted-foreground">
          Choose how you want to pay and get paid on BittieTasks
        </p>
      </div>

      {/* Payment Status Overview */}
      <Alert className="mb-6">
        <CheckCircle className="h-4 w-4" />
        <AlertDescription>
          All payment methods use bank-level security with 256-bit encryption to protect your financial information.
        </AlertDescription>
      </Alert>

      {/* Available Payment Methods */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Available Payment Methods</h2>

        {/* Credit/Debit Cards (Stripe) */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <CreditCard className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <CardTitle>Credit & Debit Cards</CardTitle>
                  <CardDescription>Visa, Mastercard, American Express, Discover</CardDescription>
                </div>
              </div>
              <Badge variant={paymentStatus?.stripe.enabled ? "default" : "secondary"}>
                {paymentStatus?.stripe.enabled ? "Active" : "Unavailable"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-green-600">
                <CheckCircle className="h-4 w-4" />
                <span>Instant payment processing</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-green-600">
                <CheckCircle className="h-4 w-4" />
                <span>Secure tokenization</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-green-600">
                <CheckCircle className="h-4 w-4" />
                <span>3D Secure authentication</span>
              </div>
              
              {paymentStatus?.stripe.enabled ? (
                <Button onClick={() => setLocation('/checkout')} className="w-full mt-4">
                  <Plus className="h-4 w-4 mr-2" />
                  Make a Test Payment
                </Button>
              ) : (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Credit card payments are temporarily unavailable. Please contact support.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </CardContent>
        </Card>

        {/* PayPal */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl">💙</span>
                </div>
                <div>
                  <CardTitle>PayPal</CardTitle>
                  <CardDescription>Pay with your PayPal account or linked cards</CardDescription>
                </div>
              </div>
              <Badge variant="default">Active</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-green-600">
                <CheckCircle className="h-4 w-4" />
                <span>Buyer protection included</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-green-600">
                <CheckCircle className="h-4 w-4" />
                <span>No card details shared</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-green-600">
                <CheckCircle className="h-4 w-4" />
                <span>Express checkout</span>
              </div>
              
              <Button 
                onClick={() => setLocation('/checkout?method=paypal')} 
                className="w-full mt-4 bg-[#0070ba] hover:bg-[#005ea6]"
              >
                <span className="mr-2">💙</span>
                Test PayPal Payment
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Escrow Protection */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <Shield className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <CardTitle>Escrow Protection</CardTitle>
                  <CardDescription>Maximum security for high-value transactions ($100+)</CardDescription>
                </div>
              </div>
              <Badge variant={paymentStatus?.escrow.enabled ? "default" : "secondary"}>
                {paymentStatus?.escrow.enabled ? "Active" : "Unavailable"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-green-600">
                <CheckCircle className="h-4 w-4" />
                <span>Funds held until service completion</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-green-600">
                <CheckCircle className="h-4 w-4" />
                <span>Dispute resolution support</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-green-600">
                <CheckCircle className="h-4 w-4" />
                <span>Money-back guarantee</span>
              </div>
              
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-3">
                <p className="text-xs text-green-800">
                  <strong>Minimum:</strong> ${paymentStatus?.escrow.minimumAmount || 100} • 
                  <strong>Fee:</strong> 2.5% or $15 minimum
                </p>
              </div>
              
              {paymentStatus?.escrow.enabled ? (
                <Button 
                  onClick={() => setLocation('/checkout?method=escrow&amount=150')} 
                  variant="outline"
                  className="w-full mt-4 border-green-600 text-green-600 hover:bg-green-50"
                >
                  <Shield className="h-4 w-4 mr-2" />
                  Test Escrow Payment
                </Button>
              ) : (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Escrow protection is temporarily unavailable.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Security Information */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Security & Protection
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium mb-2">Industry Standards</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• PCI DSS Level 1 compliance</li>
                <li>• 256-bit SSL encryption</li>
                <li>• Tokenized card storage</li>
                <li>• Real-time fraud monitoring</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Your Protection</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Zero liability for fraud</li>
                <li>• Secure payment processing</li>
                <li>• 24/7 transaction monitoring</li>
                <li>• Instant dispute resolution</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <Button onClick={() => setLocation('/checkout')} size="lg">
          <Zap className="h-4 w-4 mr-2" />
          Make a Payment
        </Button>
        <Button 
          variant="outline" 
          onClick={() => setLocation('/subscription')}
          size="lg"
        >
          <DollarSign className="h-4 w-4 mr-2" />
          Subscription Plans
        </Button>
      </div>
    </div>
  );
}