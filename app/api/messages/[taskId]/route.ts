import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Get message history for a task
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  try {
    const { taskId } = await params

    // Get user from auth header
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // Verify user has access to this task
    const { data: task } = await supabase
      .from('tasks')
      .select('created_by')
      .eq('id', taskId)
      .single()

    const { data: application } = await supabase
      .from('task_participants')
      .select('id')
      .eq('task_id', taskId)
      .eq('user_id', user.id)
      .single()

    if (task?.created_by !== user.id && !application) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Get messages for this task
    const { data: messages, error } = await supabase
      .from('task_messages')
      .select(`
        *,
        sender:users!inner(id, first_name, last_name)
      `)
      .eq('task_id', taskId)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Error fetching messages:', error)
      return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 })
    }

    return NextResponse.json({ messages: messages || [] })
  } catch (error) {
    console.error('Error in messages API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Send a new message
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  try {
    const { taskId } = await params
    const { content, messageType = 'text', fileUrl } = await request.json()

    if (!content?.trim()) {
      return NextResponse.json({ error: 'Message content is required' }, { status: 400 })
    }

    // Get user from auth header
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // Verify user has access to this task
    const { data: task } = await supabase
      .from('tasks')
      .select('created_by')
      .eq('id', taskId)
      .single()

    const { data: application } = await supabase
      .from('task_participants')
      .select('id')
      .eq('task_id', taskId)
      .eq('user_id', user.id)
      .single()

    if (task?.created_by !== user.id && !application) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Create the message
    const { data: message, error } = await supabase
      .from('task_messages')
      .insert({
        task_id: taskId,
        sender_id: user.id,
        content: content.trim(),
        message_type: messageType,
        file_url: fileUrl || null,
      })
      .select(`
        *,
        sender:users!inner(id, first_name, last_name)
      `)
      .single()

    if (error) {
      console.error('Error creating message:', error)
      return NextResponse.json({ error: 'Failed to send message' }, { status: 500 })
    }

    return NextResponse.json({ message })
  } catch (error) {
    console.error('Error in send message API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}