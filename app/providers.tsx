'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'
import { SimpleAuthProvider } from '@/components/auth/SimpleAuthProvider'
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
        <SimpleAuthProvider>
          {children}
          <Toaster />
        </SimpleAuthProvider>
      </ToastProvider>
    </QueryClientProvider>
  )
}