#!/bin/bash

echo "=========================================="
echo "🚀 VALERIS AUTOMATED DEPLOYMENT SETUP"
echo "=========================================="
echo ""

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "📦 Initializing git repository..."
    git init
    git branch -M main
    echo "✅ Git initialized"
else
    echo "✅ Git already initialized"
fi

echo ""
echo "=========================================="
echo "⚠️  ACTION REQUIRED"
echo "=========================================="
echo ""
echo "1️⃣  CREATE GITHUB REPOSITORY"
echo "   Go to: https://github.com/new"
echo "   Repository name: valeris-platform (or your choice)"
echo "   Keep it PRIVATE if you want"
echo "   DO NOT initialize with README"
echo ""
echo "2️⃣  GET NETLIFY TOKENS"
echo ""
echo "   A) NETLIFY_AUTH_TOKEN:"
echo "      → https://app.netlify.com/user/applications"
echo "      → Click 'New access token'"
echo "      → Name: 'GitHub Actions'"
echo "      → Copy the token"
echo ""
echo "   B) NETLIFY_SITE_ID:"
echo "      → https://app.netlify.com/sites/valerisplatform/settings/general"
echo "      → Find 'Site information'"
echo "      → Copy 'Site ID'"
echo ""
read -p "Press ENTER when you have both tokens ready..."

echo ""
echo "3️⃣  ENTER YOUR GITHUB REPOSITORY URL"
echo "   Example: https://github.com/yourusername/valeris-platform.git"
read -p "Repository URL: " REPO_URL

if [ ! -z "$REPO_URL" ]; then
    echo "🔗 Setting up remote..."
    git remote remove origin 2>/dev/null
    git remote add origin "$REPO_URL"
    echo "✅ Remote configured"
fi

echo ""
echo "4️⃣  ADD FILES AND COMMIT"
git add .
git commit -m "Initial commit - Set up automated deployment" 2>/dev/null || echo "✅ Already committed"

echo ""
echo "5️⃣  PUSH TO GITHUB"
echo "   This will push your code to GitHub..."
read -p "Ready to push? (y/n): " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    git push -u origin main
    echo "✅ Code pushed to GitHub!"
fi

echo ""
echo "=========================================="
echo "6️⃣  FINAL STEP: ADD GITHUB SECRETS"
echo "=========================================="
echo ""
echo "Go to your GitHub repository:"
echo "Settings → Secrets and variables → Actions → New repository secret"
echo ""
echo "Add these 4 secrets:"
echo ""
echo "Secret 1:"
echo "  Name:  VITE_SUPABASE_URL"
echo "  Value: https://ihvotremeyzwynqhhqzl.supabase.co"
echo ""
echo "Secret 2:"
echo "  Name:  VITE_SUPABASE_ANON_KEY"
echo "  Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlodm90cmVtZXl6d3lucWhocXpsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQwMTEyMjIsImV4cCI6MjA3OTU4NzIyMn0.6taB5h62LkNhYzXXpq5VPREPF4-rLyA5yGS7PNOoD-I"
echo ""
echo "Secret 3:"
echo "  Name:  NETLIFY_AUTH_TOKEN"
echo "  Value: [paste your token from step 2A]"
echo ""
echo "Secret 4:"
echo "  Name:  NETLIFY_SITE_ID"
echo "  Value: [paste your site ID from step 2B]"
echo ""
echo "=========================================="
echo "✅ SETUP COMPLETE!"
echo "=========================================="
echo ""
echo "🎉 From now on, just run:"
echo ""
echo "   git add ."
echo "   git commit -m \"Your changes\""
echo "   git push"
echo ""
echo "And your site will auto-deploy to:"
echo "https://valerisplatform.netlify.app/"
echo ""
echo "Watch deployments at:"
echo "GitHub Actions: $REPO_URL/actions"
echo ""
