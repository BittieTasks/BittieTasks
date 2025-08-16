import { WebSocketServer, WebSocket } from 'ws'
import { createServer, Server } from 'http'
import { parse } from 'url'
import { createClient } from '@supabase/supabase-js'
import type { WebSocketMessage, SendMessagePayload, TypingIndicatorPayload } from '../shared/message-schema'

interface AuthenticatedWebSocket extends WebSocket {
  userId?: string
  taskRooms?: Set<string>
}

interface TaskRoom {
  taskId: string
  participants: Set<AuthenticatedWebSocket>
}

export class WebSocketManager {
  private wss: WebSocketServer
  private taskRooms: Map<string, TaskRoom> = new Map()
  private userConnections: Map<string, AuthenticatedWebSocket> = new Map()
  private supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  constructor(server: Server) {
    this.wss = new WebSocketServer({ 
      server, 
      path: '/ws',
      verifyClient: this.verifyClient.bind(this)
    })

    this.wss.on('connection', this.handleConnection.bind(this))
    console.log('WebSocket server initialized on /ws')
  }

  private async verifyClient(info: any): Promise<boolean> {
    try {
      const { query } = parse(info.req.url, true)
      const token = query.token as string

      if (!token) {
        console.log('WebSocket connection rejected: No token provided')
        return false
      }

      // Verify JWT token with Supabase
      const { data: { user }, error } = await this.supabase.auth.getUser(token)
      
      if (error || !user) {
        console.log('WebSocket connection rejected: Invalid token')
        return false
      }

      // Store user info for connection
      info.req.userId = user.id
      return true
    } catch (error) {
      console.error('WebSocket verification error:', error)
      return false
    }
  }

  private handleConnection(ws: AuthenticatedWebSocket, req: any) {
    ws.userId = req.userId
    ws.taskRooms = new Set()

    if (ws.userId) {
      this.userConnections.set(ws.userId, ws)
      this.updateUserPresence(ws.userId, true)
      console.log(`User ${ws.userId} connected via WebSocket`)
    }

    ws.on('message', (data: Buffer) => {
      try {
        const message: WebSocketMessage = JSON.parse(data.toString())
        this.handleMessage(ws, message)
      } catch (error) {
        console.error('Invalid WebSocket message:', error)
        this.sendError(ws, 'Invalid message format')
      }
    })

    ws.on('close', () => {
      this.handleDisconnection(ws)
    })

    ws.on('error', (error) => {
      console.error('WebSocket error:', error)
      this.handleDisconnection(ws)
    })
  }

  private async handleMessage(ws: AuthenticatedWebSocket, message: WebSocketMessage) {
    try {
      switch (message.type) {
        case 'join_task_room':
          await this.handleJoinTaskRoom(ws, message.payload.taskId)
          break

        case 'leave_task_room':
          this.handleLeaveTaskRoom(ws, message.payload.taskId)
          break

        case 'send_message':
          await this.handleSendMessage(ws, message.payload as SendMessagePayload)
          break

        case 'typing_indicator':
          this.handleTypingIndicator(ws, message.payload as TypingIndicatorPayload)
          break

        default:
          this.sendError(ws, `Unknown message type: ${message.type}`)
      }
    } catch (error) {
      console.error('Error handling WebSocket message:', error)
      this.sendError(ws, 'Failed to process message')
    }
  }

  private async handleJoinTaskRoom(ws: AuthenticatedWebSocket, taskId: string) {
    if (!ws.userId || !taskId) return

    // Verify user has access to this task
    const hasAccess = await this.verifyTaskAccess(ws.userId, taskId)
    if (!hasAccess) {
      this.sendError(ws, 'Access denied to task')
      return
    }

    // Create or get task room
    if (!this.taskRooms.has(taskId)) {
      this.taskRooms.set(taskId, {
        taskId,
        participants: new Set()
      })
    }

    const room = this.taskRooms.get(taskId)!
    room.participants.add(ws)
    ws.taskRooms?.add(taskId)

    // Update user presence
    await this.updateUserPresence(ws.userId, true, taskId)

    // Notify other participants
    this.broadcastToRoom(taskId, {
      type: 'user_presence',
      payload: {
        userId: ws.userId,
        isOnline: true,
        currentTaskId: taskId
      },
      timestamp: new Date().toISOString()
    }, ws)

    console.log(`User ${ws.userId} joined task room ${taskId}`)
  }

  private handleLeaveTaskRoom(ws: AuthenticatedWebSocket, taskId: string) {
    if (!ws.userId || !taskId) return

    const room = this.taskRooms.get(taskId)
    if (room) {
      room.participants.delete(ws)
      ws.taskRooms?.delete(taskId)

      // Clean up empty rooms
      if (room.participants.size === 0) {
        this.taskRooms.delete(taskId)
      }

      // Notify other participants
      this.broadcastToRoom(taskId, {
        type: 'user_presence',
        payload: {
          userId: ws.userId,
          isOnline: false,
          currentTaskId: null
        },
        timestamp: new Date().toISOString()
      }, ws)
    }

    console.log(`User ${ws.userId} left task room ${taskId}`)
  }

  private async handleSendMessage(ws: AuthenticatedWebSocket, payload: SendMessagePayload) {
    if (!ws.userId) return

    try {
      // Store message in database
      const { data: message, error } = await this.supabase
        .from('task_messages')
        .insert({
          task_id: payload.taskId,
          sender_id: ws.userId,
          message_type: payload.messageType,
          content: payload.content,
          file_url: payload.fileUrl || null
        })
        .select()
        .single()

      if (error) {
        console.error('Failed to store message:', error)
        this.sendError(ws, 'Failed to send message')
        return
      }

      // Broadcast message to room participants
      this.broadcastToRoom(payload.taskId, {
        type: 'message_received',
        payload: message,
        taskId: payload.taskId,
        userId: ws.userId,
        timestamp: new Date().toISOString()
      })

      console.log(`Message sent in task ${payload.taskId} by user ${ws.userId}`)
    } catch (error) {
      console.error('Error sending message:', error)
      this.sendError(ws, 'Failed to send message')
    }
  }

  private handleTypingIndicator(ws: AuthenticatedWebSocket, payload: TypingIndicatorPayload) {
    if (!ws.userId) return

    // Broadcast typing indicator to room (except sender)
    this.broadcastToRoom(payload.taskId, {
      type: 'typing_indicator',
      payload,
      taskId: payload.taskId,
      userId: ws.userId,
      timestamp: new Date().toISOString()
    }, ws)
  }

  private handleDisconnection(ws: AuthenticatedWebSocket) {
    if (ws.userId) {
      // Update user presence
      this.updateUserPresence(ws.userId, false)

      // Leave all task rooms
      ws.taskRooms?.forEach(taskId => {
        this.handleLeaveTaskRoom(ws, taskId)
      })

      // Remove from user connections
      this.userConnections.delete(ws.userId)

      console.log(`User ${ws.userId} disconnected`)
    }
  }

  private async verifyTaskAccess(userId: string, taskId: string): Promise<boolean> {
    try {
      // Check if user is task creator or has applied to the task
      const { data: task } = await this.supabase
        .from('tasks')
        .select('created_by')
        .eq('id', taskId)
        .single()

      if (task?.created_by === userId) {
        return true
      }

      // Check if user has applied to the task
      const { data: application } = await this.supabase
        .from('task_participants')
        .select('id')
        .eq('task_id', taskId)
        .eq('user_id', userId)
        .single()

      return !!application
    } catch (error) {
      console.error('Error verifying task access:', error)
      return false
    }
  }

  private async updateUserPresence(userId: string, isOnline: boolean, currentTaskId?: string) {
    try {
      await this.supabase
        .from('user_presence')
        .upsert({
          user_id: userId,
          is_online: isOnline,
          last_seen: new Date().toISOString(),
          current_task_id: currentTaskId || null
        })
    } catch (error) {
      console.error('Error updating user presence:', error)
    }
  }

  private broadcastToRoom(taskId: string, message: WebSocketMessage, exclude?: WebSocket) {
    const room = this.taskRooms.get(taskId)
    if (!room) return

    const messageStr = JSON.stringify(message)
    room.participants.forEach(participant => {
      if (participant !== exclude && participant.readyState === WebSocket.OPEN) {
        participant.send(messageStr)
      }
    })
  }

  private sendError(ws: WebSocket, error: string) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        type: 'error',
        payload: { error },
        timestamp: new Date().toISOString()
      }))
    }
  }

  // Public method to send system messages
  public async sendSystemMessage(taskId: string, content: string) {
    try {
      const { data: message } = await this.supabase
        .from('task_messages')
        .insert({
          task_id: taskId,
          sender_id: 'system',
          message_type: 'text',
          content,
          is_system_message: true
        })
        .select()
        .single()

      if (message) {
        this.broadcastToRoom(taskId, {
          type: 'message_received',
          payload: message,
          taskId,
          timestamp: new Date().toISOString()
        })
      }
    } catch (error) {
      console.error('Error sending system message:', error)
    }
  }
}

export let wsManager: WebSocketManager | null = null

export function initializeWebSocket(server: Server) {
  if (!wsManager) {
    wsManager = new WebSocketManager(server)
  }
  return wsManager
}