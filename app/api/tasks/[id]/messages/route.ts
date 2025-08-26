import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServiceClient } from '@/lib/supabase'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const cookieStore = await cookies()
    const phoneAuth = cookieStore.get('phone_auth')
    const userInfo = cookieStore.get('user_info')

    if (!phoneAuth || !userInfo) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const user = JSON.parse(userInfo.value)
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

    // Verify user has access to this task (creator or participant)
    const { data: taskAccess, error: accessError } = await supabase
      .from('tasks')
      .select(`
        id,
        created_by,
        task_participants!inner(user_id)
      `)
      .eq('id', params.id)
      .or(`created_by.eq.${userData.id},task_participants.user_id.eq.${userData.id}`)

    if (accessError || !taskAccess || taskAccess.length === 0) {
      return NextResponse.json({ error: 'Access denied to task' }, { status: 403 })
    }

    // Get messages for this task
    const { data: messages, error: messagesError } = await supabase
      .from('task_messages')
      .select(`
        *,
        sender:users!sender_id(id, first_name, last_name, phone_number)
      `)
      .eq('task_id', params.id)
      .order('created_at', { ascending: true })

    if (messagesError) {
      console.error('Database error:', messagesError)
      return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 })
    }

    return NextResponse.json({ messages: messages || [] })
  } catch (error) {
    console.error('Error fetching messages:', error)
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const cookieStore = await cookies()
    const phoneAuth = cookieStore.get('phone_auth')
    const userInfo = cookieStore.get('user_info')

    if (!phoneAuth || !userInfo) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const user = JSON.parse(userInfo.value)
    const body = await request.json()
    const { content, messageType = 'text', fileUrl } = body

    if (!content?.trim()) {
      return NextResponse.json({ error: 'Message content is required' }, { status: 400 })
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

    // Verify user has access to this task
    const { data: taskAccess, error: accessError } = await supabase
      .from('tasks')
      .select(`
        id,
        created_by,
        task_participants!inner(user_id)
      `)
      .eq('id', params.id)
      .or(`created_by.eq.${userData.id},task_participants.user_id.eq.${userData.id}`)

    if (accessError || !taskAccess || taskAccess.length === 0) {
      return NextResponse.json({ error: 'Access denied to task' }, { status: 403 })
    }

    // Create message
    const { data: message, error: messageError } = await supabase
      .from('task_messages')
      .insert({
        task_id: params.id,
        sender_id: userData.id,
        message_type: messageType,
        content: content.trim(),
        file_url: fileUrl || null
      })
      .select(`
        *,
        sender:users!sender_id(id, first_name, last_name, phone_number)
      `)
      .single()

    if (messageError) {
      console.error('Database error:', messageError)
      return NextResponse.json({ error: 'Failed to send message' }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      message,
      notice: 'Message sent successfully' 
    })
  } catch (error) {
    console.error('Error sending message:', error)
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 })
  }
}