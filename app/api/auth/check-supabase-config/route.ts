import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  try {
    // Check current Supabase configuration
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({
        error: 'Supabase configuration missing'
      }, { status: 500 })
    }

    // Test auth configuration endpoint
    try {
      const response = await fetch(`${supabaseUrl}/auth/v1/settings`, {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`
        }
      })

      const config = await response.json()
      
      return NextResponse.json({
        status: 'success',
        supabaseUrl,
        authSettings: {
          external_email_enabled: config.external?.email?.enabled,
          external_phone_enabled: config.external?.phone?.enabled,
          disable_signup: config.disable_signup,
          email_confirm: config.email_confirm,
          phone_confirm: config.phone_confirm,
          site_url: config.site_url,
          redirect_urls: config.redirect_urls,
          smtp_admin_email: config.smtp_admin_email,
          smtp_host: config.smtp_host,
          smtp_port: config.smtp_port,
          smtp_user: config.smtp_user,
          smtp_sender_name: config.smtp_sender_name
        },
        recommendations: [
          config.email_confirm ? 
            'Email confirmation is ENABLED - users must verify email' : 
            'Email confirmation is DISABLED - users are automatically verified',
          config.smtp_host ? 
            `SMTP is configured with host: ${config.smtp_host}` :
            'SMTP is NOT configured - using Supabase default emails',
          config.site_url ? 
            `Site URL set to: ${config.site_url}` :
            'Site URL not configured'
        ]
      })

    } catch (configError: any) {
      return NextResponse.json({
        error: 'Could not fetch Supabase auth settings',
        details: configError.message
      }, { status: 500 })
    }

  } catch (error: any) {
    return NextResponse.json({
      error: 'Configuration check failed',
      details: error.message
    }, { status: 500 })
  }
}