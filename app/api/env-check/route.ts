import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    timestamp: new Date().toISOString(),
    nodeEnv: process.env.NODE_ENV,
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'loaded' : 'missing',
    supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'loaded' : 'missing',
    serverSupabaseUrl: process.env.SUPABASE_URL ? 'loaded' : 'missing',
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'loaded' : 'missing',
    stripeSecret: process.env.STRIPE_SECRET_KEY ? 'loaded' : 'missing',
    stripeWebhook: process.env.STRIPE_WEBHOOK_SECRET ? 'loaded' : 'missing',
    sendgridKey: process.env.SENDGRID_API_KEY ? 'loaded' : 'missing',
    buildId: process.env.BUILD_ID || 'none',
    vercelUrl: process.env.VERCEL_URL || 'none',
    // Debug information
    availableEnvKeys: Object.keys(process.env).filter(k => 
      k.includes('SUPABASE') || k.includes('STRIPE') || k.includes('SENDGRID')
    ).sort(),
    // Fallback check
    serverUrlFallback: process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL ? 'available' : 'missing'
  })
}