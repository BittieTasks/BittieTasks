import { NextRequest, NextResponse } from 'next/server'
import { sendEmail } from '@/lib/sendgrid'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Test sending an email
    const success = await sendEmail({
      to: email,
      from: 'noreply@bittietasks.com', // Verified sender
      subject: 'BittieTasks - SendGrid Test',
      text: 'This is a test email from BittieTasks to verify SendGrid integration.',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #0d9488;">BittieTasks - SendGrid Test</h2>
          <p>This is a test email to verify SendGrid integration is working correctly.</p>
          <p>If you received this email, SendGrid is properly configured!</p>
          <p style="color: #666; font-size: 14px;">
            This was sent from the BittieTasks authentication system.
          </p>
        </div>
      `
    })

    if (success) {
      return NextResponse.json({
        success: true,
        message: 'Test email sent successfully',
        email: email
      })
    } else {
      return NextResponse.json({
        error: 'Failed to send test email'
      }, { status: 500 })
    }

  } catch (error) {
    console.error('SendGrid test error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}