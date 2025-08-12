import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Subscription plans matching BittieTasks tiers
const SUBSCRIPTION_PLANS = {
  pro: {
    priceId: process.env.STRIPE_PRO_PRICE_ID || 'price_pro_monthly',
    name: 'Pro Plan',
    amount: 999, // $9.99 in cents
    features: ['7% platform fee', '50 tasks per month', 'Priority support']
  },
  premium: {
    priceId: process.env.STRIPE_PREMIUM_PRICE_ID || 'price_premium_monthly',
    name: 'Premium Plan',
    amount: 1999, // $19.99 in cents
    features: ['5% platform fee', 'Unlimited tasks', 'Premium badge', 'Ad-free experience']
  }
};

export async function POST(request: NextRequest) {
  try {
    const { planType } = await request.json();

    // Validate plan type
    if (!planType || !SUBSCRIPTION_PLANS[planType as keyof typeof SUBSCRIPTION_PLANS]) {
      return NextResponse.json(
        { error: 'Invalid subscription plan' },
        { status: 400 }
      );
    }

    // Get authenticated user
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authorization required' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Invalid authentication' },
        { status: 401 }
      );
    }

    // Get user profile from database
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError) {
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      );
    }

    let customerId = userProfile.stripeCustomerId;

    // Create Stripe customer if doesn't exist
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email!,
        name: `${userProfile.firstName} ${userProfile.lastName}`,
        metadata: {
          userId: user.id,
          platform: 'bittietasks'
        }
      });

      customerId = customer.id;

      // Update user with customer ID
      await supabase
        .from('users')
        .update({ stripeCustomerId: customerId })
        .eq('id', user.id);
    }

    const plan = SUBSCRIPTION_PLANS[planType as keyof typeof SUBSCRIPTION_PLANS];

    // Create subscription
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{
        price: plan.priceId,
      }],
      payment_behavior: 'default_incomplete',
      payment_settings: { save_default_payment_method: 'on_subscription' },
      expand: ['latest_invoice.payment_intent'],
      metadata: {
        userId: user.id,
        planType,
        platform: 'bittietasks'
      }
    });

    // Update user subscription info
    await supabase
      .from('users')
      .update({
        stripeSubscriptionId: subscription.id,
        subscriptionTier: planType,
        subscriptionStatus: 'active',
        subscriptionStartDate: new Date().toISOString(),
        monthlyTaskLimit: planType === 'pro' ? 50 : -1, // -1 for unlimited
        prioritySupport: true,
        adFree: planType === 'premium',
        premiumBadge: planType === 'premium'
      })
      .eq('id', user.id);

    const invoice = subscription.latest_invoice as any;
    const paymentIntent = invoice?.payment_intent;

    return NextResponse.json({
      subscriptionId: subscription.id,
      clientSecret: paymentIntent.client_secret,
      status: subscription.status
    });

  } catch (error: any) {
    console.error('Error creating subscription:', error);
    return NextResponse.json(
      { error: 'Failed to create subscription: ' + error.message },
      { status: 500 }
    );
  }
}