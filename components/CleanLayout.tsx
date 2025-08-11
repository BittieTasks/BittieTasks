'use client'

interface CleanLayoutProps {
  children: React.ReactNode;
}

export default function CleanLayout({ children }: CleanLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      {children}
    </div>
  )
}