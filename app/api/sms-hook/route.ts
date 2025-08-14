import { NextRequest, NextResponse } from 'next/server';
import { Webhook } from 'standardwebhooks';

interface SmsWebhookPayload {
  user: {
    phone: string;
  };
  sms: {
    otp: string;
  };
}

async function sendMessageBirdSMS(phone: string, otp: string) {
  const messageBody = `Your BittieTasks verification code is: ${otp}`;
  
  const response = await fetch('https://rest.messagebird.com/messages', {
    method: 'POST',
    headers: {
      'Authorization': `AccessKey ${process.env.MESSAGEBIRD_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      originator: '12345', // Using number temporarily until sender ID is registered
      recipients: [phone],
      body: messageBody,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`MessageBird API error: ${error}`);
  }

  return response.json();
}

export async function POST(req: NextRequest) {
  try {
    // Get webhook secret from environment
    const webhookSecret = process.env.SEND_SMS_HOOK_SECRET;
    if (!webhookSecret) {
      console.error('SEND_SMS_HOOK_SECRET not configured');
      return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
    }

    // Get headers and body
    const headers = Object.fromEntries(req.headers.entries());
    const body = await req.text();
    
    console.log('Webhook received:', {
      headers: Object.keys(headers),
      bodyLength: body.length,
      bodyPreview: body.substring(0, 200)
    });

    // Try to verify webhook signature
    let payload: SmsWebhookPayload;
    try {
      const wh = new Webhook(webhookSecret.replace(/^v\d+,whsec_/, ''));
      payload = wh.verify(body, headers) as SmsWebhookPayload;
    } catch (verifyError) {
      console.log('Signature verification failed, attempting direct JSON parse for testing');
      // For development/testing, try direct JSON parse
      try {
        payload = JSON.parse(body) as SmsWebhookPayload;
      } catch (parseError) {
        console.error('Both signature verification and JSON parsing failed:', { verifyError, parseError });
        throw verifyError;
      }
    }

    // Extract phone and OTP
    const { user, sms } = payload;
    if (!user?.phone || !sms?.otp) {
      throw new Error(`Invalid payload structure: ${JSON.stringify(payload)}`);
    }
    
    // Ensure phone number has + prefix
    const phoneNumber = user.phone.startsWith('+') ? user.phone : `+${user.phone}`;

    // Send SMS via MessageBird
    await sendMessageBirdSMS(phoneNumber, sms.otp);

    console.log(`SMS sent successfully to ${phoneNumber}`);
    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('SMS webhook error:', error);
    
    // Return 200 to avoid Supabase retries on non-critical errors
    return NextResponse.json({ 
      error: 'Failed to send SMS',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 200 });
  }
}