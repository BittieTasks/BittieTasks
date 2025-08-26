import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch the specific task with creator information
    const { data: task, error } = await supabase
      .from('tasks')
      .select(`
        *,
        creator:users!created_by(id, phone_number, first_name, last_name, location)
      `)
      .eq('id', params.id)
      .single()

    if (error) {
      console.error('Database error:', error)
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Task not found' }, { status: 404 })
      }
      return NextResponse.json({ error: 'Failed to fetch task' }, { status: 500 })
    }

    // Transform data to match frontend expectations
    const transformedTask = {
      id: task.id,
      title: task.title,
      description: task.description,
      type: task.type === 'peer_to_peer' ? 'community' : task.type,
      category: task.category_id,
      earning_potential: parseFloat(task.earning_potential || '0'),
      max_participants: task.max_participants,
      current_participants: task.current_participants,
      location: task.location,
      duration: task.duration,
      difficulty: task.difficulty,
      requirements: task.requirements,
      created_by: task.created_by,
      status: task.status,
      created_at: task.created_at,
      // Barter-specific fields
      offering: task.offering,
      seeking: task.seeking,
      trade_type: task.trade_type,
      // Creator info
      creator: task.creator ? {
        id: task.creator.id,
        first_name: task.creator.first_name,
        last_name: task.creator.last_name,
        phone_number: task.creator.phone_number,
        location: task.creator.location
      } : null
    }

    return NextResponse.json(transformedTask)
  } catch (error) {
    console.error('Error fetching task:', error)
    return NextResponse.json({ error: 'Failed to fetch task' }, { status: 500 })
  }
}