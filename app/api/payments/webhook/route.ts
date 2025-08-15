import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

// Environment variables checked at runtime to avoid build issues
function getStripeConfig() {
  const secretKey = process.env.STRIPE_SECRET_KEY
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  
  if (!secretKey || !webhookSecret) {
    throw new Error('Missing Stripe environment variables')
  }
  
  return { secretKey, webhookSecret }
}

// Create Supabase client for webhook operations
function createSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function POST(request: NextRequest) {
  const { secretKey, webhookSecret } = getStripeConfig()
  const stripe = new Stripe(secretKey)
  
  const body = await request.text()
  const sig = request.headers.get('stripe-signature')

  if (!sig) {
    return NextResponse.json(
      { error: 'Missing signature' },
      { status: 400 }
    )
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret)
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message)
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 }
    )
  }

  const supabase = createSupabaseClient()

  try {
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        const isEscrow = paymentIntent.metadata?.isEscrow === 'true'
        
        // Update payment status based on escrow type
        const updateData: any = {
          stripe_charge_id: paymentIntent.latest_charge,
          completed_at: new Date().toISOString()
        }

        if (isEscrow) {
          // For escrow payments: mark as escrowed, schedule auto-release
          updateData.status = 'escrowed'
          updateData.escrowed_at = new Date().toISOString()
          updateData.release_scheduled_at = new Date(Date.now() + (24 * 60 * 60 * 1000)).toISOString() // 24 hours
        } else {
          // For immediate payments: mark as completed
          updateData.status = 'completed'
        }

        const { error: updateError } = await supabase
          .from('payments')
          .update(updateData)
          .eq('stripe_payment_intent_id', paymentIntent.id)

        if (updateError) {
          console.error('Error updating payment status:', updateError)
        }

        // Update task status based on payment type
        const taskId = paymentIntent.metadata?.taskId
        if (taskId) {
          const taskUpdateData: any = {
            updated_at: new Date().toISOString()
          }

          if (isEscrow) {
            // For escrow: task is active, payment secured
            taskUpdateData.status = 'active'
            taskUpdateData.payment_status = 'escrowed'
          } else {
            // For immediate: task can proceed to completion
            taskUpdateData.status = 'active'
            taskUpdateData.payment_status = 'paid'
          }

          const { error: taskError } = await supabase
            .from('tasks')
            .update(taskUpdateData)
            .eq('id', taskId)

          if (taskError) {
            console.error('Error updating task status:', taskError)
          }
        }

        // Create earnings record only for immediate payments
        // Escrow payments will create earnings when funds are released
        if (!isEscrow) {
          const userId = paymentIntent.metadata?.userId
          const netAmount = paymentIntent.metadata?.netAmount
          
          if (userId && netAmount) {
            const { error: earningsError } = await supabase
              .from('user_earnings')
              .insert([{
                user_id: userId,
                task_id: taskId,
                amount: parseFloat(netAmount),
                payment_id: paymentIntent.id,
                earned_at: new Date().toISOString(),
                task_type: paymentIntent.metadata?.taskType || 'community'
              }])

            if (earningsError) {
              console.error('Error creating earnings record:', earningsError)
            }
          }
        }

        console.log('Payment succeeded:', paymentIntent.id)
        break
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        
        // Update payment status in database
        const { error: updateError } = await supabase
          .from('payments')
          .update({ 
            status: 'failed',
            failed_at: new Date().toISOString(),
            failure_reason: paymentIntent.last_payment_error?.message
          })
          .eq('stripe_payment_intent_id', paymentIntent.id)

        if (updateError) {
          console.error('Error updating failed payment:', updateError)
        }

        console.log('Payment failed:', paymentIntent.id)
        break
      }

      case 'payment_intent.requires_action': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        
        // Update payment status to require user action
        const { error: updateError } = await supabase
          .from('payments')
          .update({ 
            status: 'requires_action'
          })
          .eq('stripe_payment_intent_id', paymentIntent.id)

        if (updateError) {
          console.error('Error updating payment requiring action:', updateError)
        }

        console.log('Payment requires action:', paymentIntent.id)
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })

  } catch (error: any) {
    console.error('Webhook processing error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}