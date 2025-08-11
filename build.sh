#!/bin/bash
# Build script for Next.js deployment

set -e

echo "🚀 Starting Next.js build process..."

# Ensure we're using Node 18+
node --version
npm --version

# Install dependencies
echo "📦 Installing dependencies..."
npm ci

# Run Next.js build
echo "🔨 Building Next.js application..."
npm run build

# Verify build output
if [ -d ".next" ]; then
    echo "✅ Next.js build completed successfully!"
    echo "📊 Build output size:"
    du -sh .next
else
    echo "❌ Build failed - .next directory not found"
    exit 1
fi

echo "🎉 Deployment ready!"