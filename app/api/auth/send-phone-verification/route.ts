import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { phoneNumber } = await request.json()
    
    if (!phoneNumber) {
      return NextResponse.json({
        success: false,
        error: 'Phone number is required'
      }, { status: 400 })
    }
    
    // Check Twilio configuration
    const accountSid = process.env.TWILIO_ACCOUNT_SID
    const authToken = process.env.TWILIO_AUTH_TOKEN
    const twilioNumber = process.env.TWILIO_PHONE_NUMBER
    
    if (!accountSid || !authToken || !twilioNumber) {
      return NextResponse.json({
        success: false,
        error: 'Twilio configuration incomplete',
        config: {
          accountSid: !!accountSid,
          authToken: !!authToken,
          phoneNumber: !!twilioNumber
        }
      })
    }
    
    // Initialize Twilio client
    const twilio = require('twilio')(accountSid, authToken)
    
    // Generate a 6-digit verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString()
    
    // Send SMS
    const message = `Your BittieTasks verification code is: ${verificationCode}. This code expires in 10 minutes.`
    
    console.log(`Sending SMS to ${phoneNumber}: ${message}`)
    
    const result = await twilio.messages.create({
      body: message,
      from: twilioNumber,
      to: phoneNumber
    })
    
    console.log('SMS sent successfully:', result.sid)
    
    // In production, you'd store the verification code in database
    // For testing, we'll return it (NEVER do this in production!)
    
    return NextResponse.json({
      success: true,
      message: 'SMS verification code sent successfully',
      messageSid: result.sid,
      testCode: verificationCode, // REMOVE IN PRODUCTION!
      config: {
        accountSid: !!accountSid,
        authToken: !!authToken,
        phoneNumber: !!twilioNumber,
        twilioNumberUsed: twilioNumber
      }
    })
    
  } catch (error: any) {
    console.error('Twilio SMS error:', error)
    
    let errorDetails = 'Unknown error'
    let errorCode = 'UNKNOWN'
    
    if (error.code) {
      errorCode = error.code
    }
    
    if (error.message) {
      errorDetails = error.message
    }
    
    return NextResponse.json({
      success: false,
      error: `Twilio error: ${errorDetails}`,
      errorCode,
      config: {
        accountSid: !!process.env.TWILIO_ACCOUNT_SID,
        authToken: !!process.env.TWILIO_AUTH_TOKEN,
        phoneNumber: !!process.env.TWILIO_PHONE_NUMBER,
        twilioNumberUsed: process.env.TWILIO_PHONE_NUMBER
      }
    })
  }
}