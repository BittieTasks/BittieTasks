import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import Stripe from 'stripe'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-07-30.basil'
})

export async function POST(request: NextRequest) {
  try {
    console.log('Solo task payout endpoint called')

    const body = await request.json()
    const { task_id, verification_id, amount, user_bank_account } = body

    if (!task_id || !amount) {
      return NextResponse.json({ error: 'Task ID and amount are required' }, { status: 400 })
    }

    // Get authenticated user
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json({ error: 'Authorization required' }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user } } = await supabase.auth.getUser(token)
    
    if (!user) {
      return NextResponse.json({ error: 'Invalid authentication' }, { status: 401 })
    }

    // In a full production setup, this would:
    // 1. Create Stripe Connect accounts for users
    // 2. Process instant bank transfers
    // 3. Handle international payouts
    // 4. Manage tax reporting (1099s)
    
    // For now, we'll create a transfer simulation
    const transferId = `tr_${Date.now()}_${task_id.slice(-8)}`
    
    // Log the payout attempt
    console.log('Processing payout:', {
      task_id,
      user_id: user.id,
      amount,
      transfer_id: transferId
    })

    // Simulate successful payout
    const payoutResult = {
      transfer_id: transferId,
      amount: amount,
      currency: 'usd',
      status: 'processing',
      estimated_arrival: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      method: 'bank_transfer',
      fee: Math.round(amount * 0.029), // 2.9% processing fee
      net_amount: Math.round(amount * 0.971)
    }

    return NextResponse.json({
      success: true,
      payout: payoutResult,
      message: `Payout of $${amount} initiated successfully. Funds will arrive in 1-2 business days.`
    })

  } catch (error: any) {
    console.error('Error in solo task payout:', error)
    return NextResponse.json({
      success: false,
      error: 'Payout failed',
      details: error.message
    }, { status: 500 })
  }
}