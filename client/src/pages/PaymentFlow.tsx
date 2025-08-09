import { useState } from 'react';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { 
  DollarSign, 
  Users, 
  Building2, 
  CheckCircle, 
  AlertCircle,
  CreditCard
} from 'lucide-react';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY!);

interface PaymentFlowProps {
  taskId: string;
  taskTitle: string;
  totalAmount: number;
  participants: Array<{
    id: string;
    name: string;
    email: string;
  }>;
  paymentType: 'task_payment' | 'sponsorship';
  sponsorInfo?: {
    name: string;
    sponsorshipAmount: number;
    communityBonus: number;
  };
}

function PaymentForm({ 
  taskId, 
  taskTitle, 
  totalAmount, 
  participants, 
  paymentType,
  sponsorInfo 
}: PaymentFlowProps) {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const createPaymentMutation = useMutation({
    mutationFn: (data: any) => {
      const endpoint = paymentType === 'sponsorship' 
        ? '/api/sponsor-payment' 
        : '/api/create-payment-intent';
      return apiRequest('POST', endpoint, data);
    }
  });

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/payment-success?task=${taskId}`,
        },
      });

      if (error) {
        toast({
          title: "Payment Failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Payment Successful",
          description: "Task payment processed successfully!",
        });
      }
    } catch (error) {
      toast({
        title: "Payment Error",
        description: "An unexpected error occurred during payment",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const amountPerPerson = totalAmount / participants.length;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />
      
      <div className="space-y-4 pt-4">
        <Separator />
        
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Payment Processing</span>
          <Badge variant="secondary">Secure</Badge>
        </div>
        
        <Button 
          type="submit" 
          disabled={!stripe || isProcessing}
          className="w-full"
          size="lg"
        >
          {isProcessing ? (
            <>
              <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
              Processing Payment...
            </>
          ) : (
            <>
              <CreditCard className="w-4 h-4 mr-2" />
              Pay ${totalAmount.toFixed(2)}
            </>
          )}
        </Button>
      </div>
    </form>
  );
}

export default function PaymentFlow(props: PaymentFlowProps) {
  const { toast } = useToast();
  const [clientSecret, setClientSecret] = useState<string>('');
  const [paymentDetails, setPaymentDetails] = useState<any>(null);

  const initializePayment = useMutation({
    mutationFn: async () => {
      const endpoint = props.paymentType === 'sponsorship' 
        ? '/api/sponsor-payment' 
        : '/api/create-payment-intent';
        
      const payload = props.paymentType === 'sponsorship' 
        ? {
            sponsorId: 'corp-sponsor-001',
            taskId: props.taskId,
            sponsorshipAmount: props.sponsorInfo?.sponsorshipAmount || 0,
            communityBonus: props.sponsorInfo?.communityBonus || 0
          }
        : {
            taskId: props.taskId,
            amount: props.totalAmount,
            participants: props.participants
          };

      const response = await apiRequest('POST', endpoint, payload);
      return response.json();
    },
    onSuccess: (data) => {
      setClientSecret(data.clientSecret);
      setPaymentDetails(data);
    },
    onError: (error) => {
      toast({
        title: "Payment Setup Failed",
        description: "Unable to initialize payment. Please try again.",
        variant: "destructive",
      });
    }
  });

  if (!clientSecret) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            {props.paymentType === 'sponsorship' ? 'Corporate Sponsorship' : 'Task Payment'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-medium">Task</span>
              <span>{props.taskTitle}</span>
            </div>
            
            {props.paymentType === 'sponsorship' && props.sponsorInfo ? (
              <>
                <div className="flex items-center justify-between">
                  <span className="font-medium">Sponsor</span>
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4" />
                    <span>{props.sponsorInfo.name}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium">Sponsorship Amount</span>
                  <span className="text-green-600 font-bold">
                    ${props.sponsorInfo.sponsorshipAmount.toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium">Community Bonus</span>
                  <span className="text-blue-600 font-bold">
                    ${props.sponsorInfo.communityBonus.toFixed(2)}
                  </span>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <span className="font-medium">Participants</span>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    <span>{props.participants.length}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium">Amount per Person</span>
                  <span className="text-green-600 font-bold">
                    ${(props.totalAmount / props.participants.length).toFixed(2)}
                  </span>
                </div>
              </>
            )}
            
            <Separator />
            
            <div className="flex items-center justify-between text-lg font-bold">
              <span>Total Amount</span>
              <span className="text-green-600">${props.totalAmount.toFixed(2)}</span>
            </div>
            
            {props.paymentType !== 'sponsorship' && (
              <div className="text-sm text-muted-foreground">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="w-4 h-4" />
                  <span>Platform Fee (5%): ${(props.totalAmount * 0.05).toFixed(2)}</span>
                </div>
                <p>The platform fee helps maintain BittieTasks and ensures secure payments.</p>
              </div>
            )}
          </div>
          
          <Button 
            onClick={() => initializePayment.mutate()}
            disabled={initializePayment.isPending}
            size="lg"
            className="w-full"
          >
            {initializePayment.isPending ? (
              <>
                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                Setting up payment...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Initialize Payment
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    );
  }

  const options = {
    clientSecret,
    appearance: {
      theme: 'stripe' as const,
    },
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="w-5 h-5" />
          Complete Payment
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Elements stripe={stripePromise} options={options}>
          <PaymentForm {...props} />
        </Elements>
        
        <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
          <div className="flex items-center gap-2 text-green-800 dark:text-green-200">
            <CheckCircle className="w-4 h-4" />
            <span className="font-medium">Secure Payment</span>
          </div>
          <p className="text-sm text-green-700 dark:text-green-300 mt-1">
            Your payment is processed securely by Stripe. BittieTasks never stores your payment information.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}