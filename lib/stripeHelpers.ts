// Stripe helper utilities for BittieTasks

export const SUBSCRIPTION_TIERS = {
  free: {
    name: 'Free Plan',
    price: 0,
    platformFee: 0.10, // 10%
    taskLimit: 5,
    features: [
      'Up to 5 tasks per month',
      '10% platform fee',
      'Basic task categories',
      'Community messaging',
      'Email support'
    ]
  },
  pro: {
    name: 'Pro Plan', 
    price: 9.99,
    platformFee: 0.07, // 7%
    taskLimit: 50,
    features: [
      'Up to 50 tasks per month',
      '7% platform fee (save 30%)',
      'Priority task matching',
      'Advanced analytics',
      'Priority support',
      'Early access to new features'
    ]
  },
  premium: {
    name: 'Premium Plan',
    price: 19.99,
    platformFee: 0.05, // 5%
    taskLimit: -1, // Unlimited
    features: [
      'Unlimited tasks',
      '5% platform fee (save 50%)',
      'Premium badge visibility',
      'Ad-free experience',
      'Custom task categories',
      'Direct messaging with sponsors',
      '24/7 priority support',
      'Monthly strategy consultation'
    ]
  }
} as const;

export type SubscriptionTier = keyof typeof SUBSCRIPTION_TIERS;

export function calculatePlatformFee(amount: number, tier: SubscriptionTier): number {
  const feeRate = SUBSCRIPTION_TIERS[tier].platformFee;
  return Math.round(amount * feeRate * 100) / 100; // Round to 2 decimal places
}

export function calculateNetEarnings(amount: number, tier: SubscriptionTier): number {
  const fee = calculatePlatformFee(amount, tier);
  return amount - fee;
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
}

export function canCreateTask(tier: SubscriptionTier, monthlyTasksCompleted: number): boolean {
  const limit = SUBSCRIPTION_TIERS[tier].taskLimit;
  return limit === -1 || monthlyTasksCompleted < limit;
}

export function getUpgradeRecommendation(monthlyTasksCompleted: number): SubscriptionTier | null {
  if (monthlyTasksCompleted >= 5 && monthlyTasksCompleted < 50) {
    return 'pro';
  } else if (monthlyTasksCompleted >= 50) {
    return 'premium';
  }
  return null;
}