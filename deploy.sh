#!/bin/bash

echo "🚀 Deploying to production..."
echo ""

# Build first
echo "📦 Building application..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    echo ""

    # Commit and push
    echo "📤 Deploying to GitHub..."
    git add .

    echo "Enter commit message (or press ENTER for default):"
    read COMMIT_MSG

    if [ -z "$COMMIT_MSG" ]; then
        COMMIT_MSG="Deploy: $(date +'%Y-%m-%d %H:%M:%S')"
    fi

    git commit -m "$COMMIT_MSG"
    git push

    echo ""
    echo "=========================================="
    echo "✅ DEPLOYMENT STARTED!"
    echo "=========================================="
    echo ""
    echo "Your changes are being deployed automatically."
    echo ""
    echo "📊 Watch progress:"
    echo "   GitHub Actions: $(git remote get-url origin | sed 's/\.git$//')/actions"
    echo ""
    echo "🌐 Your site will be live at:"
    echo "   https://valerisplatform.netlify.app/"
    echo ""
    echo "⏱️  Deployment takes 2-3 minutes"
    echo ""
else
    echo "❌ Build failed! Fix errors before deploying."
    exit 1
fi
