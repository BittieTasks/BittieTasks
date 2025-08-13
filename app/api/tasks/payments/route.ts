import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createServiceClient } from '../../../../lib/supabase'

export async function POST(request: NextRequest) {
  // Initialize Stripe inside the function to avoid build-time errors
  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 })
  }
  
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2025-07-30.basil'
  })
  try {
    const supabase = createServiceClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { submissionId, taskId, amount, paymentType = 'task_completion' } = await request.json()
    
    if (!submissionId || !taskId || !amount) {
      return NextResponse.json({ 
        error: 'Missing required fields: submissionId, taskId, amount' 
      }, { status: 400 })
    }

    // Get submission details to verify auto-approval
    const { data: submission, error: submissionError } = await supabase
      .from('task_completion_submissions')
      .select('*, tasks(*)')
      .eq('id', submissionId)
      .eq('userId', user.id)
      .single()
      
    if (submissionError || !submission) {
      return NextResponse.json({ error: 'Submission not found' }, { status: 404 })
    }

    // Only process payments for auto-verified submissions
    if (submission.verificationStatus !== 'auto_verified') {
      return NextResponse.json({ 
        error: 'Payment only available for auto-verified submissions',
        status: submission.verificationStatus
      }, { status: 400 })
    }

    // Get or create Stripe customer
    let { data: userData } = await supabase
      .from('users')
      .select('stripeCustomerId, email')
      .eq('id', user.id)
      .single()

    let customerId = userData?.stripeCustomerId

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: userData?.email || user.email,
        metadata: {
          userId: user.id,
          platform: 'bittietasks'
        }
      })
      
      customerId = customer.id
      
      // Update user with Stripe customer ID
      await supabase
        .from('users')
        .update({ stripeCustomerId: customerId })
        .eq('id', user.id)
    }

    // Calculate platform fee based on task type and amount
    const task = submission.tasks
    const taskAmount = parseFloat(amount)
    let platformFeeAmount = 0
    let description = ''

    switch (task.type) {
      case 'platform_funded':
        // No platform fee for platform-funded tasks (we pay users)
        platformFeeAmount = 0
        description = `BittieTasks Platform Task Completion: ${task.title}`
        break
      case 'peer_to_peer':
        // 7% platform fee for P2P tasks
        platformFeeAmount = Math.round(taskAmount * 0.07 * 100) // Convert to cents
        description = `BittieTasks P2P Task Payment: ${task.title}`
        break
      case 'corporate_sponsored':
        // 15% platform fee for corporate tasks
        platformFeeAmount = Math.round(taskAmount * 0.15 * 100) // Convert to cents
        description = `BittieTasks Corporate Task Payment: ${task.title}`
        break
      default:
        platformFeeAmount = Math.round(taskAmount * 0.07 * 100) // Default 7%
        description = `BittieTasks Task Payment: ${task.title}`
    }

    // For platform-funded tasks, we transfer money TO the user
    if (task.type === 'platform_funded') {
      // Create a transfer to the user (requires Stripe Connect setup)
      // For now, we'll create a record and handle via other means
      
      // Record the transaction
      const { data: transaction, error: transactionError } = await supabase
        .from('transactions')
        .insert({
          userId: user.id,
          taskId: taskId,
          type: 'task_earning',
          amount: taskAmount,
          description: `Platform-funded task completion: ${task.title}`,
          status: 'completed',
          metadata: {
            submissionId,
            verificationStatus: submission.verificationStatus,
            autoVerificationScore: submission.autoVerificationScore,
            fraudDetectionScore: submission.fraudDetectionScore,
            paymentMethod: 'platform_funding'
          }
        })
        .select()
        .single()

      if (transactionError) {
        console.error('Transaction creation error:', transactionError)
        return NextResponse.json({ error: 'Failed to record transaction' }, { status: 500 })
      }

      // Update submission with payment info
      await supabase
        .from('task_completion_submissions')
        .update({ 
          paymentReleased: true,
          paymentReleasedAt: new Date().toISOString()
        })
        .eq('id', submissionId)

      // Update participant earnings
      await supabase
        .from('task_participants')
        .update({ 
          earnedAmount: taskAmount,
          status: 'completed',
          completedAt: new Date().toISOString()
        })
        .eq('taskId', taskId)
        .eq('userId', user.id)

      return NextResponse.json({
        success: true,
        transactionId: transaction.id,
        amount: taskAmount,
        paymentType: 'platform_funded',
        message: 'Platform payment processed successfully'
      })
    }

    // For P2P and corporate tasks, create payment intent for collection
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(taskAmount * 100), // Convert to cents
      currency: 'usd',
      customer: customerId,
      application_fee_amount: platformFeeAmount,
      description,
      metadata: {
        taskId,
        submissionId,
        userId: user.id,
        paymentType,
        taskType: task.type,
        platform: 'bittietasks'
      },
      automatic_payment_methods: {
        enabled: true,
      },
    })

    // Record the pending transaction
    const { data: transaction, error: transactionError } = await supabase
      .from('transactions')
      .insert({
        userId: user.id,
        taskId: taskId,
        type: paymentType === 'task_completion' ? 'task_payment' : 'subscription',
        amount: taskAmount,
        description,
        status: 'pending',
        metadata: {
          stripePaymentIntentId: paymentIntent.id,
          submissionId,
          verificationStatus: submission.verificationStatus,
          platformFeeAmount: platformFeeAmount / 100, // Convert back to dollars
          taskType: task.type
        }
      })
      .select()
      .single()

    if (transactionError) {
      console.error('Transaction creation error:', transactionError)
      return NextResponse.json({ error: 'Failed to record transaction' }, { status: 500 })
    }

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      transactionId: transaction.id,
      amount: taskAmount,
      platformFee: platformFeeAmount / 100,
      taskType: task.type
    })

  } catch (error: any) {
    console.error('Payment processing error:', error)
    return NextResponse.json({ 
      error: 'Payment processing failed',
      details: error.message
    }, { status: 500 })
  }
}

// GET endpoint for payment status
export async function GET(request: NextRequest) {
  try {
    // Initialize Stripe inside the function
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 })
    }
    
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-07-30.basil'
    })
    
    const supabase = createServiceClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const url = new URL(request.url)
    const paymentIntentId = url.searchParams.get('paymentIntentId')
    const transactionId = url.searchParams.get('transactionId')
    
    if (paymentIntentId) {
      // Check Stripe payment intent status
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)
      
      return NextResponse.json({
        status: paymentIntent.status,
        amount: paymentIntent.amount / 100,
        metadata: paymentIntent.metadata
      })
    }
    
    if (transactionId) {
      // Check local transaction status
      const { data: transaction, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('id', transactionId)
        .eq('userId', user.id)
        .single()
        
      if (error || !transaction) {
        return NextResponse.json({ error: 'Transaction not found' }, { status: 404 })
      }
      
      return NextResponse.json(transaction)
    }
    
    return NextResponse.json({ error: 'Missing paymentIntentId or transactionId' }, { status: 400 })
    
  } catch (error: any) {
    console.error('Payment status error:', error)
    return NextResponse.json({ error: 'Failed to get payment status' }, { status: 500 })
  }
}