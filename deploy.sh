#!/bin/bash

# VPS Deployment Script for Vet Sidekick
# Usage: ./deploy.sh

echo "🚀 Starting deployment..."

# Pull latest changes from GitHub
echo "📥 Pulling latest changes from GitHub..."
git pull origin main

# Check if pull was successful
if [ $? -ne 0 ]; then
    echo "❌ Git pull failed. Deployment aborted."
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Check if npm install was successful
if [ $? -ne 0 ]; then
    echo "❌ npm install failed. Deployment aborted."
    exit 1
fi

# Build the application
echo "🔨 Building application..."
npm run build

# Check if build was successful
if [ $? -ne 0 ]; then
    echo "❌ Build failed. Deployment aborted."
    exit 1
fi

# Restart PM2 process
echo "🔄 Restarting PM2 process..."
pm2 restart vet-sidekick

# Check PM2 status
echo "📊 Checking PM2 status..."
pm2 status

echo "✅ Deployment completed successfully!"
echo "🌐 Your site is running at: http://82.165.196.16"