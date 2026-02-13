#!/bin/bash

# Quick Backend Redeployment Script
# Renames, deploys, then renames back

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Get environment argument
ENV=${1:-dev}

if [ "$ENV" = "dev" ]; then
    PROJECT_REF="wjfcqqrlhwdvvjmefxky"
    ENV_NAME="Development"
elif [ "$ENV" = "prod" ]; then
    PROJECT_REF="lmffeqwhrnbsbhdztwyv"
    ENV_NAME="Production"
else
    echo -e "${RED}Error: Invalid environment. Use 'dev' or 'prod'${NC}"
    exit 1
fi

echo ""
echo -e "${BLUE}════════════════════════════════════════${NC}"
echo -e "${BLUE}   Quick Backend Redeploy ($ENV_NAME)${NC}"
echo -e "${BLUE}════════════════════════════════════════${NC}"
echo ""

# Step 1: Rename directory
echo -e "${YELLOW}→${NC} Renaming server → make-server-6fcaeea3..."
if [ -d "supabase/functions/server" ]; then
    mv supabase/functions/server supabase/functions/make-server-6fcaeea3
    echo -e "${GREEN}✓${NC} Renamed"
elif [ -d "supabase/functions/make-server-6fcaeea3" ]; then
    echo -e "${GREEN}✓${NC} Already named correctly"
else
    echo -e "${RED}✗${NC} Error: Neither 'server' nor 'make-server-6fcaeea3' directory found!"
    exit 1
fi

# Step 2: Deploy
echo ""
echo -e "${YELLOW}→${NC} Deploying Edge Function..."
supabase functions deploy make-server-6fcaeea3 --project-ref $PROJECT_REF --no-verify-jwt

echo ""
echo -e "${GREEN}✓${NC} Deployed successfully!"

# Step 3: Rename back
echo ""
echo -e "${YELLOW}→${NC} Renaming back to 'server' for easier editing..."
mv supabase/functions/make-server-6fcaeea3 supabase/functions/server
echo -e "${GREEN}✓${NC} Renamed back"

# Step 4: Test
echo ""
echo -e "${YELLOW}→${NC} Testing backend health..."
sleep 2

HEALTH_URL="https://${PROJECT_REF}.supabase.co/functions/v1/make-server-6fcaeea3/health"
RESPONSE=$(curl -s "$HEALTH_URL")

if echo "$RESPONSE" | grep -q '"status":"ok"'; then
    echo -e "${GREEN}✓${NC} Backend is healthy!"
    echo ""
    echo -e "${GREEN}════════════════════════════════════════${NC}"
    echo -e "${GREEN}   Deployment Complete!${NC}"
    echo -e "${GREEN}════════════════════════════════════════${NC}"
    echo ""
    echo "Backend URL: https://${PROJECT_REF}.supabase.co/functions/v1/make-server-6fcaeea3"
    echo ""
    echo "Next steps:"
    echo "  1. Test login at http://localhost:5173/admin/login"
    echo "  2. Check browser console for any errors"
    echo ""
else
    echo -e "${RED}✗${NC} Health check failed"
    echo "Response: $RESPONSE"
    exit 1
fi