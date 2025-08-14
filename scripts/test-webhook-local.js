// Test webhook with proper standardwebhooks format
import crypto from 'crypto';

async function testWebhookLocal() {
  const testPayload = {
    user: {
      phone: "+15551234567"
    },
    sms: {
      otp: "123456"
    }
  };

  const body = JSON.stringify(testPayload);
  const secret = "ml0jlWNpbPrCCSwwAh4V7Iot4cG5GxEbzRRWGImAac8lUh7Jbgq7vYY2RpOK32YoE7RuDfSbHm4Yb6gI";
  
  // Generate proper standardwebhooks signature
  const timestamp = Math.floor(Date.now() / 1000);
  const data = `${timestamp}.${body}`;
  
  const signature = crypto
    .createHmac('sha256', Buffer.from(secret, 'base64'))
    .update(data)
    .digest('base64');

  try {
    const response = await fetch('http://localhost:5000/api/sms-hook', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'webhook-id': 'test_webhook_' + Date.now(),
        'webhook-timestamp': timestamp.toString(),
        'webhook-signature': `v1,${signature}`,
      },
      body: body
    });

    const result = await response.text();
    console.log('✅ Webhook test result:', response.status, result);
    
    if (response.ok) {
      console.log('🎉 Webhook working correctly!');
    } else {
      console.log('❌ Webhook failed');
    }
  } catch (error) {
    console.error('❌ Webhook test error:', error);
  }
}

testWebhookLocal();