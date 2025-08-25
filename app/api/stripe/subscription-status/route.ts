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

    // Get user subscription details from database, create profile if doesn't exist
    let { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    // If user profile doesn't exist, create it with default values
    if (profileError && profileError.code === 'PGRST116') {
      const { data: newProfile, error: createError } = await supabase
        .from('users')
        .insert({
          id: user.id,
          email: user.email,
          phone_number: user.phone || '', 
          first_name: user.user_metadata?.first_name || '',
          last_name: user.user_metadata?.last_name || ''
        })
        .select('*')
        .single();

      if (createError) {
        console.error('Error creating user profile:', createError);
        return NextResponse.json(
          { error: 'Failed to create user profile' },
          { status: 500 }
        );
      }
      
      userProfile = newProfile;
    } else if (profileError) {
      console.error('Error fetching user profile:', profileError);
      return NextResponse.json(
        { error: 'Failed to fetch user profile' },
        { status: 500 }
      );
    }

    // Calculate platform fee based on subscription tier
    let platformFee = 0.10; // 10% for free
    const tier = userProfile?.subscription_tier || 'free';
    if (tier === 'pro') {
      platformFee = 0.07; // 7% for pro
    } else if (tier === 'premium') {
      platformFee = 0.05; // 5% for premium
    }

    return NextResponse.json({
      subscription: {
        tier: tier,
        status: userProfile?.subscription_status || 'active',
        monthlyTaskLimit: userProfile?.monthly_task_limit || 5,
        monthlyTasksCompleted: userProfile?.monthly_tasks_completed || 0,
        totalEarnings: userProfile?.total_earnings || '0.00',
        platformFee: platformFee,
        features: {
          prioritySupport: userProfile?.priority_support || false,
          adFree: userProfile?.ad_free || false,
          premiumBadge: userProfile?.premium_badge || false
        },
        billing: {
          customerId: userProfile?.stripe_customer_id || null,
          subscriptionId: userProfile?.stripe_subscription_id || null,
          startDate: userProfile?.subscription_start_date || null,
          endDate: userProfile?.subscription_end_date || null
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