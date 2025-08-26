// Direct Twilio SMS service for phone verification
import twilio from 'twilio'

const accountSid = process.env.TWILIO_ACCOUNT_SID
const authToken = process.env.TWILIO_AUTH_TOKEN
const fromPhoneNumber = process.env.TWILIO_PHONE_NUMBER

if (!accountSid || !authToken || !fromPhoneNumber) {
  throw new Error('Missing Twilio configuration. Please check TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_PHONE_NUMBER environment variables.')
}

const client = twilio(accountSid, authToken)

export class TwilioSMSService {
  // Send verification code via Twilio
  async sendVerificationCode(phoneNumber: string, code: string): Promise<{ success: boolean; error?: string }> {
    try {
      const normalizedPhone = this.normalizePhoneNumber(phoneNumber)
      console.log('Sending SMS to:', normalizedPhone)
      
      const message = await client.messages.create({
        body: `Your BittieTasks verification code is: ${code}`,
        from: fromPhoneNumber,
        to: normalizedPhone
      })

      console.log('SMS sent successfully:', message.sid)
      return { success: true }
      
    } catch (error: any) {
      console.error('Twilio SMS error:', error)
      
      if (error.code === 21614) {
        return { success: false, error: 'Invalid phone number. Please enter a valid phone number.' }
      } else if (error.code === 21608) {
        return { success: false, error: 'This phone number cannot receive SMS messages.' }
      } else if (error.message.includes('trial')) {
        return { success: false, error: 'Phone number not verified in Twilio trial account.' }
      }
      
      return { success: false, error: error.message || 'Failed to send SMS' }
    }
  }

  // Normalize phone number to E.164 format
  private normalizePhoneNumber(phone: string): string {
    // Remove all non-digit characters
    const digits = phone.replace(/\D/g, '')
    
    // Add +1 for US numbers if not present
    if (digits.length === 10) {
      return `+1${digits}`
    } else if (digits.length === 11 && digits.startsWith('1')) {
      return `+${digits}`
    }
    
    // Return as-is for international numbers
    return digits.startsWith('+') ? phone : `+${digits}`
  }
}

export const twilioSMS = new TwilioSMSService()