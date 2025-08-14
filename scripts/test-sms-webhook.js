// Test script to verify SMS webhook works locally
const crypto = require('crypto');

async function testSMSWebhook() {
  const testPayload = {
    user: {
      phone: "+15551234567" // Replace with your test number
    },
    sms: {
      otp: "123456"
    }
  };

  const body = JSON.stringify(testPayload);
  const secret = "RigTA+wAaluO+FnQx0vJ8kNb3F/Tf04iSYgmP3W+kuM=";
  
  // Generate webhook signature
  const timestamp = Math.floor(Date.now() / 1000);
  const signature = crypto
    .createHmac('sha256', Buffer.from(secret, 'base64'))
    .update(`${timestamp}.${body}`)
    .digest('base64');

  const response = await fetch('http://localhost:5000/api/sms-hook', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'webhook-id': 'test_webhook',
      'webhook-timestamp': timestamp.toString(),
      'webhook-signature': `v1,${signature}`,
    },
    body: body
  });

  const result = await response.text();
  console.log('Response:', response.status, result);
}

testSMSWebhook().catch(console.error);