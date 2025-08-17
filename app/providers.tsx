'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'
import { AuthProvider } from '@/components/auth/AuthProvider'
import { WebSocketProvider } from '@/components/WebSocketProvider'
import { Toaster } from '@/components/ui/toaster'
import { ToastProvider } from '../hooks/use-toast'

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5, // 5 minutes
        retry: false,
      },
    },
  }))

  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <AuthProvider>
          <WebSocketProvider>
            {children}
            <Toaster />
          </WebSocketProvider>
        </AuthProvider>
      </ToastProvider>
    </QueryClientProvider>
  )
}