#!/bin/bash

# Quick deployment script for Render
# This script helps set up the deployment

echo "🚀 NYE Staffing - Render Deployment Helper"
echo ""

echo "Step 1: Make sure your code is pushed to GitHub"
read -p "Is your code on GitHub? (y/n): " on_github

if [ "$on_github" != "y" ]; then
    echo "Please push your code to GitHub first:"
    echo "  git push origin main"
    exit 1
fi

echo ""
echo "Step 2: Go to Render Dashboard"
echo "👉 https://dashboard.render.com"
echo ""
echo "Step 3: Create a new Blueprint"
echo "  1. Click 'New +' → 'Blueprint'"
echo "  2. Connect your GitHub account"
echo "  3. Select the 'nye-staffing' repository"
echo "  4. Render will detect render.yaml automatically"
echo "  5. Click 'Apply' to deploy"
echo ""
echo "Step 4: After deployment, configure:"
echo "  - Backend: Set CORS_ORIGIN to your frontend URL"
echo "  - Database: Run schema.sql via Render's database dashboard"
echo ""
echo "Step 5: Create admin user:"
echo "  curl -X POST https://your-backend.onrender.com/api/auth/register \\"
echo "    -H 'Content-Type: application/json' \\"
echo "    -d '{\"name\":\"Admin\",\"email\":\"admin@example.com\",\"password\":\"admin123\",\"role\":\"admin\"}'"
echo ""
echo "✅ Your app will be live at:"
echo "   Frontend: https://nye-staffing-frontend.onrender.com"
echo "   Backend: https://nye-staffing-backend.onrender.com"
echo ""
echo "Note: Free tier services sleep after 15 min of inactivity"
echo "      First request after sleep may take 30-60 seconds"
