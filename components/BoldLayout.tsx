'use client'

import { ReactNode } from 'react'

interface BoldLayoutProps {
  children: ReactNode
  className?: string
}

export default function BoldLayout({ children, className = '' }: BoldLayoutProps) {
  return (
    <div 
      style={{
        background: 'linear-gradient(to bottom right, rgb(88, 28, 135), rgb(30, 58, 138), rgb(49, 46, 129))',
        minHeight: '100vh',
        color: 'white'
      }}
      className={`relative overflow-x-hidden ${className}`}
    >
      {/* Animated Background Elements */}
      <div style={{ position: 'fixed', inset: '0', overflow: 'hidden', pointerEvents: 'none', zIndex: '1' }}>
        <div 
          style={{
            position: 'absolute',
            top: '-160px',
            right: '-160px',
            width: '320px',
            height: '320px',
            background: 'linear-gradient(to bottom right, rgb(236, 72, 153), rgb(244, 63, 94))',
            borderRadius: '50%',
            mixBlendMode: 'multiply',
            filter: 'blur(40px)',
            opacity: '0.7',
            animation: 'blob 7s infinite'
          }}
        />
        <div 
          style={{
            position: 'absolute',
            bottom: '-160px',
            left: '-160px',
            width: '320px',
            height: '320px',
            background: 'linear-gradient(to bottom right, rgb(250, 204, 21), rgb(251, 146, 60))',
            borderRadius: '50%',
            mixBlendMode: 'multiply',
            filter: 'blur(40px)',
            opacity: '0.7',
            animation: 'blob 7s infinite 2s'
          }}
        />
        <div 
          style={{
            position: 'absolute',
            top: '160px',
            left: '50%',
            width: '320px',
            height: '320px',
            background: 'linear-gradient(to bottom right, rgb(74, 222, 128), rgb(59, 130, 246))',
            borderRadius: '50%',
            mixBlendMode: 'multiply',
            filter: 'blur(40px)',
            opacity: '0.7',
            animation: 'blob 7s infinite 4s'
          }}
        />
      </div>

      <style jsx>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
      `}</style>

      {/* Content with proper z-index */}
      <div style={{ position: 'relative', zIndex: '10' }}>
        {children}
      </div>
    </div>
  )
}