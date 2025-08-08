import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { XCircle, ArrowLeft, RefreshCw, MessageCircle } from "lucide-react";

export default function PaymentError() {
  const [, setLocation] = useLocation();

  // Get error message from URL params
  const urlParams = new URLSearchParams(window.location.search);
  const errorMessage = urlParams.get('message') || 'An unexpected error occurred during payment processing.';

  const handleRetry = () => {
    setLocation('/checkout');
  };

  const handleSupport = () => {
    // You can implement support contact here
    window.open('mailto:support@bittietasks.com?subject=Payment Error', '_blank');
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-md">
      <Card className="text-center">
        <CardHeader>
          <div className="mx-auto mb-4 w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
            <XCircle className="h-8 w-8 text-red-600" />
          </div>
          <CardTitle className="text-2xl text-red-600">Payment Failed</CardTitle>
          <CardDescription>
            We couldn't process your payment
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertDescription>
              {errorMessage}
            </AlertDescription>
          </Alert>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>Common solutions:</strong>
            </p>
            <ul className="text-xs text-blue-700 mt-2 space-y-1 text-left">
              <li>• Check your payment method details</li>
              <li>• Ensure sufficient funds are available</li>
              <li>• Try a different payment method</li>
              <li>• Contact your bank if the issue persists</li>
            </ul>
          </div>

          <div className="space-y-3">
            <Button 
              onClick={handleRetry}
              className="w-full"
              size="lg"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
            
            <Button 
              variant="outline"
              onClick={handleSupport}
              className="w-full"
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Contact Support
            </Button>

            <Button 
              variant="ghost"
              onClick={() => setLocation('/')}
              className="w-full"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </div>

          <div className="text-xs text-muted-foreground">
            If you continue to experience issues, please contact our support team.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}