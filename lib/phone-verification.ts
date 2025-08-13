import twilio from 'twilio'

// Initialize Twilio client lazily to avoid build-time errors
let twilioClient: any = null

function getTwilioClient() {
  if (!twilioClient) {
    const accountSid = process.env.TWILIO_ACCOUNT_SID
    const authToken = process.env.TWILIO_AUTH_TOKEN
    
    if (!accountSid) {
      throw new Error('TWILIO_ACCOUNT_SID environment variable must be set')
    }
    if (!authToken) {
      throw new Error('TWILIO_AUTH_TOKEN environment variable must be set')
    }
    if (!process.env.TWILIO_PHONE_NUMBER) {
      throw new Error('TWILIO_PHONE_NUMBER environment variable must be set')
    }
    
    twilioClient = twilio(accountSid, authToken)
  }
  
  return twilioClient
}

export interface PhoneVerificationResult {
  success: boolean
  sid?: string
  error?: string
}

export async function sendPhoneVerification(phoneNumber: string, code: string): Promise<PhoneVerificationResult> {
  try {
    console.log(`Sending SMS verification to: ${phoneNumber}`)
    
    // Development mode: skip actual SMS for test numbers
    if (process.env.NODE_ENV === 'development' && phoneNumber.includes('555')) {
      console.log('🧪 Development mode: Skipping SMS for test number')
      console.log('🔢 Verification code for', phoneNumber, 'is:', code)
      return {
        success: true,
        sid: 'dev_test_' + Date.now()
      }
    }
    
    const client = getTwilioClient()
    const message = await client.messages.create({
      body: `Your BittieTasks verification code is: ${code}\n\nWelcome to the neighborhood! This code expires in 10 minutes.`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phoneNumber
    })

    console.log(`SMS sent successfully. SID: ${message.sid}`)
    
    return {
      success: true,
      sid: message.sid
    }
  } catch (error: any) {
    console.error('Twilio SMS error:', error)
    return {
      success: false,
      error: error.message || 'Failed to send verification SMS'
    }
  }
}

export async function sendTaskNotification(
  phoneNumber: string, 
  message: string
): Promise<PhoneVerificationResult> {
  try {
    console.log(`Sending task notification SMS to: ${phoneNumber}`)
    
    const client = getTwilioClient()
    const sms = await client.messages.create({
      body: `BittieTasks: ${message}`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phoneNumber
    })

    console.log(`Task notification sent successfully. SID: ${sms.sid}`)
    
    return {
      success: true,
      sid: sms.sid
    }
  } catch (error: any) {
    console.error('Twilio task notification error:', error)
    return {
      success: false,
      error: error.message || 'Failed to send task notification'
    }
  }
}

export function formatPhoneNumber(phoneNumber: string): string {
  // Remove all non-digit characters
  const digits = phoneNumber.replace(/\D/g, '')
  
  // Add US country code if not present
  if (digits.length === 10) {
    return `+1${digits}`
  } else if (digits.length === 11 && digits.startsWith('1')) {
    return `+${digits}`
  }
  
  // Return as-is if it already has country code
  return phoneNumber.startsWith('+') ? phoneNumber : `+${digits}`
}

export function isValidPhoneNumber(phoneNumber: string): boolean {
  const digits = phoneNumber.replace(/\D/g, '')
  return digits.length === 10 || (digits.length === 11 && digits.startsWith('1'))
}