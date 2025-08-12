import { NextRequest, NextResponse } from 'next/server'
import sgMail from '@sendgrid/mail'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { testEmail } = body

    if (!testEmail) {
      return NextResponse.json(
        { error: 'Test email address required' },
        { status: 400 }
      )
    }

    const apiKey = process.env.SENDGRID_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: 'SendGrid API key not configured' },
        { status: 500 }
      )
    }

    sgMail.setApiKey(apiKey)

    // Send test email using your verified sender
    const msg = {
      to: testEmail,
      from: {
        email: 'noreply@bittietasks.com',
        name: 'BittieTasks'
      },
      subject: 'BittieTasks Email Verification Test',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #0d9488;">BittieTasks Email Test</h2>
          <p>Hello!</p>
          <p>This is a test email to verify that your SendGrid integration is working correctly.</p>
          <p>If you received this email, your SendGrid configuration is properly set up!</p>
          <div style="background: #f0fdfa; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #0d9488; margin: 0;">Next Steps for Supabase:</h3>
            <p style="margin: 10px 0 0 0;">Use these settings in your Supabase SMTP configuration:</p>
            <ul>
              <li><strong>SMTP Host:</strong> smtp.sendgrid.net</li>
              <li><strong>SMTP Port:</strong> 587</li>
              <li><strong>SMTP User:</strong> apikey</li>
              <li><strong>SMTP Password:</strong> Your SendGrid API Key</li>
              <li><strong>Sender Email:</strong> noreply@bittietasks.com</li>
              <li><strong>Sender Name:</strong> BittieTasks</li>
            </ul>
          </div>
          <p>Best regards,<br>The BittieTasks Team</p>
        </div>
      `,
    }

    await sgMail.send(msg)

    return NextResponse.json({
      success: true,
      message: 'Test email sent successfully!',
      details: {
        fromEmail: 'noreply@bittietasks.com',
        fromName: 'BittieTasks',
        toEmail: testEmail,
        subject: msg.subject
      }
    })

  } catch (error: any) {
    console.error('SendGrid test error:', error)
    return NextResponse.json({
      error: 'Failed to send test email',
      details: error.message || error
    }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'SendGrid Email Test Endpoint',
    usage: 'POST with {"testEmail": "your-email@example.com"}',
    verifiedSender: 'noreply@bittietasks.com'
  })
}