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

export async function sendEmail(params: EmailParams): Promise<boolean> {
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
    return true
  } catch (error) {
    console.error('SendGrid email error:', error)
    return false
  }
}