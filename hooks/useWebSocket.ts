'use client'

import { useEffect, useRef, useState, useCallback } from 'react'

interface WebSocketMessage {
  type: 'join_task_room' | 'leave_task_room' | 'send_message' | 'message_received' | 'typing_indicator' | 'task_update' | 'user_presence'
  payload: any
  taskId?: string
  userId?: string
  timestamp: string
}

export function useWebSocket() {
  const [socket, setSocket] = useState<WebSocket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [reconnectAttempts, setReconnectAttempts] = useState(0)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>()
  const maxReconnectAttempts = 5

  const connect = useCallback(() => {
    try {
      // Determine the WebSocket URL based on current location
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
      const wsUrl = `${protocol}//${window.location.host}/ws`
      
      console.log('Connecting to WebSocket:', wsUrl)
      
      const ws = new WebSocket(wsUrl)
      
      ws.onopen = () => {
        console.log('WebSocket connected')
        setIsConnected(true)
        setReconnectAttempts(0)
        setSocket(ws)
      }
      
      ws.onclose = (event) => {
        console.log('WebSocket disconnected:', event.code, event.reason)
        setIsConnected(false)
        setSocket(null)
        
        // Attempt to reconnect if not intentionally closed
        if (event.code !== 1000 && reconnectAttempts < maxReconnectAttempts) {
          const timeout = Math.min(1000 * Math.pow(2, reconnectAttempts), 30000)
          console.log(`Attempting to reconnect WebSocket in ${timeout}ms...`)
          
          reconnectTimeoutRef.current = setTimeout(() => {
            setReconnectAttempts(prev => prev + 1)
            connect()
          }, timeout)
        }
      }
      
      ws.onerror = (error) => {
        console.error('WebSocket error:', error)
        setIsConnected(false)
      }
      
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error)
      setIsConnected(false)
    }
  }, [reconnectAttempts])

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
    }
    
    if (socket) {
      socket.close(1000, 'Intentional disconnect')
    }
    
    setSocket(null)
    setIsConnected(false)
    setReconnectAttempts(0)
  }, [socket])

  const sendMessage = useCallback((message: WebSocketMessage) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      try {
        socket.send(JSON.stringify(message))
        return true
      } catch (error) {
        console.error('Failed to send WebSocket message:', error)
        return false
      }
    }
    console.warn('WebSocket not connected, message not sent:', message)
    return false
  }, [socket])

  // Connect on mount
  useEffect(() => {
    connect()
    
    return () => {
      disconnect()
    }
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }
    }
  }, [])

  return {
    socket,
    isConnected,
    reconnectAttempts,
    connect,
    disconnect,
    sendMessage
  }
}