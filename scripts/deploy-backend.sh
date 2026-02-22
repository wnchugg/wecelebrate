#!/bin/bash

# JALA2 Backend Deployment Script
# Deploys Supabase Edge Function to Development or Production
# Usage: ./scripts/deploy-backend.sh [dev|prod]

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Function to print colored output
print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

# Check if environment argument is provided
if [ -z "$1" ]; then
    print_error "Usage: ./scripts/deploy-backend.sh [dev|prod]"
    echo ""
    echo "Examples:"
    echo "  ./scripts/deploy-backend.sh dev   # Deploy backend to Development"
    echo "  ./scripts/deploy-backend.sh prod  # Deploy backend to Production"
    exit 1
fi

ENV=$1

# Validate environment
if [ "$ENV" != "dev" ] && [ "$ENV" != "prod" ]; then
    print_error "Invalid environment: $ENV"
    print_info "Must be either 'dev' or 'prod'"
    exit 1
fi

# Set environment-specific variables
if [ "$ENV" == "dev" ]; then
    ENV_NAME="Development"
    PROJECT_ID="wjfcqqrlhwdvvjmefxky"
else
    ENV_NAME="Production"
    PROJECT_ID="lmffeqwhrnbsbhdztwyv"
fi

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║                                                            ║"
echo "║          JALA2 Backend Deployment Script                  ║"
echo "║                                                            ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo "  Environment: ${ENV_NAME}"
echo "  Project ID:  ${PROJECT_ID}"
echo "  Timestamp:   $(date '+%Y-%m-%d %H:%M:%S')"
echo ""
echo "────────────────────────────────────────────────────────────"
echo ""

# Check Supabase CLI
print_info "Checking Supabase CLI..."
if ! command -v supabase &> /dev/null; then
    print_error "Supabase CLI not found!"
    echo ""
    echo "Install it with:"
    echo "  npm install -g supabase"
    echo ""
    exit 1
fi
print_success "Supabase CLI found: $(supabase --version)"
echo ""

# Link to project
print_info "Linking to ${ENV_NAME} project..."
echo ""

# Unlink first
supabase unlink 2>/dev/null || true

# Link to project
if supabase link --project-ref "$PROJECT_ID"; then
    print_success "Successfully linked to ${ENV_NAME} project"
else
    print_error "Failed to link to project"
    exit 1
fi

echo ""

# Deploy Edge Function
print_info "Deploying Edge Function: make-server-6fcaeea3..."
echo ""

if supabase functions deploy make-server-6fcaeea3 --no-verify-jwt; then
    print_success "Backend deployed successfully!"
else
    print_error "Backend deployment failed"
    exit 1
fi

echo ""

# Get project URL and anon key for testing
echo "────────────────────────────────────────────────────────────"
print_info "To test the deployment, run:"
echo ""
echo "  curl https://${PROJECT_ID}.supabase.co/functions/v1/server/health \\"
echo "    -H \"Authorization: Bearer [YOUR_ANON_KEY]\""
echo ""

# Save deployment log
DEPLOYMENT_LOG="deployments/${ENV}-backend-$(date +%Y%m%d-%H%M%S).log"
mkdir -p deployments

cat > "$DEPLOYMENT_LOG" << EOF
JALA2 Backend ${ENV_NAME} Deployment
═══════════════════════════════════════════════════

Date: $(date '+%Y-%m-%d %H:%M:%S')
Environment: ${ENV_NAME}
Project ID: ${PROJECT_ID}
Function: server

Backend deployed successfully!
EOF

print_success "Deployment log saved to: ${DEPLOYMENT_LOG}"
echo ""

echo "════════════════════════════════════════════════════════════"
print_success "Backend deployment complete! 🚀"
echo "════════════════════════════════════════════════════════════"
echo ""