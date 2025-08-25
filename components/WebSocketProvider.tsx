'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

interface WebSocketContextType {
  ws: WebSocket | null
  isConnected: boolean
  send: (message: any) => void
  subscribe: (channel: string, callback: (data: any) => void) => () => void
}

const WebSocketContext = createContext<WebSocketContextType>({
  ws: null,
  isConnected: false,
  send: () => {},
  subscribe: () => () => {}
})

export function WebSocketProvider({ children }: { children: ReactNode }) {
  const [ws, setWs] = useState<WebSocket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [subscribers, setSubscribers] = useState<Map<string, ((data: any) => void)[]>>(new Map())

  useEffect(() => {
    // Initialize WebSocket connection
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const wsUrl = `${protocol}//${window.location.host}/ws`
    
    const socket = new WebSocket(wsUrl)

    socket.onopen = () => {
      setIsConnected(true)
    }

    socket.onclose = (event) => {
      setIsConnected(false)
      
      // Only attempt reconnection in development
      if (process.env.NODE_ENV === 'development') {
        setTimeout(() => {
          if (!ws || ws.readyState === WebSocket.CLOSED) {
            setWs(new WebSocket(wsUrl))
          }
        }, 5000) // Increased to 5 seconds to be less aggressive
      }
    }

    socket.onerror = (error) => {
      setIsConnected(false)
    }

    socket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data)
        const channel = message.channel || 'general'
        const callbacks = subscribers.get(channel) || []
        callbacks.forEach(callback => callback(message.data))
      } catch (error) {
        // Silently handle parsing errors in production
        if (process.env.NODE_ENV === 'development') {
          console.error('Error parsing WebSocket message:', error)
        }
      }
    }

    setWs(socket)

    return () => {
      socket.close()
    }
  }, [])

  const send = (message: any) => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message))
    } else {
      console.warn('WebSocket not connected, message not sent:', message)
    }
  }

  const subscribe = (channel: string, callback: (data: any) => void) => {
    setSubscribers(prev => {
      const newMap = new Map(prev)
      const channelCallbacks = newMap.get(channel) || []
      channelCallbacks.push(callback)
      newMap.set(channel, channelCallbacks)
      return newMap
    })

    // Return unsubscribe function
    return () => {
      setSubscribers(prev => {
        const newMap = new Map(prev)
        const channelCallbacks = newMap.get(channel) || []
        const index = channelCallbacks.indexOf(callback)
        if (index > -1) {
          channelCallbacks.splice(index, 1)
          newMap.set(channel, channelCallbacks)
        }
        return newMap
      })
    }
  }

  return (
    <WebSocketContext.Provider value={{ ws, isConnected, send, subscribe }}>
      {children}
    </WebSocketContext.Provider>
  )
}

export function useWebSocket() {
  const context = useContext(WebSocketContext)
  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider')
  }
  return context
}