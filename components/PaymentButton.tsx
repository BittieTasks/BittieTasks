'use client';

import { useState } from 'react';
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Coins } from 'lucide-react';

interface PaymentButtonProps {
  taskId: string;
  amount: number;
  applicationFee?: number;
  onSuccess?: () => void;
  children?: React.ReactNode;
}

export function PaymentButton({ 
  taskId, 
  amount, 
  applicationFee, 
  onSuccess, 
  children 
}: PaymentButtonProps) {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handlePayment = async () => {
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
          applicationFee
        }),
      });

      const { clientSecret, error } = await response.json();

      if (error) {
        throw new Error(error);
      }

      // Confirm payment
      const { error: confirmError } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement)!,
        }
      });

      if (confirmError) {
        throw new Error(confirmError.message);
      }

      toast({
        title: "Payment Successful",
        description: `$${amount.toFixed(2)} payment completed successfully!`,
      });

      onSuccess?.();

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
    <Button
      onClick={handlePayment}
      disabled={!stripe || isLoading}
      className="bg-teal-600 hover:bg-teal-700 text-white"
    >
      {isLoading ? (
        <div className="flex items-center space-x-2">
          <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
          <span>Processing...</span>
        </div>
      ) : (
        <div className="flex items-center space-x-2">
          <Coins className="w-4 h-4" />
          <span>{children || `Pay $${amount.toFixed(2)}`}</span>
        </div>
      )}
    </Button>
  );
}