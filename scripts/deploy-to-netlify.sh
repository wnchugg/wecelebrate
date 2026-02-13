#!/bin/bash

# JALA2 Netlify Deployment Script
# Deploys frontend to Netlify
# Usage: ./scripts/deploy-to-netlify.sh [dev|prod]

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
    ENV_NAME="Development (Draft)"
    PROD_FLAG=""
else
    ENV_NAME="Production"
    PROD_FLAG="--prod"
fi

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║         JALA2 Netlify Deployment                          ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo "  Environment: ${ENV_NAME}"
echo ""

# Check if Netlify CLI is installed
print_info "Checking Netlify CLI..."
if ! command -v netlify &> /dev/null; then
    print_error "Netlify CLI not found!"
    echo ""
    echo "Install it with:"
    echo "  npm install -g netlify-cli"
    echo ""
    exit 1
fi
print_success "Netlify CLI found: $(netlify --version)"
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

# Deploy to Netlify
print_info "Deploying to Netlify..."
echo ""

if [ -n "$PROD_FLAG" ]; then
    print_info "Deploying to PRODUCTION..."
    netlify deploy --prod --dir=dist
else
    print_info "Deploying to DRAFT..."
    netlify deploy --dir=dist
fi

echo ""
print_success "Deployed to Netlify! 🚀"
echo ""
