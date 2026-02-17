#!/bin/bash

# JALA2 Backend Deployment Script
# Deploys the Edge Function to Development or Production

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
    
    # Confirm production deployment
    echo -e "${RED}⚠️  WARNING: You are about to deploy to PRODUCTION${NC}"
    read -p "Are you sure? (yes/no): " confirm
    if [ "$confirm" != "yes" ]; then
        echo "Deployment cancelled"
        exit 0
    fi
else
    echo -e "${RED}Error: Invalid environment. Use 'dev' or 'prod'${NC}"
    echo ""
    echo "Usage:"
    echo "  ./deploy-backend.sh dev   # Deploy to development"
    echo "  ./deploy-backend.sh prod  # Deploy to production"
    exit 1
fi

echo ""
echo -e "${BLUE}════════════════════════════════════════${NC}"
echo -e "${BLUE}   JALA2 Backend Deployment${NC}"
echo -e "${BLUE}   Environment: $ENV_NAME${NC}"
echo -e "${BLUE}════════════════════════════════════════${NC}"
echo ""

# Step 1: Check directory structure
echo -e "${YELLOW}→${NC} Preparing deployment..."
if [ -L "supabase/functions/make-server-6fcaeea3" ]; then
    echo -e "${GREEN}✓${NC} Symlink already exists"
elif [ -d "supabase/functions/server" ]; then
    echo -e "${GREEN}✓${NC} Server directory found"
else
    echo -e "${RED}✗${NC} Error: Function directory not found!"
    exit 1
fi

# Step 2: Deploy
echo ""
echo -e "${YELLOW}→${NC} Deploying Edge Function to $ENV_NAME..."
supabase functions deploy make-server-6fcaeea3 --project-ref $PROJECT_REF --no-verify-jwt

echo ""
echo -e "${GREEN}✓${NC} Deployed successfully!"

# Step 3: No cleanup needed (using symlink)
echo ""
echo -e "${GREEN}✓${NC} Deployment files ready"

# Step 4: Test
echo ""
echo -e "${YELLOW}→${NC} Testing backend health..."
sleep 2

HEALTH_URL="https://${PROJECT_REF}.supabase.co/functions/v1/make-server-6fcaeea3/health"
RESPONSE=$(curl -s "$HEALTH_URL" || echo "")

if echo "$RESPONSE" | grep -q '"status":"ok"'; then
    echo -e "${GREEN}✓${NC} Backend is healthy!"
    echo ""
    echo -e "${GREEN}════════════════════════════════════════${NC}"
    echo -e "${GREEN}   Deployment Complete!${NC}"
    echo -e "${GREEN}════════════════════════════════════════${NC}"
    echo ""
    echo "Backend URL: https://${PROJECT_REF}.supabase.co/functions/v1/make-server-6fcaeea3"
    echo ""
    
    if [ "$ENV" = "dev" ]; then
        echo "Next steps:"
        echo "  1. Test login at http://localhost:5173/admin/login"
        echo "  2. Check browser console for any errors"
        echo "  3. View logs: supabase functions logs make-server-6fcaeea3"
    else
        echo "Production deployment complete!"
        echo "  View logs: supabase functions logs make-server-6fcaeea3"
    fi
    echo ""
else
    echo -e "${RED}✗${NC} Health check failed"
    echo "Response: $RESPONSE"
    echo ""
    echo "Troubleshooting:"
    echo "  1. Check logs: supabase functions logs make-server-6fcaeea3"
    echo "  2. Verify JWT keys are set in Supabase Dashboard"
    echo "  3. Wait 30 seconds and try again (cold start)"
    exit 1
fi