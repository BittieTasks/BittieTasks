'use client'

import { ReactNode } from 'react'

interface CleanLayoutProps {
  children: ReactNode
  className?: string
}

export default function CleanLayout({ children, className = '' }: CleanLayoutProps) {
  return (
    <div className={`min-h-screen bg-gray-50 ${className}`}>
      {children}
    </div>
  )
}