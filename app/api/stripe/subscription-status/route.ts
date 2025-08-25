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

    // Get user subscription details from database
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select(`
        subscriptionTier,
        subscriptionStatus,
        monthlyTaskLimit,
        monthlyTasksCompleted,
        totalEarnings,
        prioritySupport,
        adFree,
        premiumBadge,
        stripeCustomerId,
        stripeSubscriptionId,
        subscriptionStartDate,
        subscriptionEndDate
      `)
      .eq('id', user.id)
      .single();

    if (profileError) {
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      );
    }

    // Calculate platform fee based on subscription tier
    let platformFee = 0.10; // 10% for free
    if (userProfile.subscriptionTier === 'pro') {
      platformFee = 0.07; // 7% for pro
    } else if (userProfile.subscriptionTier === 'premium') {
      platformFee = 0.05; // 5% for premium
    }

    return NextResponse.json({
      subscription: {
        tier: userProfile.subscriptionTier || 'free',
        status: userProfile.subscriptionStatus || 'active',
        monthlyTaskLimit: userProfile.monthlyTaskLimit || 5,
        monthlyTasksCompleted: userProfile.monthlyTasksCompleted || 0,
        totalEarnings: userProfile.totalEarnings || '0.00',
        platformFee: platformFee,
        features: {
          prioritySupport: userProfile.prioritySupport || false,
          adFree: userProfile.adFree || false,
          premiumBadge: userProfile.premiumBadge || false
        },
        billing: {
          customerId: userProfile.stripeCustomerId,
          subscriptionId: userProfile.stripeSubscriptionId,
          startDate: userProfile.subscriptionStartDate,
          endDate: userProfile.subscriptionEndDate
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