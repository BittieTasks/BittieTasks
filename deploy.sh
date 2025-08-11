#!/bin/bash
# Deploy script to force Vercel deployment

echo "🚀 Forcing Vercel deployment of latest commit..."
echo "Current commit: $(git rev-parse HEAD)"
echo "Timestamp: $(date)"

# Create a deployment marker
echo "$(date): Deploy trigger" > .vercel-deploy-marker

# Instructions for manual deployment
echo ""
echo "📋 MANUAL DEPLOYMENT STEPS:"
echo "1. Go to vercel.com/dashboard"
echo "2. Find your BittieTasks project"
echo "3. Click 'Redeploy' to force deploy latest commit"
echo ""
echo "🔍 Verify deployment uses commit: $(git rev-parse HEAD)"
echo "✅ Expected result: Successful build with 16 static pages"