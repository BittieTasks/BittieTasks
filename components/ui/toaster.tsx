'use client'

import { useToast, Toast } from '@/app/hooks/use-toast'
import { X, CheckCircle, AlertCircle } from 'lucide-react'

export function Toaster() {
  const { toasts, dismiss } = useToast()

  return (
    <div className="fixed top-4 right-4 z-50 space-y-4">
      {toasts.map((toast: Toast) => (
        <div
          key={toast.id}
          className={`
            flex items-start p-4 rounded-lg shadow-lg max-w-sm w-full
            ${toast.variant === 'destructive' 
              ? 'bg-red-50 border border-red-200' 
              : 'bg-white border border-gray-200'
            }
          `}
        >
          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-2">
              {toast.variant === 'destructive' ? (
                <AlertCircle className="h-4 w-4 text-red-600" />
              ) : (
                <CheckCircle className="h-4 w-4 text-green-600" />
              )}
              {toast.title && (
                <h4 className={`text-sm font-semibold ${
                  toast.variant === 'destructive' ? 'text-red-900' : 'text-gray-900'
                }`}>
                  {toast.title}
                </h4>
              )}
            </div>
            {toast.description && (
              <p className={`text-sm ${
                toast.variant === 'destructive' ? 'text-red-700' : 'text-gray-600'
              }`}>
                {toast.description}
              </p>
            )}
          </div>
          <button
            onClick={() => dismiss(toast.id)}
            className={`ml-4 text-gray-400 hover:text-gray-600`}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  )
}