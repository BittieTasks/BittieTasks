import { useState } from "react";
import { useStripe, useElements, PaymentElement } from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Shield, Clock } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface PaymentFormProps {
  amount: number;
  taskTitle: string;
  providerName: string;
  useEscrow?: boolean;
  escrowFee?: number;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export function PaymentForm({ 
  amount, 
  taskTitle, 
  providerName, 
  useEscrow = false,
  escrowFee = 0,
  onSuccess,
  onError 
}: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const totalAmount = useEscrow ? amount + escrowFee : amount;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      if (useEscrow) {
        // For escrow payments, redirect to Escrow.com
        if (typeof window !== 'undefined') {
          window.open(
            `https://www.escrow.com/pay?amount=${amount}&description=${encodeURIComponent(taskTitle)}`,
            '_blank'
          );
        }
        onSuccess?.();
      } else {
        // For Stripe payments, confirm payment
        const { error } = await stripe.confirmPayment({
          elements,
          confirmParams: {
            return_url: typeof window !== 'undefined' ? `${window.location.origin}/payment-success` : 'https://www.bittietasks.com/payment-success',
          },
        });

        if (error) {
          setErrorMessage(error.message || "Payment failed");
          onError?.(error.message || "Payment failed");
        } else {
          onSuccess?.();
        }
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Payment failed";
      setErrorMessage(message);
      onError?.(message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {useEscrow ? (
            <>
              <Shield className="h-5 w-5 text-green-600" />
              Secure Escrow Payment
            </>
          ) : (
            "Complete Payment"
          )}
        </CardTitle>
        <CardDescription>
          Pay {providerName} for: {taskTitle}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Payment Summary */}
        <div className="space-y-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="flex justify-between text-sm">
            <span>Task Payment:</span>
            <span>${amount.toFixed(2)}</span>
          </div>
          
          {useEscrow && (
            <>
              <div className="flex justify-between text-sm">
                <span>Escrow Fee:</span>
                <span>${escrowFee.toFixed(2)}</span>
              </div>
              <hr className="my-2" />
            </>
          )}
          
          <div className="flex justify-between font-semibold">
            <span>Total:</span>
            <span>${totalAmount.toFixed(2)}</span>
          </div>
        </div>

        {/* Escrow Benefits */}
        {useEscrow && (
          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-1">
                <p className="font-medium">Protected by Escrow</p>
                <ul className="text-xs space-y-1">
                  <li>• Funds held securely until task completion</li>
                  <li>• 3-day inspection period</li>
                  <li>• Dispute resolution included</li>
                  <li>• Zero chargeback risk</li>
                </ul>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Payment Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {!useEscrow && (
            <div className="space-y-2">
              <PaymentElement />
            </div>
          )}

          {errorMessage && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}

          <Button 
            type="submit" 
            className="w-full" 
            disabled={isProcessing || (!useEscrow && (!stripe || !elements))}
          >
            {isProcessing ? (
              "Processing..."
            ) : useEscrow ? (
              `Pay $${totalAmount.toFixed(2)} with Escrow`
            ) : (
              `Pay $${totalAmount.toFixed(2)}`
            )}
          </Button>
        </form>

        {/* Payment Method Badges */}
        <div className="flex gap-2 justify-center pt-2">
          {useEscrow ? (
            <Badge variant="secondary" className="text-xs">
              <Shield className="h-3 w-3 mr-1" />
              Escrow Protected
            </Badge>
          ) : (
            <>
              <Badge variant="secondary" className="text-xs">Visa</Badge>
              <Badge variant="secondary" className="text-xs">Mastercard</Badge>
              <Badge variant="secondary" className="text-xs">Apple Pay</Badge>
              <Badge variant="secondary" className="text-xs">Google Pay</Badge>
            </>
          )}
        </div>

        {/* Processing Time */}
        <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          {useEscrow ? "Funds released after inspection period" : "Instant processing"}
        </div>
      </CardContent>
    </Card>
  );
}