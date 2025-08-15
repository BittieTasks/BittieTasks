import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'
import { ESCROW_CONFIG } from '@/lib/fee-calculator'

// Environment variable check moved to runtime
function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) {
    throw new Error('STRIPE_SECRET_KEY must be set')
  }
  return new Stripe(key)
}

function createSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function POST(request: NextRequest) {
  try {
    const stripe = getStripe()
    const body = await request.json()
    const { paymentId, taskId, reason = 'task_completed' } = body

    if (!paymentId) {
      return NextResponse.json(
        { error: 'Payment ID is required' },
        { status: 400 }
      )
    }

    const supabase = createSupabaseClient()

    // Get payment record
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .select('*')
      .eq('id', paymentId)
      .single()

    if (paymentError || !payment) {
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      )
    }

    // Verify payment is in escrow status
    if (payment.status !== 'escrowed') {
      return NextResponse.json(
        { error: 'Payment is not in escrow status' },
        { status: 400 }
      )
    }

    // Check if payment is eligible for release (auto-release after 24 hours or manual release)
    const now = new Date()
    const releaseScheduled = new Date(payment.release_scheduled_at)
    const isAutoReleaseReady = now >= releaseScheduled
    const isManualRelease = reason === 'manual_release' || reason === 'task_completed'

    if (!isAutoReleaseReady && !isManualRelease) {
      return NextResponse.json(
        { error: 'Payment not eligible for release yet' },
        { status: 400 }
      )
    }

    // Capture the payment intent in Stripe (for escrow payments, we used manual capture)
    try {
      await stripe.paymentIntents.capture(payment.stripe_payment_intent_id, {
        amount_to_capture: Math.round(payment.amount * 100) // Full amount in cents
      })
    } catch (stripeError: any) {
      console.error('Error capturing payment:', stripeError)
      return NextResponse.json(
        { error: 'Failed to release payment from escrow' },
        { status: 500 }
      )
    }

    // Update payment status to released
    const { error: updateError } = await supabase
      .from('payments')
      .update({
        status: 'released',
        released_at: new Date().toISOString(),
        dispute_status: 'none'
      })
      .eq('id', paymentId)

    if (updateError) {
      console.error('Error updating payment status:', updateError)
      return NextResponse.json(
        { error: 'Failed to update payment status' },
        { status: 500 }
      )
    }

    // Create earnings record now that funds are released
    const { error: earningsError } = await supabase
      .from('user_earnings')
      .insert([{
        user_id: payment.user_id,
        task_id: payment.task_id,
        amount: parseFloat(payment.net_amount),
        payment_id: paymentId,
        earned_at: new Date().toISOString(),
        task_type: payment.task_type
      }])

    if (earningsError) {
      console.error('Error creating earnings record:', earningsError)
    }

    // Update task status if provided
    if (taskId) {
      await supabase
        .from('tasks')
        .update({
          status: 'completed',
          payment_status: 'released',
          completed_at: new Date().toISOString()
        })
        .eq('id', taskId)
    }

    return NextResponse.json({
      success: true,
      message: 'Escrow funds successfully released',
      paymentId,
      releasedAmount: payment.net_amount,
      releaseReason: reason
    })

  } catch (error: any) {
    console.error('Escrow release error:', error)
    return NextResponse.json(
      { error: 'Failed to release escrow funds' },
      { status: 500 }
    )
  }
}