#!/bin/bash

# JALA2 Vercel Deployment Script
# Deploys frontend to Vercel
# Usage: ./scripts/deploy-to-vercel.sh [dev|prod]

set -e  # Exit on error

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

# Check environment
ENV=${1:-prod}

if [ "$ENV" == "dev" ]; then
    ENV_NAME="Development (Preview)"
    PROD_FLAG=""
else
    ENV_NAME="Production"
    PROD_FLAG="--prod"
fi

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║         JALA2 Vercel Deployment                           ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo "  Environment: ${ENV_NAME}"
echo ""

# Check if Vercel CLI is installed
print_info "Checking Vercel CLI..."
if ! command -v vercel &> /dev/null; then
    print_error "Vercel CLI not found!"
    echo ""
    echo "Install it with:"
    echo "  npm install -g vercel"
    echo ""
    exit 1
fi
print_success "Vercel CLI found: $(vercel --version)"
echo ""

# Build frontend first
print_info "Building frontend..."
echo ""
if ./scripts/deploy-frontend.sh "$ENV"; then
    print_success "Frontend build complete"
else
    print_error "Frontend build failed"
    exit 1
fi

echo ""

# Deploy to Vercel
print_info "Deploying to Vercel..."
echo ""

if [ -n "$PROD_FLAG" ]; then
    print_info "Deploying to PRODUCTION..."
    vercel --prod --yes
else
    print_info "Deploying to PREVIEW..."
    vercel --yes
fi

echo ""
print_success "Deployed to Vercel! 🚀"
echo ""
