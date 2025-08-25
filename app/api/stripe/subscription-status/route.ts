import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient(request)
    
    // Get current user using session cookies (consistent with other routes)
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      console.error('GET /api/stripe/subscription-status auth error:', authError?.message)
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    // Return mock subscription data since database tables don't exist yet
    // This allows the frontend to work while you set up the database
    console.log('Using mock subscription data - database tables need to be created');
    
    const userProfile = {
      subscription_tier: 'free',
      subscription_status: 'active',
      monthly_task_limit: 5,
      monthly_tasks_completed: 0,
      total_earnings: '0.00',
      priority_support: false,
      ad_free: false,
      premium_badge: false,
      stripe_customer_id: null,
      stripe_subscription_id: null,
      subscription_start_date: null,
      subscription_end_date: null
    };

    // Calculate platform fee based on subscription tier
    let platformFee = 0.10; // 10% for free
    if (userProfile.subscription_tier === 'pro') {
      platformFee = 0.07; // 7% for pro
    } else if (userProfile.subscription_tier === 'premium') {
      platformFee = 0.05; // 5% for premium
    }

    return NextResponse.json({
      subscription: {
        tier: userProfile.subscription_tier || 'free',
        status: userProfile.subscription_status || 'active',
        monthlyTaskLimit: userProfile.monthly_task_limit || 5,
        monthlyTasksCompleted: userProfile.monthly_tasks_completed || 0,
        totalEarnings: userProfile.total_earnings || '0.00',
        platformFee: platformFee,
        features: {
          prioritySupport: userProfile.priority_support || false,
          adFree: userProfile.ad_free || false,
          premiumBadge: userProfile.premium_badge || false
        },
        billing: {
          customerId: userProfile.stripe_customer_id,
          subscriptionId: userProfile.stripe_subscription_id,
          startDate: userProfile.subscription_start_date,
          endDate: userProfile.subscription_end_date
        }
      }
    });

  } catch (error: any) {
    console.error('Error fetching subscription status:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subscription status' },
      { status: 500 }
    );
  }
}