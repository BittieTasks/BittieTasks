import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServiceClient } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const category = searchParams.get('category')
    const difficulty = searchParams.get('difficulty')
    const location = searchParams.get('location')

    const supabase = createServiceClient()
    
    // Build query for tasks with creator information
    let query = supabase
      .from('tasks')
      .select(`
        *,
        creator:users!created_by(id, phone_number, first_name, last_name, location)
      `)
      .eq('status', 'open')
      .order('created_at', { ascending: false })

    // Apply filters - Only allow community and barter types for user-created tasks
    if (type && type !== 'all') {
      if (type === 'community') {
        query = query.eq('type', 'peer_to_peer')
      } else if (type === 'barter') {
        query = query.eq('type', 'barter')
      }
    } else {
      // Only show community and barter tasks (no solo/platform tasks)
      query = query.in('type', ['peer_to_peer', 'barter'])
    }

    if (category && category !== 'all') {
      query = query.eq('category_id', category)
    }
    if (difficulty && difficulty !== 'all') {
      query = query.eq('difficulty', difficulty)
    }
    if (location && location !== 'all') {
      query = query.ilike('location', `%${location}%`)
    }

    const { data: tasks, error } = await query

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 })
    }

    // Transform data to match frontend expectations
    const transformedTasks = tasks?.map(task => ({
      id: task.id,
      title: task.title,
      description: task.description,
      type: task.type === 'peer_to_peer' ? 'community' : task.type,
      category: task.category_id,
      createdBy: task.creator?.phone_number,
      createdByName: `${task.creator?.first_name || ''} ${task.creator?.last_name || ''}`.trim() || 'User',
      status: task.status,
      earningPotential: parseFloat(task.earning_potential || '0'),
      maxParticipants: task.max_participants,
      currentParticipants: task.current_participants,
      location: task.location,
      duration: task.duration,
      difficulty: task.difficulty,
      // Barter-specific fields
      offering: task.offering,
      seeking: task.seeking,
      tradeType: task.trade_type,
      createdAt: task.created_at
    })) || []

    return NextResponse.json({ tasks: transformedTasks })
  } catch (error) {
    console.error('Error fetching tasks:', error)
    return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication using our phone auth system
    const cookieStore = await cookies()
    const phoneAuth = cookieStore.get('phone_auth')
    const userInfo = cookieStore.get('user_info')

    if (!phoneAuth || !userInfo) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const user = JSON.parse(userInfo.value)
    const body = await request.json()

    const {
      title,
      description,
      type, // Only 'community' and 'barter' allowed for user creation
      category,
      earningPotential,
      maxParticipants,
      location,
      duration,
      difficulty,
      requirements,
      offering, // For barter tasks
      seeking, // For barter tasks
      tradeType, // For barter tasks
      scheduledDate,
      tags
    } = body

    // Validation
    if (!title || !description || !type) {
      return NextResponse.json(
        { error: 'Title, description, and type are required' },
        { status: 400 }
      )
    }

    // RESTRICTED: Only allow community and barter tasks for user creation
    if (!['community', 'barter'].includes(type)) {
      return NextResponse.json(
        { error: 'Only community and barter tasks can be created by users' },
        { status: 400 }
      )
    }

    // For barter tasks, require offering and seeking
    if (type === 'barter' && (!offering || !seeking)) {
      return NextResponse.json(
        { error: 'Barter tasks require both offering and seeking fields' },
        { status: 400 }
      )
    }

    // For community tasks, require earning potential
    if (type === 'community' && !earningPotential) {
      return NextResponse.json(
        { error: 'Community tasks require earning potential' },
        { status: 400 }
      )
    }

    const supabase = createServiceClient()

    // Get user from database using phone number
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('phone_number', phoneAuth.value)
      .single()

    if (userError || !userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Prepare task data for database
    const taskData = {
      title,
      description,
      type: type === 'community' ? 'peer_to_peer' : 'barter',
      category_id: category || null,
      created_by: userData.id,
      status: 'open',
      earning_potential: type === 'barter' ? null : parseFloat(earningPotential),
      max_participants: maxParticipants || 1,
      current_participants: 0,
      location,
      duration,
      difficulty: difficulty || 'medium',
      requirements,
      offering: type === 'barter' ? offering : null,
      seeking: type === 'barter' ? seeking : null,
      trade_type: type === 'barter' ? tradeType : null,
      scheduled_date: scheduledDate ? new Date(scheduledDate) : null,
      tags: tags || []
    }

    // Insert task into database
    const { data: newTask, error: insertError } = await supabase
      .from('tasks')
      .insert(taskData)
      .select(`
        *,
        creator:users!created_by(id, phone_number, first_name, last_name, location)
      `)
      .single()

    if (insertError) {
      console.error('Database insert error:', insertError)
      return NextResponse.json({ error: 'Failed to create task' }, { status: 500 })
    }

    // Transform response to match frontend expectations
    const transformedTask = {
      id: newTask.id,
      title: newTask.title,
      description: newTask.description,
      type: newTask.type === 'peer_to_peer' ? 'community' : newTask.type,
      category: newTask.category_id,
      createdBy: newTask.creator?.phone_number,
      createdByName: `${newTask.creator?.first_name || ''} ${newTask.creator?.last_name || ''}`.trim() || 'User',
      status: newTask.status,
      earningPotential: parseFloat(newTask.earning_potential || '0'),
      maxParticipants: newTask.max_participants,
      currentParticipants: newTask.current_participants,
      location: newTask.location,
      duration: newTask.duration,
      difficulty: newTask.difficulty,
      offering: newTask.offering,
      seeking: newTask.seeking,
      tradeType: newTask.trade_type,
      createdAt: newTask.created_at
    }

    return NextResponse.json({ 
      success: true, 
      task: transformedTask,
      message: 'Task created successfully!' 
    })

  } catch (error) {
    console.error('Error creating task:', error)
    return NextResponse.json(
      { error: 'Failed to create task' },
      { status: 500 }
    )
  }
}