#!/bin/bash

# Supabase Multi-Environment Deployment Script
# Usage: ./scripts/deploy-environment.sh [dev|test|uat|prod]

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if environment argument is provided
if [ -z "$1" ]; then
    print_error "No environment specified"
    echo ""
    echo "Usage: ./scripts/deploy-environment.sh [dev|test|uat|prod]"
    echo ""
    echo "Examples:"
    echo "  ./scripts/deploy-environment.sh dev       # Deploy to Development"
    echo "  ./scripts/deploy-environment.sh test      # Deploy to Test"
    echo "  ./scripts/deploy-environment.sh uat       # Deploy to UAT"
    echo "  ./scripts/deploy-environment.sh prod      # Deploy to Production"
    exit 1
fi

ENV=$1

# Validate environment
if [[ ! "$ENV" =~ ^(dev|test|uat|prod)$ ]]; then
    print_error "Invalid environment: $ENV"
    echo "Valid environments: dev, test, uat, prod"
    exit 1
fi

# Environment names
case $ENV in
    dev)
        ENV_NAME="Development"
        ENV_COLOR=$GREEN
        ;;
    test)
        ENV_NAME="Test"
        ENV_COLOR=$YELLOW
        ;;
    uat)
        ENV_NAME="UAT"
        ENV_COLOR=$BLUE
        ;;
    prod)
        ENV_NAME="Production"
        ENV_COLOR=$RED
        ;;
esac

echo ""
echo -e "${ENV_COLOR}═══════════════════════════════════════════════════${NC}"
echo -e "${ENV_COLOR}  Deploying to ${ENV_NAME} Environment${NC}"
echo -e "${ENV_COLOR}═══════════════════════════════════════════════════${NC}"
echo ""

# Load environment variables
ENV_FILE=".env.${ENV}"
if [ "$ENV" = "dev" ]; then
    ENV_FILE=".env.local"
fi

if [ ! -f "$ENV_FILE" ]; then
    print_warning "Environment file not found: $ENV_FILE"
    print_info "Please create $ENV_FILE with your Supabase credentials"
    exit 1
fi

# Source the environment file to get project ID
source "$ENV_FILE"

# Determine which variable to use
case $ENV in
    dev)
        PROJECT_URL=$VITE_SUPABASE_URL
        ANON_KEY=$VITE_SUPABASE_ANON_KEY
        ;;
    test)
        PROJECT_URL=${VITE_SUPABASE_URL_TEST:-$VITE_SUPABASE_URL}
        ANON_KEY=${VITE_SUPABASE_ANON_KEY_TEST:-$VITE_SUPABASE_ANON_KEY}
        ;;
    uat)
        PROJECT_URL=${VITE_SUPABASE_URL_UAT:-$VITE_SUPABASE_URL}
        ANON_KEY=${VITE_SUPABASE_ANON_KEY_UAT:-$VITE_SUPABASE_ANON_KEY}
        ;;
    prod)
        PROJECT_URL=${VITE_SUPABASE_URL_PROD:-$VITE_SUPABASE_URL}
        ANON_KEY=${VITE_SUPABASE_ANON_KEY_PROD:-$VITE_SUPABASE_ANON_KEY}
        ;;
esac

# Extract project ID from URL
PROJECT_ID=$(echo $PROJECT_URL | sed -n 's/.*https:\/\/\([^.]*\).*/\1/p')

if [ -z "$PROJECT_ID" ]; then
    print_error "Could not extract project ID from: $PROJECT_URL"
    exit 1
fi

print_info "Project ID: $PROJECT_ID"
print_info "Project URL: $PROJECT_URL"
echo ""

# Confirm for production
if [ "$ENV" = "prod" ]; then
    print_warning "You are about to deploy to PRODUCTION!"
    read -p "Are you sure you want to continue? (type 'yes' to confirm): " confirm
    if [ "$confirm" != "yes" ]; then
        print_info "Deployment cancelled"
        exit 0
    fi
    echo ""
fi

# Unlink any existing project
print_info "Unlinking any existing project..."
supabase unlink -f 2>/dev/null || true

# Link to the target project
print_info "Linking to $ENV_NAME project ($PROJECT_ID)..."
if ! supabase link --project-ref "$PROJECT_ID"; then
    print_error "Failed to link to project"
    exit 1
fi
print_success "Linked to project"
echo ""

# Note about secrets
print_info "📝 Note: Make sure you've set the following secrets for this project:"
echo "   - SUPABASE_URL"
echo "   - SUPABASE_SERVICE_ROLE_KEY"
echo "   - SUPABASE_ANON_KEY"
echo ""
echo "   To set secrets, run:"
echo "   supabase secrets set SUPABASE_URL=$PROJECT_URL"
echo "   supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your-service-role-key"
echo "   supabase secrets set SUPABASE_ANON_KEY=your-anon-key"
echo ""

read -p "Have you set the secrets? (yes/skip): " secrets_confirm
if [ "$secrets_confirm" = "skip" ]; then
    print_warning "Skipping secrets check. Make sure they are set!"
fi
echo ""

# Deploy the Edge Function
print_info "Deploying Edge Function: make-server-6fcaeea3..."
if ! supabase functions deploy make-server-6fcaeea3; then
    print_error "Deployment failed"
    exit 1
fi
echo ""

print_success "Edge Function deployed successfully!"
echo ""

# Test the deployment
print_info "Testing deployment..."
HEALTH_URL="${PROJECT_URL}/functions/v1/make-server-6fcaeea3/health"

print_info "Health check URL: $HEALTH_URL"

response=$(curl -s -w "\n%{http_code}" \
  -H "Authorization: Bearer $ANON_KEY" \
  "$HEALTH_URL" 2>/dev/null || echo -e "\n000")

http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | head -n1)

echo ""
if [ "$http_code" = "200" ]; then
    print_success "Health check passed!"
    print_info "Response: $body"
else
    print_warning "Health check returned status code: $http_code"
    if [ "$http_code" = "000" ]; then
        print_error "Could not reach the endpoint. Check your network connection."
    else
        print_info "Response: $body"
    fi
fi
echo ""

# Show deployment summary
print_success "═══════════════════════════════════════════════════"
print_success "  Deployment to ${ENV_NAME} Complete! 🎉"
print_success "═══════════════════════════════════════════════════"
echo ""
print_info "Environment: ${ENV_NAME}"
print_info "Project ID: ${PROJECT_ID}"
print_info "Edge Function: make-server-6fcaeea3"
print_info "Status: DEPLOYED"
echo ""
print_info "Next steps:"
echo "  1. Test the login at /admin/login"
echo "  2. Select '${ENV_NAME}' from the environment dropdown"
echo "  3. Create an admin account or log in"
echo ""

# List all deployed functions
print_info "All deployed functions:"
supabase functions list
echo ""
