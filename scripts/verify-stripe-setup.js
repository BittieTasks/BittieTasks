#!/usr/bin/env node

// Script to verify Stripe configuration before deployment
// Run with: node scripts/verify-stripe-setup.js

import { config } from 'dotenv'
import Stripe from 'stripe'

// Load environment variables
config({ path: ['.env.local', '.env'] })

console.log('🔧 BittieTasks Stripe Setup Verification\n')

// Check all required environment variables
const requiredEnvVars = {
  'STRIPE_SECRET_KEY': process.env.STRIPE_SECRET_KEY,
  'VITE_STRIPE_PUBLIC_KEY': process.env.VITE_STRIPE_PUBLIC_KEY,
  'STRIPE_PRO_PRICE_ID': process.env.STRIPE_PRO_PRICE_ID,
  'STRIPE_PREMIUM_PRICE_ID': process.env.STRIPE_PREMIUM_PRICE_ID,
  'STRIPE_WEBHOOK_SECRET': process.env.STRIPE_WEBHOOK_SECRET,
}

console.log('📋 Environment Variables Check:')
let hasAllVars = true

for (const [name, value] of Object.entries(requiredEnvVars)) {
  if (!value) {
    console.log(`❌ ${name}: NOT SET`)
    hasAllVars = false
  } else {
    // Show partial value for security
    const partial = value.substring(0, 12) + '...'
    console.log(`✅ ${name}: ${partial}`)
  }
}

if (!hasAllVars) {
  console.log('\n❌ Missing required environment variables!')
  console.log('Please check STRIPE_DEPLOYMENT_SETUP.md for setup instructions.')
  process.exit(1)
}

// Validate Stripe key formats
console.log('\n🔑 Stripe Key Validation:')

if (!process.env.STRIPE_SECRET_KEY?.startsWith('sk_')) {
  console.log('❌ STRIPE_SECRET_KEY: Invalid format (should start with sk_)')
  process.exit(1)
}

if (!process.env.VITE_STRIPE_PUBLIC_KEY?.startsWith('pk_')) {
  console.log('❌ VITE_STRIPE_PUBLIC_KEY: Invalid format (should start with pk_)')
  process.exit(1)
}

const isLive = process.env.STRIPE_SECRET_KEY?.startsWith('sk_live_')
const isTest = process.env.STRIPE_SECRET_KEY?.startsWith('sk_test_')

console.log(`✅ STRIPE_SECRET_KEY: Valid ${isLive ? 'LIVE' : 'TEST'} key`)
console.log(`✅ VITE_STRIPE_PUBLIC_KEY: Valid ${process.env.VITE_STRIPE_PUBLIC_KEY?.startsWith('pk_live_') ? 'LIVE' : 'TEST'} key`)

if (isLive) {
  console.log('🚨 WARNING: Using LIVE Stripe keys - real money transactions!')
} else {
  console.log('🧪 Using TEST Stripe keys - safe for development')
}

// Test Stripe connection
console.log('\n🔌 Testing Stripe Connection:')

try {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
  
  // Test API connection
  const account = await stripe.accounts.retrieve()
  console.log(`✅ Connected to Stripe account: ${account.email || account.id}`)
  
  // Verify products exist
  console.log('\n📦 Verifying Subscription Products:')
  
  try {
    const proPrice = await stripe.prices.retrieve(process.env.STRIPE_PRO_PRICE_ID)
    console.log(`✅ Pro Plan (${process.env.STRIPE_PRO_PRICE_ID}): $${proPrice.unit_amount/100}/month`)
  } catch (error) {
    console.log(`❌ Pro Plan price ID not found: ${process.env.STRIPE_PRO_PRICE_ID}`)
    console.log('   Create it at https://dashboard.stripe.com/products')
  }
  
  try {
    const premiumPrice = await stripe.prices.retrieve(process.env.STRIPE_PREMIUM_PRICE_ID)
    console.log(`✅ Premium Plan (${process.env.STRIPE_PREMIUM_PRICE_ID}): $${premiumPrice.unit_amount/100}/month`)
  } catch (error) {
    console.log(`❌ Premium Plan price ID not found: ${process.env.STRIPE_PREMIUM_PRICE_ID}`)
    console.log('   Create it at https://dashboard.stripe.com/products')
  }

} catch (error) {
  console.log(`❌ Stripe connection failed: ${error.message}`)
  process.exit(1)
}

// Webhook verification
console.log('\n🔗 Webhook Setup:')
if (process.env.STRIPE_WEBHOOK_SECRET?.startsWith('whsec_')) {
  console.log('✅ Webhook secret format is valid')
  console.log('⚠️  Remember to update webhook endpoint URL after deployment!')
} else {
  console.log('❌ Invalid webhook secret format (should start with whsec_)')
}

console.log('\n🎉 Stripe setup verification complete!')
console.log('Ready for deployment to production.')

console.log('\n📝 Next Steps:')
console.log('1. Push to GitHub main branch')
console.log('2. Verify deployment platform has all environment variables')
console.log('3. Update Stripe webhook URL to your deployed domain')
console.log('4. Test payment flow on production')