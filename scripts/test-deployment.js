#!/usr/bin/env node

const https = require('https')
const http = require('http')

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  bold: '\x1b[1m'
}

function log(color, message) {
  console.log(color + message + colors.reset)
}

function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http
    
    const req = client.request(url, {
      method: 'GET',
      timeout: 10000,
      ...options
    }, (res) => {
      let data = ''
      
      res.on('data', (chunk) => {
        data += chunk
      })
      
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data)
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: jsonData
          })
        } catch (error) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: data
          })
        }
      })
    })
    
    req.on('error', (error) => {
      reject(error)
    })
    
    req.on('timeout', () => {
      req.destroy()
      reject(new Error('Request timeout'))
    })
    
    req.end()
  })
}

async function testDeployment() {
  log(colors.blue + colors.bold, '🚀 Testing BittieTasks Deployment')
  console.log()

  const testUrls = [
    'http://localhost:5000',
    'https://www.bittietasks.com'
  ]

  for (const baseUrl of testUrls) {
    log(colors.yellow, `Testing: ${baseUrl}`)
    
    // Test 1: Basic connectivity
    try {
      const response = await makeRequest(baseUrl)
      if (response.status === 200) {
        log(colors.green, '✓ Site is accessible')
      } else {
        log(colors.red, `✗ Site returned status ${response.status}`)
      }
    } catch (error) {
      log(colors.red, `✗ Site not accessible: ${error.message}`)
      continue
    }

    // Test 2: Authentication API
    try {
      const authResponse = await makeRequest(`${baseUrl}/api/auth/session`)
      if (authResponse.status === 200) {
        log(colors.green, '✓ Auth API is working')
        
        if (authResponse.data && typeof authResponse.data === 'object') {
          const authData = authResponse.data
          log(colors.blue, `  - Authenticated: ${authData.isAuthenticated || false}`)
          log(colors.blue, `  - Session exists: ${!!authData.session}`)
          log(colors.blue, `  - User: ${authData.user ? authData.user.email || 'Anonymous' : 'None'}`)
        }
      } else {
        log(colors.red, `✗ Auth API error: Status ${authResponse.status}`)
      }
    } catch (error) {
      log(colors.red, `✗ Auth API not accessible: ${error.message}`)
    }

    // Test 3: Test endpoint
    try {
      const testResponse = await makeRequest(`${baseUrl}/api/auth/test`)
      if (testResponse.status === 200 && testResponse.data) {
        log(colors.green, '✓ Test endpoint working')
        
        const testData = testResponse.data
        if (testData.environment) {
          log(colors.blue, '  Environment Variables:')
          log(colors.blue, `    - Supabase URL: ${testData.environment.supabaseUrl ? '✓' : '✗'}`)
          log(colors.blue, `    - Supabase Anon Key: ${testData.environment.supabaseAnonKey ? '✓' : '✗'}`)
          log(colors.blue, `    - Service Role Key: ${testData.environment.serviceRoleKey ? '✓' : '✗'}`)
        }
        
        if (testData.supabase) {
          log(colors.blue, '  Supabase Connection:')
          log(colors.blue, `    - Connected: ${testData.supabase.connected ? '✓' : '✗'}`)
          log(colors.blue, `    - DB Connection: ${testData.supabase.dbConnection ? '✓' : '✗'}`)
        }
      } else {
        log(colors.red, `✗ Test endpoint error: Status ${testResponse.status}`)
      }
    } catch (error) {
      log(colors.red, `✗ Test endpoint not accessible: ${error.message}`)
    }

    // Test 4: Static assets
    try {
      const faviconResponse = await makeRequest(`${baseUrl}/favicon.ico`)
      if (faviconResponse.status === 200) {
        log(colors.green, '✓ Static assets loading')
      } else {
        log(colors.yellow, `⚠ Static assets may have issues: ${faviconResponse.status}`)
      }
    } catch (error) {
      log(colors.yellow, `⚠ Static assets test failed: ${error.message}`)
    }

    console.log()
  }

  log(colors.blue + colors.bold, '📋 Deployment Test Summary')
  console.log()
  log(colors.blue, 'If you see errors above, check:')
  console.log('  1. Environment variables in Vercel are set correctly')
  console.log('  2. Supabase URL configuration includes your domain')
  console.log('  3. DNS is pointing to Vercel correctly')
  console.log('  4. SSL certificates are active')
  console.log()
  log(colors.green, 'If all tests pass, your authentication is ready! 🎉')
}

// Run the test
testDeployment().catch(error => {
  log(colors.red, `Test failed: ${error.message}`)
  process.exit(1)
})