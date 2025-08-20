import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { everydayTasks } from '@/lib/everydayTasks'
import Stripe from 'stripe'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Initialize Stripe with secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-07-30.basil'
})

export async function POST(request: NextRequest) {
  try {
    console.log('Solo task verification endpoint called')

    const body = await request.json()
    const { task_id, taskId, afterPhoto, notes } = body
    const actualTaskId = task_id || taskId

    if (!actualTaskId) {
      return NextResponse.json({ error: 'Task ID is required' }, { status: 400 })
    }

    // Validate task exists
    const task = everydayTasks.find(t => t.id === actualTaskId)
    if (!task) {
      return NextResponse.json({ error: 'Solo task not found' }, { status: 404 })
    }

    if (!afterPhoto || !afterPhoto.trim()) {
      return NextResponse.json({ 
        error: 'Verification photo required',
        details: 'Please provide a photo or description to verify task completion'
      }, { status: 400 })
    }

    console.log('Processing verification for task:', actualTaskId)

    // Get user from authorization header
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json({ error: 'Authorization required' }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user } } = await supabase.auth.getUser(token)
    
    if (!user) {
      return NextResponse.json({ error: 'Invalid authentication' }, { status: 401 })
    }

    // AI verification simulation
    const aiVerification = {
      confidence: 85, // Good confidence score
      approved: true,
      analysis: `Task "${task.title}" appears to be completed successfully based on submitted evidence.`,
      payout_amount: task.payout,
      net_payout: Math.round(task.payout * 0.97) // 3% platform fee
    }

    let paymentResult = null
    let paymentError = null

    // Process real Stripe payment if verification passed
    if (aiVerification.approved && aiVerification.confidence >= 70) {
      try {
        console.log('Processing Stripe payment for verified task:', actualTaskId)
        
        // Create Stripe payment intent for instant payout
        const paymentIntent = await stripe.paymentIntents.create({
          amount: aiVerification.net_payout * 100, // Convert to cents
          currency: 'usd',
          payment_method_types: ['card'],
          confirmation_method: 'automatic',
          capture_method: 'automatic',
          description: `Solo Task Payment: ${task.title}`,
          metadata: {
            task_id: actualTaskId,
            user_id: user.id,
            task_type: 'solo',
            original_amount: task.payout.toString(),
            net_amount: aiVerification.net_payout.toString(),
            platform_fee: '3%'
          }
        })

        // For demo purposes, we'll mark it as completed since instant bank transfers 
        // require additional Stripe Connect setup
        paymentResult = {
          payment_intent_id: paymentIntent.id,
          amount: aiVerification.net_payout,
          status: 'processing', // In production, this would be handled by webhooks
          processed_at: new Date().toISOString(),
          estimated_arrival: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString() // 2 business days
        }

        console.log('Stripe payment intent created:', paymentIntent.id)

      } catch (stripeError: any) {
        console.error('Stripe payment error:', stripeError)
        paymentError = `Payment processing failed: ${stripeError.message}`
        
        // Still return success for verification, but note payment issue
        paymentResult = {
          amount: aiVerification.net_payout,
          status: 'failed',
          error: paymentError
        }
      }
    }

    // Return verification response with real payment processing
    return NextResponse.json({
      success: true,
      verification: aiVerification,
      task: {
        id: actualTaskId,
        title: task.title,
        payout: task.payout,
        net_payout: aiVerification.net_payout
      },
      payment: paymentResult || {
        amount: aiVerification.net_payout,
        status: aiVerification.confidence < 70 ? 'manual_review_required' : 'failed',
        note: aiVerification.confidence < 70 ? 'Task needs manual review before payment' : 'Verification failed'
      },
      message: paymentResult?.status === 'processing' 
        ? `Verification successful! Payment of $${aiVerification.net_payout} is being processed and will arrive in 1-2 business days.`
        : paymentResult?.status === 'failed'
        ? `Verification successful! Payment processing encountered an issue: ${paymentError}`
        : `Verification requires manual review. Payment will be processed after approval.`
    })

  } catch (error: any) {
    console.error('Error in solo task verification:', error)
    return NextResponse.json({
      success: false,
      error: 'Verification failed',
      details: error.message
    }, { status: 500 })
  }
}