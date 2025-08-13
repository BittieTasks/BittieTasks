import { NextRequest, NextResponse } from 'next/server'
import { sendEmail } from '@/lib/sendgrid'

export async function GET() {
  try {
    // Test if SendGrid API is working directly (bypassing SMTP)
    const testEmail = 'direct-test@example.com'
    
    const success = await sendEmail({
      to: testEmail,
      from: 'noreply@bittietasks.com',
      subject: 'SendGrid Direct API Test',
      text: 'Testing if SendGrid API works directly without SMTP',
      html: '<p>Testing SendGrid API direct connection</p>'
    })

    if (success) {
      return NextResponse.json({
        status: 'sendgrid_api_working',
        message: 'SendGrid API works directly - issue is SMTP configuration',
        recommendation: 'The problem is in Supabase SMTP settings, not SendGrid',
        troubleshooting: [
          'Try port 587 with TLS instead of 465 with SSL',
          'Verify SendGrid API key has SMTP permissions',
          'Check if SendGrid account has SMTP restrictions',
          'Try recreating API key with full mail send permissions'
        ]
      })
    } else {
      return NextResponse.json({
        status: 'sendgrid_api_failing',
        message: 'SendGrid API itself is not working',
        recommendation: 'Issue is with SendGrid account or API key',
        troubleshooting: [
          'Verify SendGrid account is active',
          'Check API key permissions',
          'Ensure account is not suspended',
          'Verify sender domain authentication'
        ]
      })
    }

  } catch (error) {
    console.error('SendGrid diagnosis error:', error)
    return NextResponse.json({
      status: 'error',
      error: error instanceof Error ? error.message : String(error),
      message: 'Unable to test SendGrid API directly'
    }, { status: 500 })
  }
}