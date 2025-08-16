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

    if (!verificationId || !adminNotes) {
      return NextResponse.json(
        { error: 'Verification ID and admin notes are required' },
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
        status: 'rejected',
        admin_notes: adminNotes,
        reviewed_at: new Date().toISOString(),
        reviewed_by: 'admin' // In a real app, this would be the admin user ID
      })
      .eq('id', verificationId)

    if (updateError) {
      console.error('Error updating verification:', updateError)
      return NextResponse.json(
        { error: 'Failed to reject verification' },
        { status: 500 }
      )
    }

    // Update task status to allow resubmission
    const { error: taskUpdateError } = await supabase
      .from('tasks')
      .update({
        status: 'verification_failed',
        payment_status: 'held_for_review',
        updated_at: new Date().toISOString()
      })
      .eq('id', verification.task_id)

    if (taskUpdateError) {
      console.error('Error updating task:', taskUpdateError)
    }

    return NextResponse.json({
      success: true,
      message: 'Verification rejected with feedback'
    })

  } catch (error: any) {
    console.error('Verification rejection error:', error)
    return NextResponse.json(
      { error: 'Failed to reject verification' },
      { status: 500 }
    )
  }
}