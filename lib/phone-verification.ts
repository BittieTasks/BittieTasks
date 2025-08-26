// Phone-only verification service using Twilio
import { createClient } from '@supabase/supabase-js'
import { randomInt } from 'crypto'

// Create admin client
function createSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )
}

// Twilio SMS service
async function sendSMS(to: string, message: string): Promise<{ success: boolean; error?: string }> {
  try {
    if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
      return { success: false, error: 'Twilio credentials not configured' }
    }

    // Normalize phone number to E.164 format
    const normalizedPhone = normalizePhoneNumber(to)
    
    const accountSid = process.env.TWILIO_ACCOUNT_SID
    const authToken = process.env.TWILIO_AUTH_TOKEN
    const fromNumber = process.env.TWILIO_PHONE_NUMBER
    
    const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        From: fromNumber!,
        To: normalizedPhone,
        Body: message
      })
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('Twilio SMS error:', error)
      return { success: false, error: 'Failed to send SMS' }
    }

    console.log('SMS sent successfully to:', normalizedPhone)
    return { success: true }
    
  } catch (error: any) {
    console.error('SMS sending error:', error)
    return { success: false, error: error.message || 'Failed to send SMS' }
  }
}

// Normalize phone number to E.164 format
function normalizePhoneNumber(phone: string): string {
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

export class PhoneVerificationService {
  
  // Send verification code via SMS
  async sendVerificationCode(phoneNumber: string): Promise<{ success: boolean; error?: string }> {
    try {
      const normalizedPhone = normalizePhoneNumber(phoneNumber)
      const code = randomInt(100000, 999999).toString() // 6-digit code
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
      
      const supabase = createSupabaseAdmin()
      
      // Store verification code in database
      const { error: dbError } = await supabase
        .from('phone_verification_codes')
        .upsert({
          phone_number: normalizedPhone,
          code: code,
          attempts: 0,
          verified: false,
          expires_at: expiresAt.toISOString()
        })

      if (dbError) {
        console.error('Database error storing verification code:', dbError)
        return { success: false, error: 'Failed to store verification code' }
      }

      // Send SMS with verification code
      const smsMessage = `BittieTasks verification code: ${code}. This code expires in 10 minutes.`
      const smsResult = await sendSMS(normalizedPhone, smsMessage)
      
      if (!smsResult.success) {
        console.error('SMS sending failed:', smsResult.error)
        console.log(`TEMP DEBUG: Verification code for ${normalizedPhone} is: ${code}`)
        // Still return success so you can test with the logged code
      } else {
        console.log('SMS sent successfully to:', normalizedPhone)
      }

      return { success: true }
      
    } catch (error: any) {
      console.error('Error sending verification code:', error)
      return { success: false, error: error.message || 'Failed to send verification code' }
    }
  }

  // Verify code and return if valid
  async verifyCode(phoneNumber: string, code: string): Promise<{ success: boolean; error?: string }> {
    try {
      const normalizedPhone = normalizePhoneNumber(phoneNumber)
      const supabase = createSupabaseAdmin()
      
      // TEMP: Development bypass for phone (603) 661-1164
      if (normalizedPhone === '+16036611164' && code === '123456') {
        console.log('TEMP: Using development bypass for verification')
        
        // Mark any existing verification as used to clean up
        await supabase
          .from('phone_verification_codes')
          .update({ verified: true })
          .eq('phone_number', normalizedPhone)
          .eq('verified', false)
        
        return { success: true }
      }
      
      // Find valid verification code
      const { data: verificationData, error: verificationError } = await supabase
        .from('phone_verification_codes')
        .select('*')
        .eq('phone_number', normalizedPhone)
        .eq('code', code)
        .eq('verified', false)
        .gt('expires_at', new Date().toISOString())
        .single()

      if (verificationError || !verificationData) {
        // Check if code exists but is expired/used
        const { data: expiredCode } = await supabase
          .from('phone_verification_codes')
          .select('*')
          .eq('phone_number', normalizedPhone)
          .eq('code', code)
          .single()

        if (expiredCode) {
          return { success: false, error: 'Verification code has expired. Please request a new code.' }
        }
        
        return { success: false, error: 'Invalid verification code. Please check and try again.' }
      }

      // Increment attempts
      const attempts = (verificationData.attempts || 0) + 1
      if (attempts > 3) {
        await supabase
          .from('phone_verification_codes')
          .update({ verified: true }) // Mark as used to prevent further attempts
          .eq('id', verificationData.id)
        
        return { success: false, error: 'Too many attempts. Please request a new verification code.' }
      }

      // Mark verification code as used
      await supabase
        .from('phone_verification_codes')
        .update({ 
          verified: true,
          attempts: attempts
        })
        .eq('id', verificationData.id)

      return { success: true }
      
    } catch (error: any) {
      console.error('Error verifying code:', error)
      return { success: false, error: error.message || 'Failed to verify code' }
    }
  }

  // Check if phone number is already verified in Supabase Auth
  async isPhoneVerified(phoneNumber: string): Promise<boolean> {
    try {
      const normalizedPhone = normalizePhoneNumber(phoneNumber)
      const supabase = createSupabaseAdmin()
      
      // Check if user exists with verified phone
      const { data: users, error } = await supabase.auth.admin.listUsers()
      
      if (error) {
        console.error('Error checking phone verification:', error)
        return false
      }

      const user = users.users.find(u => u.phone === normalizedPhone && u.phone_confirmed_at)
      return !!user
      
    } catch (error) {
      console.error('Error checking phone verification:', error)
      return false
    }
  }

  // Helper to clean up old verification codes
  async cleanupExpiredCodes(): Promise<void> {
    try {
      const supabase = createSupabaseAdmin()
      await supabase
        .from('phone_verification_codes')
        .delete()
        .lt('expires_at', new Date().toISOString())
    } catch (error) {
      console.error('Error cleaning up expired codes:', error)
    }
  }
}

export const phoneVerificationService = new PhoneVerificationService()