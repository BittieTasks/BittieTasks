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
    const filter = searchParams.get('filter') || 'pending_review'

    const supabase = createSupabaseClient()

    let query = supabase
      .from('task_verifications')
      .select(`
        *,
        tasks!inner(
          title,
          amount,
          net_amount
        ),
        users!inner(
          first_name,
          last_name
        )
      `)
      .order('created_at', { ascending: false })

    // Apply filters
    switch (filter) {
      case 'pending_review':
        query = query.eq('status', 'pending_review')
        break
      case 'ai_verified':
        query = query.eq('verification_type', 'ai_photo').eq('status', 'approved')
        break
      // 'all' needs no additional filter
    }

    const { data: verifications, error } = await query

    if (error) {
      console.error('Error fetching verifications:', error)
      return NextResponse.json(
        { error: 'Failed to fetch verifications' },
        { status: 500 }
      )
    }

    // Transform the data to match expected interface
    const transformedVerifications = (verifications || []).map(v => ({
      ...v,
      task: {
        title: v.tasks.title,
        amount: v.tasks.amount,
        net_amount: v.tasks.net_amount
      },
      user: {
        firstName: v.users.first_name,
        lastName: v.users.last_name
      }
    }))

    return NextResponse.json({
      success: true,
      verifications: transformedVerifications
    })

  } catch (error: any) {
    console.error('Admin verifications error:', error)
    return NextResponse.json(
      { error: 'Failed to load verifications' },
      { status: 500 }
    )
  }
}