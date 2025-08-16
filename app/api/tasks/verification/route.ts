import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function createSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const verificationId = searchParams.get('id')
    const taskId = searchParams.get('taskId')

    if (!verificationId && !taskId) {
      return NextResponse.json(
        { error: 'Either verificationId or taskId is required' },
        { status: 400 }
      )
    }

    const supabase = createSupabaseClient()

    let query = supabase
      .from('task_verifications')
      .select(`
        *,
        tasks!inner(*)
      `)

    if (verificationId) {
      query = query.eq('id', verificationId)
    } else {
      query = query.eq('task_id', taskId).order('created_at', { ascending: false }).limit(1)
    }

    const { data: verification, error } = await query.single()

    if (error || !verification) {
      return NextResponse.json(
        { error: 'Verification not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      verification
    })

  } catch (error: any) {
    console.error('Error fetching verification:', error)
    return NextResponse.json(
      { error: 'Failed to fetch verification status' },
      { status: 500 }
    )
  }
}