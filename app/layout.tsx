import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'BittieTasks - Turn Daily Tasks Into Earning Opportunities',
  description: 'Turn your daily tasks into earning opportunities. Share activities with neighbors, split costs, and build community while making money together.',
  keywords: 'task sharing, community earnings, parent income, neighborhood tasks, skill exchange',
  metadataBase: new URL('https://www.bittietasks.com'),
  openGraph: {
    title: 'BittieTasks - Turn Daily Tasks Into Earning Opportunities',
    description: 'Transform daily tasks into income opportunities through community sharing.',
    url: 'https://www.bittietasks.com',
    siteName: 'BittieTasks',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}