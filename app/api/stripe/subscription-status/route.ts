import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(request: NextRequest) {
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