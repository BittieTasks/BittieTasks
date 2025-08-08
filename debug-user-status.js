// Debug script to manually check verification status using API calls
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

// Simulate what our storage would return by directly checking via API calls
async function checkUserViaAPI(email) {
  const fetch = (await import('node-fetch')).default;
  
  try {
    console.log(`Checking user status for: ${email}`);
    
    // Test resend endpoint to see the response
    const response = await fetch('http://localhost:5000/api/auth/resend-verification', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: email })
    });
    
    const result = await response.json();
    console.log('API Response:', result);
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkUserViaAPI('Caitlin.landrigan@gmail.com');