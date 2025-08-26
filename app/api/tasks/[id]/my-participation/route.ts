import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's phone number to find their user record
    const { data: userRecord, error: userRecordError } = await supabase
      .from('users')
      .select('id')
      .eq('phone_number', user.phone)
      .single()

    if (userRecordError || !userRecord) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Fetch user's participation in this task
    const { data: participation, error } = await supabase
      .from('task_participants')
      .select(`
        *,
        user:users!user_id(id, first_name, last_name, phone_number)
      `)
      .eq('task_id', params.id)
      .eq('user_id', userRecord.id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Participation not found' }, { status: 404 })
      }
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Failed to fetch participation' }, { status: 500 })
    }

    return NextResponse.json(participation)
  } catch (error) {
    console.error('Error fetching participation:', error)
    return NextResponse.json({ error: 'Failed to fetch participation' }, { status: 500 })
  }
}