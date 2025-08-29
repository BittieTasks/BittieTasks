import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'

const inter = Inter({ subsets: ['latin'] })

// Use production URL for live deployment
const baseUrl = 'https://www.bittietasks.com'

export const metadata: Metadata = {
  title: 'BittieTasks - Turn Daily Tasks Into Earning Opportunities',
  description: 'Turn your daily tasks into earning opportunities. Share activities with neighbors, split costs, and build community while making money together.',
  keywords: 'task sharing, community earnings, parent income, neighborhood tasks, skill exchange',
  metadataBase: new URL(baseUrl),
  openGraph: {
    title: 'BittieTasks - Turn Daily Tasks Into Earning Opportunities',
    description: 'Transform daily tasks into income opportunities through community sharing.',
    url: baseUrl,
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
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}