import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    // Test basic connection
    const { data: connectionTest, error: connectionError } = await supabase
      .from('profiles')
      .select('count')
      .limit(1)

    console.log('Connection test:', { connectionTest, connectionError })

    // Test auth configuration
    const { data: authTest, error: authError } = await supabase.auth.getUser()
    console.log('Auth test:', { authTest, authError })

    // Check auth settings
    const { data: settings, error: settingsError } = await supabase.auth.getSession()
    console.log('Settings test:', { settings, settingsError })

    return NextResponse.json({
      supabase_url: process.env.NEXT_PUBLIC_SUPABASE_URL,
      anon_key_length: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.length,
      connection_test: connectionError ? connectionError.message : 'OK',
      auth_test: authError ? authError.message : 'OK',
      settings_test: settingsError ? settingsError.message : 'OK',
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Connection test error:', error)
    return NextResponse.json({
      error: 'Connection test failed',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}