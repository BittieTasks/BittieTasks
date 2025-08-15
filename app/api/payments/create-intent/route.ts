import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'
import { calculateFees, validateTaskAmount } from '@/lib/fee-calculator'
import type { TaskType } from '@/lib/fee-calculator'

// Environment variable check moved to runtime to avoid build issues
function getStripeSecretKey() {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) {
    throw new Error('STRIPE_SECRET_KEY must be set')
  }
  return key
}

// Create authenticated Supabase client for server-side operations
function createSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function POST(request: NextRequest) {
  try {
    // Initialize Stripe with runtime environment check
    const stripe = new Stripe(getStripeSecretKey())
    const body = await request.json()
    const { 
      taskId, 
      taskType, 
      amount, 
      description,
      userId 
    } = body

    // Validate required fields
    if (!taskId || !taskType || !amount || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields: taskId, taskType, amount, userId' },
        { status: 400 }
      )
    }

    // Validate task type
    if (!['solo', 'community', 'barter', 'corporate'].includes(taskType)) {
      return NextResponse.json(
        { error: 'Invalid task type' },
        { status: 400 }
      )
    }

    // Validate amount meets minimum requirements
    const validation = validateTaskAmount(amount, taskType as TaskType)
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error, suggestion: validation.suggestion },
        { status: 400 }
      )
    }

    // Barter tasks don't need payment intents
    if (taskType === 'barter') {
      return NextResponse.json(
        { 
          success: true, 
          message: 'Barter task - no payment required',
          barter: true 
        }
      )
    }

    // Calculate fee breakdown with escrow logic
    const feeCalculation = calculateFees(amount, taskType as TaskType)
    const isEscrowPayment = feeCalculation.requiresEscrow

    // Get user info from Supabase auth
    const supabase = createSupabaseClient()
    
    // Get user from auth.users table
    const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(userId)
    
    if (authError || !authUser.user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Try to get user profile, create if doesn't exist
    let { data: userProfile, error: profileError } = await supabase
      .from('profiles')
      .select('id, email, stripe_customer_id')
      .eq('id', userId)
      .single()

    if (profileError && profileError.code === 'PGRST116') {
      // Profile doesn't exist, create it
      const { data: newProfile, error: createError } = await supabase
        .from('profiles')
        .insert([{
          id: userId,
          email: authUser.user.email,
          first_name: authUser.user.user_metadata?.first_name || '',
          last_name: authUser.user.user_metadata?.last_name || '',
          created_at: new Date().toISOString()
        }])
        .select('id, email, stripe_customer_id')
        .single()

      if (createError) {
        console.error('Error creating user profile:', createError)
        // Use auth user data as fallback
        userProfile = {
          id: userId,
          email: authUser.user.email || '',
          stripe_customer_id: null
        }
      } else {
        userProfile = newProfile
      }
    } else if (profileError) {
      console.error('Error fetching user profile:', profileError)
      return NextResponse.json(
        { error: 'Error fetching user profile' },
        { status: 500 }
      )
    }

    if (!userProfile) {
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      )
    }

    // Create or retrieve Stripe customer
    let stripeCustomerId = userProfile.stripe_customer_id

    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: userProfile.email,
        metadata: {
          userId: userId,
          platform: 'bittietasks'
        }
      })

      stripeCustomerId = customer.id

      // Update user profile with Stripe customer ID
      await supabase
        .from('profiles')
        .update({ stripe_customer_id: stripeCustomerId })
        .eq('id', userId)
    }

    // Create payment intent with escrow-aware configuration
    const paymentIntentParams: any = {
      amount: Math.round(amount * 100), // Convert to cents
      currency: 'usd',
      customer: stripeCustomerId,
      description: description || `BittieTasks ${taskType} task payment${isEscrowPayment ? ' (Escrow)' : ''}`,
      metadata: {
        taskId,
        taskType,
        userId,
        grossAmount: amount.toString(),
        platformFee: feeCalculation.platformFee.toString(),
        processingFee: feeCalculation.processingFee.toString(),
        netAmount: feeCalculation.netAmount.toString(),
        isEscrow: isEscrowPayment.toString(),
        escrowThreshold: feeCalculation.escrowThreshold.toString(),
        platform: 'bittietasks'
      },
      // Enable automatic payment methods
      automatic_payment_methods: {
        enabled: true
      }
    }

    // For escrow payments, capture manually to control when funds are moved
    if (isEscrowPayment) {
      paymentIntentParams.capture_method = 'manual'
      paymentIntentParams.metadata.escrowNote = `Funds held in escrow until task completion + 24hr review period`
    } else {
      // Immediate payments include platform fee
      paymentIntentParams.application_fee_amount = Math.round(feeCalculation.platformFee * 100)
    }

    const paymentIntent = await stripe.paymentIntents.create(paymentIntentParams)

    // Calculate auto-release time for escrow payments (24 hours from completion)
    const releaseScheduledAt = isEscrowPayment ? 
      new Date(Date.now() + (24 * 60 * 60 * 1000)).toISOString() : null

    // Store payment record with escrow information
    const { error: paymentError } = await supabase
      .from('payments')
      .insert([{
        id: paymentIntent.id,
        task_id: taskId,
        user_id: userId,
        amount: amount,
        platform_fee: feeCalculation.platformFee,
        processing_fee: feeCalculation.processingFee,
        net_amount: feeCalculation.netAmount,
        task_type: taskType,
        status: isEscrowPayment ? 'pending' : 'pending', // Will become 'escrowed' after successful payment
        stripe_payment_intent_id: paymentIntent.id,
        is_escrow: isEscrowPayment ? 'true' : 'false',
        release_scheduled_at: releaseScheduledAt,
        dispute_status: 'none',
        fee_breakdown: {
          gross: feeCalculation.grossAmount,
          platformFee: feeCalculation.platformFee,
          processingFee: feeCalculation.processingFee,
          net: feeCalculation.netAmount,
          percentage: feeCalculation.feePercentage,
          isEscrow: isEscrowPayment,
          escrowThreshold: feeCalculation.escrowThreshold
        }
      }])

    if (paymentError) {
      console.error('Error storing payment record:', paymentError)
      // Don't fail the request, just log the error
    }

    return NextResponse.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      feeBreakdown: {
        gross: feeCalculation.breakdown.gross,
        platformFee: feeCalculation.breakdown.platformFee,
        processingFee: feeCalculation.breakdown.processingFee,
        net: feeCalculation.breakdown.net,
        percentage: feeCalculation.feePercentage,
        isEscrow: feeCalculation.requiresEscrow,
        escrowThreshold: feeCalculation.escrowThreshold
      }
    })

  } catch (error: any) {
    console.error('Payment intent creation error:', error)
    
    if (error.type === 'StripeCardError' || error.type === 'StripeInvalidRequestError') {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to create payment intent. Please try again.' },
      { status: 500 }
    )
  }
}