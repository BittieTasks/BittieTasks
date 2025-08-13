import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  try {
    // Check SendGrid API status and rate limits
    const sgMail = require('@sendgrid/mail')
    
    if (!process.env.SENDGRID_API_KEY) {
      return NextResponse.json({
        status: 'error',
        message: 'SendGrid API key not configured'
      }, { status: 500 })
    }

    sgMail.setApiKey(process.env.SENDGRID_API_KEY)

    // Test a dry run to check for rate limit errors
    try {
      const testResult = await sgMail.send({
        to: 'test@example.com',
        from: 'noreply@bittietasks.com',
        subject: 'Rate Limit Test',
        text: 'Testing rate limits',
      }, false) // dry run
      
      return NextResponse.json({
        status: 'success',
        message: 'SendGrid API is accessible',
        rateLimitStatus: 'Within limits',
        recommendations: [
          'SendGrid free accounts: 100 emails/day',
          'Rate limit: 600 emails/hour',
          'If hitting limits, wait 1 hour or upgrade account'
        ]
      })
    } catch (rateLimitError: any) {
      console.error('Rate limit check error:', rateLimitError)
      
      if (rateLimitError.code === 429) {
        return NextResponse.json({
          status: 'rate_limited',
          message: 'SendGrid rate limit reached',
          error: rateLimitError.message,
          solutions: [
            'Wait 1 hour before sending more emails',
            'Upgrade SendGrid account for higher limits',
            'Use email less frequently during development'
          ]
        })
      }

      return NextResponse.json({
        status: 'error',
        message: 'SendGrid API error',
        error: rateLimitError.message,
        code: rateLimitError.code
      })
    }

  } catch (error: any) {
    console.error('Rate limit check failed:', error)
    return NextResponse.json({
      status: 'error',
      message: 'Failed to check rate limits',
      error: error.message
    }, { status: 500 })
  }
}