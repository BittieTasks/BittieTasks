import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

// Initialize Stripe safely for build time
function getStripe() {
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeSecretKey) {
    throw new Error('STRIPE_SECRET_KEY environment variable is required');
  }
  return new Stripe(stripeSecretKey);
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: NextRequest) {
  try {
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
      .select('stripeSubscriptionId')
      .eq('id', user.id)
      .single();

    if (profileError || !userProfile?.stripeSubscriptionId) {
      return NextResponse.json(
        { error: 'No active subscription found' },
        { status: 404 }
      );
    }

    // Cancel subscription at period end
    const stripe = getStripe();
    const subscription = await stripe.subscriptions.update(
      userProfile.stripeSubscriptionId,
      {
        cancel_at_period_end: true,
      }
    );

    // Update user subscription status
    await supabase
      .from('users')
      .update({
        subscriptionStatus: 'cancelled',
        updatedAt: new Date().toISOString()
      })
      .eq('id', user.id);

    return NextResponse.json({
      success: true,
      cancelAt: subscription.cancel_at ? new Date(subscription.cancel_at * 1000).toISOString() : null
    });

  } catch (error: any) {
    console.error('Error cancelling subscription:', error);
    return NextResponse.json(
      { error: 'Failed to cancel subscription: ' + error.message },
      { status: 500 }
    );
  }
}