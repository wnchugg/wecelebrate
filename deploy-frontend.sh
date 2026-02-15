#!/bin/bash

# JALA2 Frontend Deployment Script
# Builds and deploys the React frontend to Netlify

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo ""
echo -e "${BLUE}════════════════════════════════════════${NC}"
echo -e "${BLUE}   JALA2 Frontend Deployment${NC}"
echo -e "${BLUE}════════════════════════════════════════${NC}"
echo ""

# Step 1: Check environment variables
echo -e "${YELLOW}→${NC} Checking environment variables..."

if [ ! -f ".env" ]; then
    echo -e "${RED}✗${NC} .env file not found!"
    echo ""
    echo "Please create a .env file with:"
    echo "  VITE_SUPABASE_URL=https://wjfcqqrlhwdvvjmefxky.supabase.co"
    echo "  VITE_SUPABASE_ANON_KEY=<your-anon-key>"
    echo "  VITE_API_URL=https://wjfcqqrlhwdvvjmefxky.supabase.co/functions/v1/make-server-6fcaeea3"
    echo "  VITE_APP_ENV=development"
    echo ""
    exit 1
fi

echo -e "${GREEN}✓${NC} .env file found"

# Step 2: Install dependencies
echo ""
echo -e "${YELLOW}→${NC} Installing dependencies..."
npm install --silent
echo -e "${GREEN}✓${NC} Dependencies installed"

# Step 3: Type check
echo ""
echo -e "${YELLOW}→${NC} Running type check..."
if npm run type-check; then
    echo -e "${GREEN}✓${NC} Type check passed"
else
    echo -e "${RED}✗${NC} Type check failed"
    echo ""
    echo "Fix TypeScript errors before deploying"
    exit 1
fi

# Step 4: Build
echo ""
echo -e "${YELLOW}→${NC} Building frontend..."
if npm run build; then
    echo -e "${GREEN}✓${NC} Build successful"
else
    echo -e "${RED}✗${NC} Build failed"
    exit 1
fi

# Step 5: Check if Netlify CLI is installed
echo ""
echo -e "${YELLOW}→${NC} Checking Netlify CLI..."
if ! command -v netlify &> /dev/null; then
    echo -e "${YELLOW}⚠${NC}  Netlify CLI not found"
    echo ""
    echo "Install with: npm install -g netlify-cli"
    echo ""
    echo "Or deploy manually:"
    echo "  1. Go to https://app.netlify.com"
    echo "  2. Drag and drop the 'dist' folder"
    echo ""
    exit 0
fi

echo -e "${GREEN}✓${NC} Netlify CLI found"

# Step 6: Deploy
echo ""
echo -e "${YELLOW}→${NC} Deploying to Netlify..."
echo ""

# Check if site is linked
if [ ! -f ".netlify/state.json" ]; then
    echo -e "${YELLOW}⚠${NC}  Site not linked to Netlify"
    echo ""
    echo "Run: netlify link"
    echo ""
    exit 0
fi

# Deploy
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
    echo ""
    echo "Next steps:"
    echo "  1. Open: $SITE_URL"
    echo "  2. Test login: $SITE_URL/admin/login"
    echo "  3. Check console for errors"
else
    echo "Check Netlify dashboard for deployment URL"
fi

echo ""
