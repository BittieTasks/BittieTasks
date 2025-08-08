import { useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Home, Receipt } from "lucide-react";

export default function PaymentSuccess() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    // Optional: Track payment success event
    console.log("Payment completed successfully");
  }, []);

  return (
    <div className="container mx-auto px-4 py-8 max-w-md">
      <Card className="text-center">
        <CardHeader>
          <div className="mx-auto mb-4 w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl text-green-600">Payment Successful!</CardTitle>
          <CardDescription>
            Your payment has been processed successfully
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-sm text-green-800">
              You will receive a confirmation email shortly with your payment details.
            </p>
          </div>

          <div className="space-y-3">
            <Button 
              onClick={() => setLocation('/tasks')}
              className="w-full"
              size="lg"
            >
              <Receipt className="h-4 w-4 mr-2" />
              View My Tasks
            </Button>
            
            <Button 
              variant="outline"
              onClick={() => setLocation('/')}
              className="w-full"
            >
              <Home className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </div>

          <div className="text-xs text-muted-foreground">
            Need help? Contact our support team for assistance.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}