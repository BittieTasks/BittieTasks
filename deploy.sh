#!/bin/bash
set -e

echo "🚀 Deploying BittieTasks Revenue Platform to Vercel"

# Set Vercel token if authentication works
export VERCEL_TOKEN=""

# Deploy using direct API approach
npx vercel --prod --token=$VERCEL_TOKEN --confirm --force

# Add environment variables
npx vercel env add NEXT_PUBLIC_SUPABASE_URL production --token=$VERCEL_TOKEN <<< "https://ttgbotlcbzmmyqawnjpj.supabase.co"
npx vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production --token=$VERCEL_TOKEN <<< "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR0Z2JvdGxjYnptbXlxYXduanBqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ2MDA4NzksImV4cCI6MjA3MDE3Njg3OX0.jc_PZay5gUyleINrGC5d5Sd2mCkHjonP56KCLJJNM1k"

# Final deployment with environment variables
npx vercel --prod --token=$VERCEL_TOKEN --confirm

echo "✅ BittieTasks revenue platform deployed successfully!"
echo "Features live: Task marketplace, subscription tiers, corporate sponsorship, earnings dashboard"