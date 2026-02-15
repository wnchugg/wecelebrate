#!/bin/bash

# JALA2 Complete Deployment Script
# Deploys both backend and frontend

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo ""
echo -e "${BLUE}════════════════════════════════════════${NC}"
echo -e "${BLUE}   JALA2 Complete Deployment${NC}"
echo -e "${BLUE}   Backend + Frontend${NC}"
echo -e "${BLUE}════════════════════════════════════════${NC}"
echo ""

# Step 1: Backend Status
echo -e "${YELLOW}Step 1:${NC} Checking backend status..."
BACKEND_URL="https://wjfcqqrlhwdvvjmefxky.supabase.co/functions/v1/make-server-6fcaeea3"
HEALTH_RESPONSE=$(curl -s "$BACKEND_URL/health")

if echo "$HEALTH_RESPONSE" | grep -q '"status":"ok"'; then
    echo -e "${GREEN}✓${NC} Backend is healthy"
    echo "   URL: $BACKEND_URL"
else
    echo -e "${RED}✗${NC} Backend health check failed"
    echo "   Response: $HEALTH_RESPONSE"
    echo ""
    echo "Deploy backend first: ./deploy-backend.sh dev"
    exit 1
fi

# Step 2: Build Frontend
echo ""
echo -e "${YELLOW}Step 2:${NC} Building frontend..."
if npm run build > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} Frontend built successfully"
else
    echo -e "${RED}✗${NC} Frontend build failed"
    echo ""
    echo "Run 'npm run build' to see errors"
    exit 1
fi

# Step 3: Check Netlify CLI
echo ""
echo -e "${YELLOW}Step 3:${NC} Checking deployment options..."

if command -v netlify &> /dev/null; then
    echo -e "${GREEN}✓${NC} Netlify CLI found"
    
    # Check if site is linked
    if [ -f ".netlify/state.json" ]; then
        echo -e "${GREEN}✓${NC} Site is linked to Netlify"
        echo ""
        echo -e "${YELLOW}→${NC} Deploying to Netlify..."
        netlify deploy --prod
        
        echo ""
        echo -e "${GREEN}════════════════════════════════════════${NC}"
        echo -e "${GREEN}   Deployment Complete!${NC}"
        echo -e "${GREEN}════════════════════════════════════════${NC}"
        echo ""
        
        # Get site URL
        SITE_URL=$(netlify status --json 2>/dev/null | grep -o '"url":"[^"]*"' | cut -d'"' -f4 | head -1)
        
        if [ -n "$SITE_URL" ]; then
            echo "Frontend URL: $SITE_URL"
            echo "Backend URL: $BACKEND_URL"
            echo ""
            echo "Next steps:"
            echo "  1. Open: $SITE_URL/admin/login"
            echo "  2. Login with: admin@example.com / Admin123!"
            echo "  3. Test dashboard and features"
        fi
    else
        echo -e "${YELLOW}⚠${NC}  Site not linked to Netlify"
        echo ""
        echo "Link your site first:"
        echo "  netlify link"
        echo ""
        echo "Then run this script again"
    fi
else
    echo -e "${YELLOW}⚠${NC}  Netlify CLI not found"
    echo ""
    echo "Deployment options:"
    echo ""
    echo "1. Install Netlify CLI and deploy:"
    echo "   npm install -g netlify-cli"
    echo "   netlify login"
    echo "   netlify link"
    echo "   netlify deploy --prod"
    echo ""
    echo "2. Deploy via Git push (if connected to GitHub):"
    echo "   git add ."
    echo "   git commit -m 'Deploy: Latest features'"
    echo "   git push origin main"
    echo ""
    echo "3. Manual deploy:"
    echo "   - Go to https://app.netlify.com"
    echo "   - Drag and drop the 'dist' folder"
    echo ""
    echo "Build is ready in: ./dist"
fi

echo ""
