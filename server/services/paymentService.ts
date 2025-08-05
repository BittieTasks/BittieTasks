import Stripe from 'stripe';

// Initialize Stripe - will use environment variable when available
let stripe: Stripe | null = null;

export function initializeStripe() {
  if (process.env.STRIPE_SECRET_KEY) {
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2024-06-20',
    });
    console.log('✓ Stripe initialized successfully');
  } else {
    console.log('⚠️  STRIPE_SECRET_KEY not found - payment processing disabled');
  }
}

export function isStripeEnabled(): boolean {
  return stripe !== null;
}

export function getStripe(): Stripe {
  if (!stripe) {
    throw new Error('Stripe not initialized. Please check STRIPE_SECRET_KEY environment variable.');
  }
  return stripe;
}

// Payment Intent creation for marketplace transactions
export async function createPaymentIntent(
  amount: number, // in cents
  currency: string = 'usd',
  metadata: Record<string, string> = {}
): Promise<Stripe.PaymentIntent> {
  const stripeInstance = getStripe();
  
  return await stripeInstance.paymentIntents.create({
    amount,
    currency,
    metadata,
    automatic_payment_methods: {
      enabled: true,
    },
  });
}

// Create connected account for task providers (sellers)
export async function createConnectedAccount(
  email: string,
  businessType: 'individual' | 'company' = 'individual',
  country: string = 'US'
): Promise<Stripe.Account> {
  const stripeInstance = getStripe();
  
  return await stripeInstance.accounts.create({
    type: 'express',
    country,
    email,
    business_type: businessType,
    capabilities: {
      card_payments: { requested: true },
      transfers: { requested: true },
    },
  });
}

// Create account link for onboarding
export async function createAccountLink(
  accountId: string,
  refreshUrl: string,
  returnUrl: string
): Promise<Stripe.AccountLink> {
  const stripeInstance = getStripe();
  
  return await stripeInstance.accountLinks.create({
    account: accountId,
    refresh_url: refreshUrl,
    return_url: returnUrl,
    type: 'account_onboarding',
  });
}

// Transfer funds to connected account (after task completion)
export async function transferToConnectedAccount(
  amount: number, // in cents
  destinationAccount: string,
  transferGroup?: string
): Promise<Stripe.Transfer> {
  const stripeInstance = getStripe();
  
  return await stripeInstance.transfers.create({
    amount,
    currency: 'usd',
    destination: destinationAccount,
    transfer_group: transferGroup,
  });
}

// Create customer for subscription billing
export async function createCustomer(
  email: string,
  name?: string,
  metadata: Record<string, string> = {}
): Promise<Stripe.Customer> {
  const stripeInstance = getStripe();
  
  return await stripeInstance.customers.create({
    email,
    name,
    metadata,
  });
}

// Create subscription for Pro/Premium plans
export async function createSubscription(
  customerId: string,
  priceId: string,
  metadata: Record<string, string> = {}
): Promise<Stripe.Subscription> {
  const stripeInstance = getStripe();
  
  return await stripeInstance.subscriptions.create({
    customer: customerId,
    items: [{ price: priceId }],
    payment_behavior: 'default_incomplete',
    payment_settings: { save_default_payment_method: 'on_subscription' },
    expand: ['latest_invoice.payment_intent'],
    metadata,
  });
}

// Cancel subscription
export async function cancelSubscription(
  subscriptionId: string,
  cancelAtPeriodEnd: boolean = true
): Promise<Stripe.Subscription> {
  const stripeInstance = getStripe();
  
  return await stripeInstance.subscriptions.update(subscriptionId, {
    cancel_at_period_end: cancelAtPeriodEnd,
  });
}

// Calculate platform fee based on user's subscription tier
export function calculatePlatformFee(amount: number, subscriptionTier: string): number {
  const feeRates = {
    'free': 0.10,     // 10%
    'pro': 0.07,      // 7% 
    'premium': 0.05   // 5%
  };
  
  const rate = feeRates[subscriptionTier as keyof typeof feeRates] || feeRates.free;
  return Math.round(amount * rate);
}

// Webhook signature verification
export function verifyWebhookSignature(
  payload: string | Buffer,
  signature: string,
  secret: string
): Stripe.Event {
  const stripeInstance = getStripe();
  
  return stripeInstance.webhooks.constructEvent(payload, signature, secret);
}

// Initialize Stripe on module load
initializeStripe();