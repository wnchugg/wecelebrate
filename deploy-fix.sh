#!/bin/bash

# 🔐 Quick Fix Deployment Script for Authentication Errors
# This script deploys the backend with correct settings to fix 401 errors

set -e  # Exit on any error

echo "🔐 JALA 2 - Authentication Fix Deployment"
echo "=========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    print_error "Supabase CLI not found!"
    echo "Install it with: npm install -g supabase"
    exit 1
fi

print_status "Supabase CLI found"

# Prompt for environment
echo ""
echo "Select environment to deploy:"
echo "  1) Development (wjfcqqrlhwdvvjmefxky)"
echo "  2) Production (lmffeqwhrnbsbhdztwyv)"
echo "  3) Both"
read -p "Enter choice (1-3): " ENV_CHOICE

case $ENV_CHOICE in
    1)
        DEPLOY_DEV=true
        DEPLOY_PROD=false
        ;;
    2)
        DEPLOY_DEV=false
        DEPLOY_PROD=true
        ;;
    3)
        DEPLOY_DEV=true
        DEPLOY_PROD=true
        ;;
    *)
        print_error "Invalid choice"
        exit 1
        ;;
esac

echo ""
echo "Step 1: Checking function directory structure..."

# Check if function exists
if [ -d "supabase/functions/make-server-6fcaeea3" ]; then
    print_status "Function directory found: supabase/functions/make-server-6fcaeea3"
    FUNCTION_DIR="supabase/functions/make-server-6fcaeea3"
elif [ -d "supabase/functions/server" ]; then
    print_warning "Function directory is 'server', renaming to 'make-server-6fcaeea3'..."
    mv supabase/functions/server supabase/functions/make-server-6fcaeea3
    print_status "Renamed successfully"
    FUNCTION_DIR="supabase/functions/make-server-6fcaeea3"
else
    print_error "Function directory not found!"
    echo "Expected: supabase/functions/make-server-6fcaeea3 or supabase/functions/server"
    exit 1
fi

echo ""
echo "Step 2: Authenticating with Supabase..."
supabase logout 2>/dev/null || true
if ! supabase login; then
    print_error "Login failed"
    exit 1
fi
print_status "Authenticated successfully"

# Deploy to Development
if [ "$DEPLOY_DEV" = true ]; then
    echo ""
    echo "=========================================="
    echo "Deploying to DEVELOPMENT"
    echo "=========================================="
    
    PROJECT_REF="wjfcqqrlhwdvvjmefxky"
    
    echo ""
    echo "Step 3a: Linking to development project..."
    if ! supabase link --project-ref $PROJECT_REF; then
        print_error "Failed to link to development project"
        exit 1
    fi
    print_status "Linked to development project"
    
    echo ""
    echo "Step 4a: Deploying function with --no-verify-jwt..."
    if ! supabase functions deploy make-server-6fcaeea3 --project-ref $PROJECT_REF --no-verify-jwt; then
        print_error "Deployment to development failed"
        exit 1
    fi
    print_status "Deployed to development successfully"
    
    echo ""
    echo "Step 5a: Setting environment variables..."
    supabase secrets set --project-ref $PROJECT_REF ALLOWED_ORIGINS="*" 2>/dev/null || print_warning "Failed to set ALLOWED_ORIGINS (may already exist)"
    supabase secrets set --project-ref $PROJECT_REF SEED_ON_STARTUP="false" 2>/dev/null || print_warning "Failed to set SEED_ON_STARTUP (may already exist)"
    print_status "Environment variables configured"
    
    echo ""
    echo "Step 6a: Testing development deployment..."
    DEV_URL="https://$PROJECT_REF.supabase.co/functions/v1/make-server-6fcaeea3/health"
    echo "Testing: $DEV_URL"
    
    if curl -s -f "$DEV_URL" > /dev/null; then
        print_status "Health check passed!"
        echo ""
        echo "Development deployment successful! ✅"
        echo "URL: $DEV_URL"
        echo "Admin: https://jala2-dev.netlify.app/admin"
        echo "Bootstrap: https://jala2-dev.netlify.app/admin/bootstrap"
    else
        print_error "Health check failed"
        echo "Try manually: curl $DEV_URL"
    fi
fi

# Deploy to Production
if [ "$DEPLOY_PROD" = true ]; then
    echo ""
    echo "=========================================="
    echo "Deploying to PRODUCTION"
    echo "=========================================="
    
    PROJECT_REF="lmffeqwhrnbsbhdztwyv"
    
    echo ""
    echo "Step 3b: Linking to production project..."
    if ! supabase link --project-ref $PROJECT_REF; then
        print_error "Failed to link to production project"
        exit 1
    fi
    print_status "Linked to production project"
    
    echo ""
    echo "Step 4b: Deploying function with --no-verify-jwt..."
    if ! supabase functions deploy make-server-6fcaeea3 --project-ref $PROJECT_REF --no-verify-jwt; then
        print_error "Deployment to production failed"
        exit 1
    fi
    print_status "Deployed to production successfully"
    
    echo ""
    echo "Step 5b: Setting environment variables..."
    supabase secrets set --project-ref $PROJECT_REF ALLOWED_ORIGINS="https://jala2-dev.netlify.app,https://jala2.netlify.app" 2>/dev/null || print_warning "Failed to set ALLOWED_ORIGINS (may already exist)"
    supabase secrets set --project-ref $PROJECT_REF SEED_ON_STARTUP="false" 2>/dev/null || print_warning "Failed to set SEED_ON_STARTUP (may already exist)"
    print_status "Environment variables configured"
    
    echo ""
    echo "Step 6b: Testing production deployment..."
    PROD_URL="https://$PROJECT_REF.supabase.co/functions/v1/make-server-6fcaeea3/health"
    echo "Testing: $PROD_URL"
    
    if curl -s -f "$PROD_URL" > /dev/null; then
        print_status "Health check passed!"
        echo ""
        echo "Production deployment successful! ✅"
        echo "URL: $PROD_URL"
    else
        print_error "Health check failed"
        echo "Try manually: curl $PROD_URL"
    fi
fi

echo ""
echo "=========================================="
echo "🎉 Deployment Complete!"
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. Create first admin user at: https://jala2-dev.netlify.app/admin/bootstrap"
echo "2. Login at: https://jala2-dev.netlify.app/admin"
echo "3. Start configuring your platform!"
echo ""
echo "Need help? Check /AUTHENTICATION_FIX_GUIDE.md"
