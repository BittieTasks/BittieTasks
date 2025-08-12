import { NextRequest, NextResponse } from 'next/server'
import sgMail from '@sendgrid/mail'

export async function GET() {
  try {
    // Check if SendGrid API key is configured
    const apiKey = process.env.SENDGRID_API_KEY
    
    if (!apiKey) {
      return NextResponse.json({
        status: 'error',
        message: 'SendGrid API key not found in environment variables'
      })
    }

    // Set the API key
    sgMail.setApiKey(apiKey)

    // Test the API key by checking sender verification
    try {
      const response = await fetch('https://api.sendgrid.com/v3/verified_senders', {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      })

      const data = await response.json()

      if (!response.ok) {
        return NextResponse.json({
          status: 'error',
          message: 'SendGrid API key is invalid or has insufficient permissions',
          details: data
        })
      }

      const verifiedSenders = data.results || []
      
      return NextResponse.json({
        status: 'success',
        message: 'SendGrid API key is valid',
        apiKeyPrefix: apiKey.substring(0, 10) + '...',
        verifiedSenders: verifiedSenders.map((sender: any) => ({
          email: sender.from_email,
          verified: sender.verified,
          name: sender.from_name
        })),
        totalVerifiedSenders: verifiedSenders.length,
        recommendations: verifiedSenders.length === 0 
          ? ['You need to add and verify a sender email in SendGrid dashboard']
          : [`Use one of these verified emails in Supabase SMTP settings: ${verifiedSenders.map((s: any) => s.from_email).join(', ')}`]
      })

    } catch (fetchError: any) {
      return NextResponse.json({
        status: 'error',
        message: 'Failed to verify SendGrid API key',
        details: fetchError.message
      })
    }

  } catch (error: any) {
    return NextResponse.json({
      status: 'error', 
      message: 'Error checking SendGrid configuration',
      details: error.message
    })
  }
}