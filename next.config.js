/** @type {import('next').NextConfig} */
const nextConfig = {
  // Production optimizations
  productionBrowserSourceMaps: false,
  compress: true,
  
  images: {
    unoptimized: process.env.NODE_ENV === 'development',
    formats: ['image/avif', 'image/webp'],
    domains: ['ttgbotlcbzmmyqawnjpj.supabase.co'],
  },
  experimental: {
    serverActions: {
      allowedOrigins: ["*"],
    },
  },
  // Fix Replit development preview issues
  assetPrefix: process.env.NODE_ENV === 'production' ? undefined : '',
  trailingSlash: false,
  env: {
    // Next.js environment variables - fallback to VITE_ for compatibility
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_STRIPE_PUBLIC_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY || process.env.VITE_STRIPE_PUBLIC_KEY,
    NEXT_PUBLIC_GA_MEASUREMENT_ID: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || process.env.VITE_GA_MEASUREMENT_ID,
  },
  // Optimized headers for production performance
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          // Production caching - aggressive for static assets
          ...(process.env.NODE_ENV === 'production' ? [
            {
              key: 'Cache-Control',
              value: 'public, max-age=31536000, immutable',
            }
          ] : [
            {
              key: 'Cache-Control',
              value: 'no-cache, no-store, must-revalidate',
            }
          ]),
        ],
      },
      // API routes - shorter cache for dynamic content
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=60, s-maxage=300',
          },
        ],
      },
      // Static assets - long-term caching
      {
        source: '/_next/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ]
  },
  // Add suppressHydrationWarning for components with client-only behavior
  compiler: {
    styledComponents: true,
  },
  // Suppress Supabase websocket dependency warnings
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        ws: false,
        net: false,
        tls: false,
        crypto: false,
      }
    }
    // Ignore Supabase realtime websocket warnings
    config.module.exprContextCritical = false
    return config
  },
}

export default nextConfig