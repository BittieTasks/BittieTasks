// Custom SMS service using Twilio for BittieTasks authentication
import { NextResponse } from 'next/server'

interface OtpRecord {
  phone: string
  code: string
  attempts: number
  expiresAt: number
  createdAt: number
}

// In-memory OTP storage (upgrade to Redis/Database for production scaling)
const otpStorage = new Map<string, OtpRecord>()

// Rate limiting for OTP requests per phone number  
const phoneRateLimit = new Map<string, { count: number; lastReset: number }>()

export class SMSService {
  private twilioAccountSid: string
  private twilioAuthToken: string  
  private twilioPhoneNumber: string

  constructor() {
    this.twilioAccountSid = process.env.TWILIO_ACCOUNT_SID!
    this.twilioAuthToken = process.env.TWILIO_AUTH_TOKEN!
    this.twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER!

    if (!this.twilioAccountSid || !this.twilioAuthToken || !this.twilioPhoneNumber) {
      throw new Error('Missing required Twilio environment variables')
    }
  }

  // Generate 6-digit OTP code
  private generateOtpCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString()
  }

  // Check phone-specific rate limiting (3 OTPs per 15 minutes per phone)
  private isPhoneRateLimited(phone: string): boolean {
    const now = Date.now()
    const windowMs = 15 * 60 * 1000 // 15 minutes
    const current = phoneRateLimit.get(phone)
    
    if (!current || now - current.lastReset > windowMs) {
      phoneRateLimit.set(phone, { count: 1, lastReset: now })
      return false
    }
    
    if (current.count >= 3) {
      return true
    }
    
    current.count++
    return false
  }

  // Clean up expired OTP codes  
  private cleanupExpiredOtps(): void {
    const now = Date.now()
    
    for (const [phone, record] of otpStorage.entries()) {
      if (now > record.expiresAt) {
        otpStorage.delete(phone)
      }
    }
  }

  // Send OTP via Twilio SMS
  async sendOtp(phone: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Check phone-specific rate limiting
      if (this.isPhoneRateLimited(phone)) {
        console.log('Phone rate limited:', phone.replace(/\d/g, 'X'))
        // Return success to prevent enumeration (security)
        return { success: true }
      }

      // Clean up old OTPs periodically
      this.cleanupExpiredOtps()

      // Generate new OTP code
      const code = this.generateOtpCode()
      const expiresAt = Date.now() + (5 * 60 * 1000) // 5 minutes expiry
      
      // Store OTP record
      otpStorage.set(phone, {
        phone,
        code,
        attempts: 0,
        expiresAt,
        createdAt: Date.now()
      })

      // Send SMS via Twilio
      const message = `Your BittieTasks verification code is: ${code}. This code expires in 5 minutes.`
      
      const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${this.twilioAccountSid}/Messages.json`, {
        method: 'POST',
        headers: {
          'Authorization': 'Basic ' + Buffer.from(`${this.twilioAccountSid}:${this.twilioAuthToken}`).toString('base64'),
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          To: phone,
          From: this.twilioPhoneNumber,
          Body: message
        })
      })

      if (!response.ok) {
        const error = await response.text()
        console.error('Twilio SMS error:', error)
        // Return success to prevent enumeration attacks 
        return { success: true }
      }

      const result = await response.json()
      console.log('SMS sent successfully to:', phone.replace(/\d/g, 'X'), 'SID:', result.sid)
      
      return { success: true }
      
    } catch (error) {
      console.error('SMS service error:', error)
      // Return success to prevent enumeration attacks
      return { success: true }
    }
  }

  // Verify OTP code
  verifyOtp(phone: string, code: string): { success: boolean; error?: string } {
    try {
      this.cleanupExpiredOtps()
      
      const record = otpStorage.get(phone)
      
      if (!record) {
        return { success: false, error: 'Invalid or expired verification code' }
      }

      // Check if expired
      if (Date.now() > record.expiresAt) {
        otpStorage.delete(phone)
        return { success: false, error: 'Invalid or expired verification code' }
      }

      // Check attempts (max 3 attempts per code)
      if (record.attempts >= 3) {
        otpStorage.delete(phone)
        return { success: false, error: 'Invalid or expired verification code' }
      }

      // Increment attempts
      record.attempts++

      // Check code
      if (record.code !== code) {
        return { success: false, error: 'Invalid or expired verification code' }
      }

      // Success! Clean up the used code
      otpStorage.delete(phone)
      return { success: true }
      
    } catch (error) {
      console.error('OTP verification error:', error)
      return { success: false, error: 'Invalid or expired verification code' }
    }
  }

  // Get stats (for debugging)
  getStats() {
    return {
      activeOtps: otpStorage.size,
      phoneRateLimits: phoneRateLimit.size
    }
  }
}

// Export singleton instance
export const smsService = new SMSService()