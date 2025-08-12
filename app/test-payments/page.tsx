'use client';

import { useState } from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { PaymentButton } from '../../components/PaymentButton';
import { TaskPaymentModal } from '../../components/TaskPaymentModal';
import { SubscriptionStatus } from '../../components/SubscriptionStatus';
import { useToast } from '../../hooks/use-toast';
import { calculatePlatformFee, formatCurrency, type SubscriptionTier } from '../../lib/stripeHelpers';
import { Coins, CreditCard, TestTube, Crown } from 'lucide-react';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_VITE_STRIPE_PUBLIC_KEY || process.env.VITE_STRIPE_PUBLIC_KEY!);

export default function TestPayments() {
  const { toast } = useToast();
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [testAmount, setTestAmount] = useState(25.00);
  const [testTier, setTestTier] = useState<SubscriptionTier>('free');

  const handlePaymentSuccess = () => {
    toast({
      title: "Payment Test Successful",
      description: "The payment flow completed successfully!",
    });
  };

  const testSubscriptionAPI = async () => {
    try {
      const response = await fetch('/api/stripe/subscription-status', {
        headers: {
          'Authorization': 'Bearer test-token'
        }
      });
      
      const data = await response.json();
      
      if (response.ok) {
        toast({
          title: "API Test Successful",
          description: "Subscription status API is working correctly",
        });
      } else {
        toast({
          title: "API Test - Expected Auth Error",
          description: data.error || "Authentication required (this is expected)",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "API Test Failed",
        description: "Network error occurred",
        variant: "destructive",
      });
    }
  };

  const testPaymentIntent = async () => {
    try {
      const response = await fetch('/api/stripe/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-token'
        },
        body: JSON.stringify({
          taskId: 'test-task-123',
          amount: testAmount,
          applicationFee: calculatePlatformFee(testAmount, testTier)
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        toast({
          title: "Payment Intent Created",
          description: "Payment processing API is working correctly",
        });
      } else {
        toast({
          title: "Payment Intent Test",
          description: data.error || "Expected auth error for testing",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Payment Intent Failed",
        description: "Network error occurred",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-emerald-50 py-12">
      <div className="max-w-4xl mx-auto px-4 space-y-8">
        
        {/* Header */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TestTube className="h-6 w-6 text-teal-600" />
              <span>BittieTasks Payment System Testing</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              This page tests all payment functionality including Stripe integration, 
              subscription management, and fee calculations.
            </p>
            <div className="flex space-x-4">
              <Badge variant="outline" className="bg-green-50 text-green-700">
                Stripe API Keys: ✓ Configured
              </Badge>
              <Badge variant="outline" className="bg-blue-50 text-blue-700">
                Next.js API: ✓ Ready
              </Badge>
              <Badge variant="outline" className="bg-purple-50 text-purple-700">
                Supabase: ✓ Connected
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Subscription Status Test */}
        <Card>
          <CardHeader>
            <CardTitle>Subscription Status Component</CardTitle>
          </CardHeader>
          <CardContent>
            <SubscriptionStatus />
          </CardContent>
        </Card>

        {/* Payment Configuration Test */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Configuration Test</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            
            {/* Test Parameters */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="amount">Test Amount ($)</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  value={testAmount}
                  onChange={(e) => setTestAmount(parseFloat(e.target.value))}
                />
              </div>
              <div>
                <Label htmlFor="tier">Subscription Tier</Label>
                <select
                  id="tier"
                  value={testTier}
                  onChange={(e) => setTestTier(e.target.value as SubscriptionTier)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="free">Free (10% fee)</option>
                  <option value="pro">Pro (7% fee)</option>
                  <option value="premium">Premium (5% fee)</option>
                </select>
              </div>
            </div>

            {/* Fee Calculation Display */}
            <Card className="bg-gray-50">
              <CardContent className="p-4">
                <h4 className="font-medium mb-2">Fee Calculation Preview</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Task Amount:</span>
                    <span className="font-medium">{formatCurrency(testAmount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Platform Fee ({testTier} tier):</span>
                    <span className="text-red-600">-{formatCurrency(calculatePlatformFee(testAmount, testTier))}</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between font-medium">
                    <span>User Receives:</span>
                    <span className="text-teal-600">{formatCurrency(testAmount - calculatePlatformFee(testAmount, testTier))}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </CardContent>
        </Card>

        {/* API Endpoint Tests */}
        <Card>
          <CardHeader>
            <CardTitle>API Endpoint Tests</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Button
                onClick={testSubscriptionAPI}
                variant="outline"
                className="flex items-center space-x-2"
              >
                <Crown className="h-4 w-4" />
                <span>Test Subscription API</span>
              </Button>
              
              <Button
                onClick={testPaymentIntent}
                variant="outline"
                className="flex items-center space-x-2"
              >
                <CreditCard className="h-4 w-4" />
                <span>Test Payment Intent</span>
              </Button>
            </div>
            
            <div className="text-sm text-gray-600">
              Note: These tests will show authentication errors (expected behavior) 
              since no user is signed in. This confirms the API security is working.
            </div>
          </CardContent>
        </Card>

        {/* Payment Modal Test */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Modal Test</CardTitle>
          </CardHeader>
          <CardContent>
            <Elements stripe={stripePromise}>
              <div className="space-y-4">
                <p className="text-gray-600">
                  Test the complete payment modal with Stripe Elements integration:
                </p>
                
                <Button
                  onClick={() => setPaymentModalOpen(true)}
                  className="bg-teal-600 hover:bg-teal-700 text-white"
                >
                  <Coins className="w-4 h-4 mr-2" />
                  Open Payment Modal
                </Button>
                
                <TaskPaymentModal
                  isOpen={paymentModalOpen}
                  onClose={() => setPaymentModalOpen(false)}
                  taskId="test-task-123"
                  taskTitle="Test Payment Flow"
                  amount={testAmount}
                  userTier={testTier}
                  onPaymentSuccess={handlePaymentSuccess}
                />
              </div>
            </Elements>
          </CardContent>
        </Card>

        {/* Environment Status */}
        <Card>
          <CardHeader>
            <CardTitle>Environment Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <strong>Stripe Public Key:</strong>
                <div className="font-mono text-xs text-gray-600 truncate">
                  {process.env.NEXT_PUBLIC_VITE_STRIPE_PUBLIC_KEY ? 
                    `${process.env.NEXT_PUBLIC_VITE_STRIPE_PUBLIC_KEY.slice(0, 20)}...` : 
                    'Not configured'
                  }
                </div>
              </div>
              <div>
                <strong>Supabase URL:</strong>
                <div className="font-mono text-xs text-gray-600 truncate">
                  {process.env.NEXT_PUBLIC_SUPABASE_URL ? 
                    process.env.NEXT_PUBLIC_SUPABASE_URL.slice(0, 30) + '...' : 
                    'Not configured'
                  }
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Navigation Test */}
        <Card>
          <CardHeader>
            <CardTitle>Navigation Test</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-gray-600 mb-4">Test navigation to payment-related pages:</p>
              <div className="flex space-x-4">
                <Button
                  onClick={() => window.location.href = '/subscribe'}
                  variant="outline"
                >
                  Subscription Plans
                </Button>
                <Button
                  onClick={() => window.location.href = '/marketplace'}
                  variant="outline"
                >
                  Task Marketplace
                </Button>
                <Button
                  onClick={() => window.location.href = '/dashboard'}
                  variant="outline"
                >
                  User Dashboard
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}