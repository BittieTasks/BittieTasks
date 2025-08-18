// Create test user via Supabase admin API
const fetch = require('node-fetch')

const SUPABASE_URL = 'https://ttgbotlcbzmmyqawnjpj.supabase.co'
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

async function createTestUser() {
  if (!SERVICE_KEY) {
    console.error('SUPABASE_SERVICE_ROLE_KEY not set')
    return
  }
  
  const response = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SERVICE_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      email: 'test@bittietasks.com',
      password: 'TestPass123!',
      email_confirm: true,
      user_metadata: {
        full_name: 'Test User'
      }
    })
  })
  
  const result = await response.json()
  console.log('User creation result:', result)
}

createTestUser()