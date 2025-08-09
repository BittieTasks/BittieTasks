#!/bin/bash

# BittieTasks Deployment Script
echo "🚀 Starting BittieTasks deployment..."

# Export Next.js application
echo "📦 Building application..."
npx next build

if [ $? -eq 0 ]; then
    echo "✅ Build successful! Your monetization platform is ready for deployment."
    echo ""
    echo "🎯 DEPLOYMENT READY:"
    echo "• Complete task marketplace with earnings system"
    echo "• Subscription tiers: Free (10%) → Pro (7%) → Premium (5%) platform fees"
    echo "• Corporate sponsorship portal with ethical partner evaluation"
    echo "• Email verification access control system"
    echo "• Real-time earnings dashboard and goal tracking"
    echo ""
    echo "💰 REVENUE FEATURES INCLUDED:"
    echo "• Platform automatically calculates fees in real-time"
    echo "• Sponsored tasks offering 25-50% higher payouts"
    echo "• Achievement rewards system"
    echo "• Comprehensive analytics and growth insights"
    echo ""
    echo "🎯 Next step: Use Replit's Deploy button to make this live!"
else
    echo "❌ Build failed. Check the errors above."
    exit 1
fi