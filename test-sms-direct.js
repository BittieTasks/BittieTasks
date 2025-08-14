// Test SMS directly to your verified number
const fetch = require('node-fetch');

async function testDirectSMS() {
  const apiKey = process.env.MESSAGEBIRD_API_KEY || 'WKgwGF4di6W8jGhnFGGP4xYrSydtstF8cl7Q';
  
  // Replace with YOUR verified phone number from MessageBird dashboard
  const yourVerifiedNumber = '+1234567890'; // UPDATE THIS!
  
  const response = await fetch('https://rest.messagebird.com/messages', {
    method: 'POST',
    headers: {
      'Authorization': `AccessKey ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      originator: 'BittieTasks',
      recipients: [yourVerifiedNumber],
      body: 'Test SMS from BittieTasks! Your phone verification system is working.'
    })
  });
  
  const result = await response.json();
  console.log('SMS Test Result:', JSON.stringify(result, null, 2));
  
  if (result.errors) {
    console.log('\n❌ SMS Failed:', result.errors[0].description);
    if (result.errors[0].code === 2) {
      console.log('💡 Solution: Add money to your MessageBird account (€15 minimum)');
    }
  } else {
    console.log('✅ SMS Sent Successfully!');
  }
}

testDirectSMS().catch(console.error);