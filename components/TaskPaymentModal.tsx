'use client';

import { useState } from 'react';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Coins, CreditCard, Shield } from 'lucide-react';
import { calculatePlatformFee, formatCurrency, type SubscriptionTier } from '@/lib/stripeHelpers';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_VITE_STRIPE_PUBLIC_KEY || process.env.VITE_STRIPE_PUBLIC_KEY!);

interface TaskPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskId: string;
  taskTitle: string;
  amount: number;
  userTier: SubscriptionTier;
  onPaymentSuccess?: () => void;
}

function PaymentForm({ 
  taskId, 
  taskTitle, 
  amount, 
  userTier, 
  onSuccess,
  onClose 
}: Omit<TaskPaymentModalProps, 'isOpen'>) {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const platformFee = calculatePlatformFee(amount, userTier);
  const netAmount = amount - platformFee;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!stripe || !elements) {
      toast({
        title: "Payment Error",
        description: "Payment system not ready. Please try again.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Create payment intent
      const response = await fetch('/api/stripe/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('supabase.auth.token')}`
        },
        body: JSON.stringify({
          taskId,
          amount,
          applicationFee: platformFee
        }),
      });

      const { clientSecret, error } = await response.json();

      if (error) {
        throw new Error(error);
      }

      // Confirm payment
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        throw new Error('Card element not found');
      }

      const { error: confirmError } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
        }
      });

      if (confirmError) {
        throw new Error(confirmError.message);
      }

      toast({
        title: "Payment Successful",
        description: `Payment of ${formatCurrency(amount)} completed successfully!`,
      });

      onSuccess?.();
      onClose();

    } catch (error: any) {
      toast({
        title: "Payment Failed",
        description: error.message || "Something went wrong with your payment.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Payment Summary */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Task Payment</span>
            <span className="font-medium">{formatCurrency(amount)}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600">Platform Fee ({Math.round(calculatePlatformFee(amount, userTier) / amount * 100)}%)</span>
            <span>-{formatCurrency(platformFee)}</span>
          </div>
          <div className="border-t pt-2 flex justify-between items-center font-medium">
            <span>You Receive</span>
            <span className="text-teal-600">{formatCurrency(netAmount)}</span>
          </div>
        </CardContent>
      </Card>

      {/* Payment Method */}
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <CreditCard className="h-4 w-4 text-gray-500" />
          <span className="text-sm font-medium">Payment Method</span>
        </div>
        <Card>
          <CardContent className="p-4">
            <CardElement
              options={{
                style: {
                  base: {
                    fontSize: '16px',
                    color: '#424770',
                    '::placeholder': {
                      color: '#aab7c4',
                    },
                  },
                },
              }}
            />
          </CardContent>
        </Card>
      </div>

      {/* Security Notice */}
      <div className="flex items-start space-x-2 text-xs text-gray-600 bg-gray-50 p-3 rounded-lg">
        <Shield className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
        <span>
          Your payment information is secure and encrypted. BittieTasks uses Stripe for secure payment processing.
        </span>
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={!stripe || isLoading}
        className="w-full bg-teal-600 hover:bg-teal-700 text-white"
      >
        {isLoading ? (
          <div className="flex items-center space-x-2">
            <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
            <span>Processing Payment...</span>
          </div>
        ) : (
          <div className="flex items-center space-x-2">
            <Coins className="w-4 h-4" />
            <span>Pay {formatCurrency(amount)}</span>
          </div>
        )}
      </Button>
    </form>
  );
}

export function TaskPaymentModal(props: TaskPaymentModalProps) {
  return (
    <Dialog open={props.isOpen} onOpenChange={props.onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Coins className="h-5 w-5 text-teal-600" />
            <span>Complete Task Payment</span>
          </DialogTitle>
          <DialogDescription>
            Complete payment for "{props.taskTitle}"
          </DialogDescription>
        </DialogHeader>

        <Elements stripe={stripePromise}>
          <PaymentForm {...props} />
        </Elements>
      </DialogContent>
    </Dialog>
  );
}