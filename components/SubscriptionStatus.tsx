'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Crown, Zap, Coins, ArrowUpRight } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useRouter } from 'next/navigation';

interface UserSubscription {
  subscriptionTier: 'free' | 'pro' | 'premium';
  subscriptionStatus: string;
  monthlyTaskLimit: number;
  monthlyTasksCompleted: number;
  totalEarnings: string;
  prioritySupport: boolean;
  adFree: boolean;
  premiumBadge: boolean;
}

export function SubscriptionStatus() {
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) return;

    // Fetch user subscription details
    fetch('/api/auth/profile', {
      headers: {
        'Authorization': `Bearer ${user.access_token}`
      }
    })
      .then(res => res.json())
      .then(data => {
        if (data.user) {
          setSubscription({
            subscriptionTier: data.user.subscriptionTier || 'free',
            subscriptionStatus: data.user.subscriptionStatus || 'active',
            monthlyTaskLimit: data.user.monthlyTaskLimit || 5,
            monthlyTasksCompleted: data.user.monthlyTasksCompleted || 0,
            totalEarnings: data.user.totalEarnings || '0.00',
            prioritySupport: data.user.prioritySupport || false,
            adFree: data.user.adFree || false,
            premiumBadge: data.user.premiumBadge || false
          });
        }
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, [user]);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!subscription) return null;

  const planConfig = {
    free: {
      name: 'Free Plan',
      icon: Coins,
      color: 'text-gray-600',
      bgColor: 'bg-gray-100',
      fee: '10%'
    },
    pro: {
      name: 'Pro Plan',
      icon: Zap,
      color: 'text-teal-600',
      bgColor: 'bg-teal-100',
      fee: '7%'
    },
    premium: {
      name: 'Premium Plan',
      icon: Crown,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
      fee: '5%'
    }
  };

  const plan = planConfig[subscription.subscriptionTier];
  const Icon = plan.icon;
  const remainingTasks = subscription.monthlyTaskLimit === -1 
    ? 'Unlimited' 
    : subscription.monthlyTaskLimit - subscription.monthlyTasksCompleted;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-full ${plan.bgColor}`}>
              <Icon className={`h-5 w-5 ${plan.color}`} />
            </div>
            <div>
              <CardTitle className="text-lg">{plan.name}</CardTitle>
              <CardDescription>
                {plan.fee} platform fee • ${subscription.totalEarnings} earned
              </CardDescription>
            </div>
          </div>
          {subscription.subscriptionTier !== 'premium' && (
            <Button
              onClick={() => router.push('/subscribe')}
              size="sm"
              className="bg-teal-600 hover:bg-teal-700 text-white"
            >
              Upgrade
              <ArrowUpRight className="ml-1 h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Task Usage */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600">Monthly Tasks</span>
            <span className="text-sm font-medium">
              {subscription.monthlyTasksCompleted} / {subscription.monthlyTaskLimit === -1 ? '∞' : subscription.monthlyTaskLimit}
            </span>
          </div>
          {subscription.monthlyTaskLimit !== -1 && (
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-teal-600 h-2 rounded-full"
                style={{ 
                  width: `${Math.min((subscription.monthlyTasksCompleted / subscription.monthlyTaskLimit) * 100, 100)}%` 
                }}
              />
            </div>
          )}
          <p className="text-xs text-gray-500 mt-1">
            {typeof remainingTasks === 'number' 
              ? `${remainingTasks} tasks remaining this month`
              : 'Unlimited tasks available'
            }
          </p>
        </div>

        {/* Premium Features */}
        {(subscription.prioritySupport || subscription.adFree || subscription.premiumBadge) && (
          <div className="pt-2 border-t">
            <p className="text-sm text-gray-600 mb-2">Active Features:</p>
            <div className="flex flex-wrap gap-2">
              {subscription.prioritySupport && (
                <Badge variant="secondary" className="text-xs">Priority Support</Badge>
              )}
              {subscription.adFree && (
                <Badge variant="secondary" className="text-xs">Ad-Free</Badge>
              )}
              {subscription.premiumBadge && (
                <Badge variant="secondary" className="text-xs bg-yellow-100 text-yellow-800">Premium Badge</Badge>
              )}
            </div>
          </div>
        )}

        {/* Upgrade Benefits */}
        {subscription.subscriptionTier === 'free' && (
          <div className="pt-2 border-t">
            <p className="text-sm text-gray-600 mb-2">Upgrade to save on fees:</p>
            <div className="space-y-1 text-xs text-gray-500">
              <div>• Pro Plan: 7% fee (save 30%)</div>
              <div>• Premium Plan: 5% fee (save 50%)</div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}