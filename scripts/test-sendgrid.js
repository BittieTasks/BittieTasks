// Direct SendGrid test script
import sgMail from '@sendgrid/mail'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

async function testSendGrid() {
  try {
    console.log('Testing SendGrid configuration...')
    
    if (!process.env.SENDGRID_API_KEY) {
      console.error('❌ SENDGRID_API_KEY not found in environment')
      return
    }
    
    console.log('✅ SendGrid API key found')
    console.log('Key format:', process.env.SENDGRID_API_KEY.substring(0, 10) + '...')
    
    // Set API key
    sgMail.setApiKey(process.env.SENDGRID_API_KEY)
    
    // Test email
    const testEmail = {
      to: 'test@example.com',
      from: 'noreply@bittietasks.com',
      subject: 'SendGrid Test Email',
      text: 'This is a test email to verify SendGrid configuration.',
      html: '<p>This is a test email to verify SendGrid configuration.</p>'
    }
    
    console.log('Attempting to send test email...')
    console.log('From:', testEmail.from)
    console.log('To:', testEmail.to)
    
    const [response] = await sgMail.send(testEmail)
    
    console.log('✅ SendGrid test successful!')
    console.log('Status Code:', response.statusCode)
    console.log('Message ID:', response.headers?.['x-message-id'])
    
  } catch (error) {
    console.error('❌ SendGrid test failed:')
    console.error('Error code:', error.code)
    console.error('Error message:', error.message)
    
    if (error.response) {
      console.error('Response status:', error.response.status)
      console.error('Response body:', error.response.body)
    }
    
    // Common error explanations
    if (error.code === 401) {
      console.error('\n💡 Solution: Check your SendGrid API key')
      console.error('   - Ensure it starts with "SG."')
      console.error('   - Verify it has Full Access permissions')
      console.error('   - Check if it was recently regenerated')
    }
    
    if (error.code === 403) {
      console.error('\n💡 Solution: Check sender authentication')
      console.error('   - Verify noreply@bittietasks.com is authenticated')
      console.error('   - Check Domain Authentication status')
      console.error('   - Ensure sender identity is verified')
    }
  }
}

testSendGrid()