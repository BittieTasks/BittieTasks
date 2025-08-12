import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(request: NextRequest) {
  const body = await request.text();
  const sig = request.headers.get('stripe-signature');

  let event: Stripe.Event;

  try {
    if (!endpointSecret) {
      throw new Error('Stripe webhook secret not configured');
    }
    event = stripe.webhooks.constructEvent(body, sig!, endpointSecret);
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return NextResponse.json(
      { error: 'Webhook signature verification failed' },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSucceeded(event.data.object as Stripe.PaymentIntent);
        break;

      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;

      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;

      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

async function handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  const { taskId, userId } = paymentIntent.metadata;

  if (taskId && userId) {
    // Update task completion and earnings
    const { error } = await supabase
      .from('task_completions')
      .update({
        paymentStatus: 'completed',
        stripePaymentIntentId: paymentIntent.id,
        updatedAt: new Date().toISOString()
      })
      .eq('taskId', taskId)
      .eq('userId', userId);

    if (error) {
      console.error('Error updating task completion:', error);
      return;
    }

    // Update user total earnings
    const amount = paymentIntent.amount / 100; // Convert from cents
    await supabase.rpc('increment_user_earnings', {
      user_id: userId,
      amount: amount
    });

    console.log(`Payment succeeded for task ${taskId}, user ${userId}: $${amount}`);
  }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const { userId } = subscription.metadata;

  if (userId) {
    const status = subscription.status === 'active' ? 'active' : 
                  subscription.status === 'canceled' ? 'cancelled' : 
                  subscription.status;

    await supabase
      .from('users')
      .update({
        subscriptionStatus: status,
        subscriptionEndDate: (subscription as any).current_period_end ? 
          new Date((subscription as any).current_period_end * 1000).toISOString() : null,
        updatedAt: new Date().toISOString()
      })
      .eq('id', userId);

    console.log(`Subscription updated for user ${userId}: ${status}`);
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const { userId } = subscription.metadata;

  if (userId) {
    await supabase
      .from('users')
      .update({
        subscriptionTier: 'free',
        subscriptionStatus: 'cancelled',
        stripeSubscriptionId: null,
        monthlyTaskLimit: 5,
        prioritySupport: false,
        adFree: false,
        premiumBadge: false,
        updatedAt: new Date().toISOString()
      })
      .eq('id', userId);

    console.log(`Subscription cancelled for user ${userId}`);
  }
}

async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string;
  
  // Reset monthly task count for active subscribers
  if (invoice.billing_reason === 'subscription_cycle') {
    await supabase
      .from('users')
      .update({
        monthlyTasksCompleted: 0,
        lastMonthlyReset: new Date().toISOString()
      })
      .eq('stripeCustomerId', customerId);

    console.log(`Monthly reset completed for customer ${customerId}`);
  }
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string;

  await supabase
    .from('users')
    .update({
      subscriptionStatus: 'past_due',
      updatedAt: new Date().toISOString()
    })
    .eq('stripeCustomerId', customerId);

  console.log(`Payment failed for customer ${customerId}`);
}