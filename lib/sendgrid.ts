const sgMail = require('@sendgrid/mail')

interface EmailParams {
  to: string
  from: string
  subject: string
  text?: string
  html?: string
}

function initializeSendGrid() {
  if (!process.env.SENDGRID_API_KEY) {
    throw new Error('SENDGRID_API_KEY environment variable must be set')
  }
  sgMail.setApiKey(process.env.SENDGRID_API_KEY)
}

export async function sendEmail(params: EmailParams): Promise<{ success: boolean; error?: string }> {
  try {
    // Initialize SendGrid only when actually sending email
    initializeSendGrid()
    
    await sgMail.send({
      to: params.to,
      from: params.from,
      subject: params.subject,
      text: params.text,
      html: params.html,
    })
    return { success: true }
  } catch (error: any) {
    console.error('SendGrid email error details:', error)
    
    // Handle specific SendGrid errors
    if (error.code === 429) {
      return { 
        success: false, 
        error: 'Email sending limit reached. Please wait a few minutes before trying again.' 
      }
    }
    
    if (error.code === 403) {
      return { 
        success: false, 
        error: 'SendGrid account has restrictions. Please check your SendGrid account status.' 
      }
    }
    
    if (error.message?.includes('rate limit')) {
      return { 
        success: false, 
        error: 'Too many emails sent recently. Please wait before requesting another verification email.' 
      }
    }
    
    if (error.message?.includes('forbidden')) {
      return { 
        success: false, 
        error: 'Email sending is currently restricted. Please contact support.' 
      }
    }
    
    return { 
      success: false, 
      error: error.message || 'Failed to send email. Please try again later.' 
    }
  }
}