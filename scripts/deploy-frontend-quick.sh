#!/bin/bash

# Quick Frontend Deployment (skips type check)
# Use this ONLY for quick testing when you know the backend is working
# and you need to test the frontend immediately

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║           Quick Frontend Build (NO TYPE CHECK)            ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo -e "${YELLOW}⚠️  WARNING: This skips TypeScript type checking!${NC}"
echo ""

# Install dependencies  
echo -e "${BLUE}ℹ${NC} Installing dependencies..."
npm install

# Build frontend
echo ""
echo -e "${BLUE}ℹ${NC} Building frontend..."
npm run build

echo ""
echo -e "${GREEN}✓${NC} Frontend build complete!"
echo ""
echo "Next steps:"
echo "1. Start the dev server: npm run dev"
echo "2. Open http://localhost:5173"
echo "3. Navigate to /admin/login"
echo ""
