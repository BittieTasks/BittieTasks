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
      bodySizeLimit: '2mb',
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
    // Database URL for build-time access
    DATABASE_URL: process.env.DATABASE_URL,
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
  // Performance and bundle optimization  
  webpack: (config, { isServer, dev }) => {
    // Client-side optimizations
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        ws: false,
        net: false,
        tls: false,
        crypto: false,
        fs: false,
        module: false,
      }
      
      // Fix 'self is not defined' error for client bundles
      config.resolve.alias = {
        ...config.resolve.alias,
        '@uppy/aws-s3$': '@uppy/aws-s3/lib/index.js',
      }
    }
    
    // Ignore Supabase realtime websocket warnings
    config.module.exprContextCritical = false
    
    // Fix global variable issues
    config.plugins = config.plugins || []
    
    return config
  },
  
  // SWC minification is enabled by default in Next.js 15
  
  // Optimize bundle analyzer in development
  ...(process.env.ANALYZE === 'true' && {
    bundleAnalyzerConfig: {
      openAnalyzer: true,
    }
  }),
}

export default nextConfig