import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    console.log('Testing SendGrid configuration...')
    
    // Check environment variables
    const apiKey = process.env.SENDGRID_API_KEY
    if (!apiKey) {
      return NextResponse.json({
        success: false,
        error: 'SENDGRID_API_KEY environment variable not set',
        config: {
          apiKeySet: false,
          apiKeyLength: 0
        }
      })
    }

    const sgMail = require('@sendgrid/mail')
    sgMail.setApiKey(apiKey)
    
    // Test email configuration
    const testMsg = {
      to: 'test@bittietasks.com', // Use a test email
      from: 'noreply@bittietasks.com', // Your verified sender
      subject: 'SendGrid Test Email',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>SendGrid Configuration Test</h2>
          <p>This is a test email to verify SendGrid is working correctly.</p>
          <p>Timestamp: ${new Date().toISOString()}</p>
        </div>
      `
    }
    
    console.log('Sending test email via SendGrid...')
    await sgMail.send(testMsg)
    console.log('SendGrid test email sent successfully')
    
    return NextResponse.json({
      success: true,
      message: 'SendGrid test email sent successfully',
      config: {
        apiKeySet: true,
        apiKeyLength: apiKey.length,
        fromEmail: 'noreply@bittietasks.com',
        testEmailSent: true
      }
    })
    
  } catch (error: any) {
    console.error('SendGrid test error:', error)
    
    // Provide specific error information
    let errorDetails = 'Unknown error'
    let errorCode = 'UNKNOWN'
    
    if (error.code) {
      errorCode = error.code
    }
    
    if (error.response && error.response.body) {
      errorDetails = JSON.stringify(error.response.body, null, 2)
    } else if (error.message) {
      errorDetails = error.message
    }
    
    return NextResponse.json({
      success: false,
      error: `SendGrid error: ${errorDetails}`,
      errorCode,
      config: {
        apiKeySet: !!process.env.SENDGRID_API_KEY,
        apiKeyLength: process.env.SENDGRID_API_KEY?.length || 0,
        fromEmail: 'noreply@bittietasks.com'
      }
    })
  }
}