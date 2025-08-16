import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function createSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { verificationId, adminNotes } = body

    if (!verificationId) {
      return NextResponse.json(
        { error: 'Verification ID is required' },
        { status: 400 }
      )
    }

    const supabase = createSupabaseClient()

    // Get verification with task details
    const { data: verification, error: verificationError } = await supabase
      .from('task_verifications')
      .select(`
        *,
        tasks!inner(*)
      `)
      .eq('id', verificationId)
      .single()

    if (verificationError || !verification) {
      return NextResponse.json(
        { error: 'Verification not found' },
        { status: 404 }
      )
    }

    // Update verification status
    const { error: updateError } = await supabase
      .from('task_verifications')
      .update({
        status: 'approved',
        admin_notes: adminNotes,
        reviewed_at: new Date().toISOString(),
        reviewed_by: 'admin' // In a real app, this would be the admin user ID
      })
      .eq('id', verificationId)

    if (updateError) {
      console.error('Error updating verification:', updateError)
      return NextResponse.json(
        { error: 'Failed to approve verification' },
        { status: 500 }
      )
    }

    // Update task status
    const { error: taskUpdateError } = await supabase
      .from('tasks')
      .update({
        status: 'verified_complete',
        payment_status: 'ready_for_release',
        updated_at: new Date().toISOString()
      })
      .eq('id', verification.task_id)

    if (taskUpdateError) {
      console.error('Error updating task:', taskUpdateError)
    }

    // Trigger escrow release if applicable
    if (verification.tasks.payment_status === 'escrowed') {
      try {
        await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:5000'}/api/payments/release-escrow`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            paymentId: verification.tasks.payment_id,
            taskId: verification.task_id,
            reason: 'admin_approval'
          })
        })
      } catch (escrowError) {
        console.error('Error releasing escrow:', escrowError)
        // Don't fail the approval if escrow release fails
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Verification approved and payment released'
    })

  } catch (error: any) {
    console.error('Verification approval error:', error)
    return NextResponse.json(
      { error: 'Failed to approve verification' },
      { status: 500 }
    )
  }
}