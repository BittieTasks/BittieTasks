import { NextRequest } from 'next/server'
import { initializeWebSocket } from '../../../server/websocket'
import { createServer } from 'http'

// Initialize WebSocket server for real-time messaging
export async function GET(request: NextRequest) {
  try {
    // Create HTTP server for WebSocket upgrade
    const httpServer = createServer()
    const wsManager = initializeWebSocket(httpServer)
    
    return new Response(JSON.stringify({ 
      status: 'WebSocket server initialized',
      path: '/ws',
      features: ['task_messaging', 'real_time_notifications', 'presence_tracking']
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('WebSocket initialization error:', error)
    return new Response(JSON.stringify({ 
      error: 'Failed to initialize WebSocket server' 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}