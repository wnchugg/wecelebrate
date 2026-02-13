#!/bin/bash

# JALA2 Environment Deployment Script
# Automates deployment to Development or Production environments
# Usage: ./scripts/deploy-to-environment.sh [dev|prod]

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
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
    print_error "Usage: ./scripts/deploy-to-environment.sh [dev|prod]"
    echo ""
    echo "Examples:"
    echo "  ./scripts/deploy-to-environment.sh dev   # Deploy to Development"
    echo "  ./scripts/deploy-to-environment.sh prod  # Deploy to Production"
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
    ENV_LABEL="DEV"
    ENV_COLOR="${GREEN}"
else
    ENV_NAME="Production"
    ENV_LABEL="PROD"
    ENV_COLOR="${RED}"
fi

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║                                                            ║"
echo "║          JALA2 Environment Deployment Script              ║"
echo "║                                                            ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo -e "  Environment: ${ENV_COLOR}${ENV_NAME}${NC} [${ENV_LABEL}]"
echo "  Timestamp: $(date '+%Y-%m-%d %H:%M:%S')"
echo ""
echo "────────────────────────────────────────────────────────────"
echo ""

# Check if Supabase CLI is installed
print_info "Checking Supabase CLI installation..."
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

# Get project ID
echo "────────────────────────────────────────────────────────────"
print_info "Please enter your ${ENV_NAME} Supabase Project ID:"
read -p "Project ID: " PROJECT_ID

if [ -z "$PROJECT_ID" ]; then
    print_error "Project ID cannot be empty!"
    exit 1
fi

echo ""
print_info "Using Project ID: ${PROJECT_ID}"
echo ""

# Get credentials
echo "────────────────────────────────────────────────────────────"
print_info "Please enter your ${ENV_NAME} credentials:"
echo ""

read -p "Project URL (e.g., https://${PROJECT_ID}.supabase.co): " SUPABASE_URL
if [ -z "$SUPABASE_URL" ]; then
    SUPABASE_URL="https://${PROJECT_ID}.supabase.co"
    print_warning "Using default URL: ${SUPABASE_URL}"
fi

echo ""
read -sp "Anon Key: " ANON_KEY
echo ""
if [ -z "$ANON_KEY" ]; then
    print_error "Anon Key cannot be empty!"
    exit 1
fi

echo ""
read -sp "Service Role Key: " SERVICE_ROLE_KEY
echo ""
if [ -z "$SERVICE_ROLE_KEY" ]; then
    print_error "Service Role Key cannot be empty!"
    exit 1
fi

echo ""
print_success "Credentials collected"
echo ""

# Link to project
echo "────────────────────────────────────────────────────────────"
print_info "Linking to ${ENV_NAME} project..."
echo ""

# Unlink first (in case already linked to different project)
supabase unlink 2>/dev/null || true

# Link to project
print_info "Running: supabase link --project-ref ${PROJECT_ID}"
if supabase link --project-ref "$PROJECT_ID"; then
    print_success "Successfully linked to ${ENV_NAME} project"
else
    print_error "Failed to link to project"
    print_warning "You may need to enter your database password"
    exit 1
fi
echo ""

# Set secrets
echo "────────────────────────────────────────────────────────────"
print_info "Setting environment secrets..."
echo ""

print_info "Setting ALLOWED_ORIGINS..."
if [ "$ENV" == "prod" ]; then
    print_warning "Production: Set specific domains for ALLOWED_ORIGINS!"
    echo "  Current: Using '*' (all origins)"
    echo "  Recommended: Set to your actual domain(s)"
fi
supabase secrets set ALLOWED_ORIGINS="*"

print_info "Setting SEED_ON_STARTUP..."
supabase secrets set SEED_ON_STARTUP="false"

print_success "All secrets configured"
echo ""

print_info "Note: SUPABASE_URL, SUPABASE_ANON_KEY, and SUPABASE_SERVICE_ROLE_KEY"
print_info "are automatically provided by Supabase and don't need to be set."
echo ""

# Verify secrets
print_info "Verifying secrets..."
SECRET_COUNT=$(supabase secrets list 2>/dev/null | grep -c "SUPABASE" || echo "0")
if [ "$SECRET_COUNT" -ge 3 ]; then
    print_success "Secrets verified (${SECRET_COUNT} found)"
else
    print_warning "Expected 3+ secrets, found ${SECRET_COUNT}"
fi
echo ""

# Deploy Edge Function
echo "────────────────────────────────────────────────────────────"
print_info "Deploying Edge Function: make-server-6fcaeea3"
echo ""

if supabase functions deploy make-server-6fcaeea3; then
    print_success "Edge Function deployed successfully!"
else
    print_error "Edge Function deployment failed"
    exit 1
fi
echo ""

# Test deployment
echo "────────────────────────────────────────────────────────────"
print_info "Testing deployment..."
echo ""

HEALTH_URL="${SUPABASE_URL}/functions/v1/make-server-6fcaeea3/health"
print_info "Testing: ${HEALTH_URL}"
echo ""

if curl -f -s -H "Authorization: Bearer ${ANON_KEY}" "$HEALTH_URL" | grep -q "ok"; then
    print_success "Health check passed! Backend is online ✓"
    HEALTH_STATUS="ONLINE"
else
    print_error "Health check failed! Backend may not be responding"
    print_warning "Check Supabase Dashboard → Edge Functions → Logs for errors"
    HEALTH_STATUS="OFFLINE"
fi
echo ""

# List deployed functions
echo "────────────────────────────────────────────────────────────"
print_info "Deployed functions:"
echo ""
supabase functions list
echo ""

# Summary
echo "════════════════════════════════════════════════════════════"
echo ""
echo "  🎉 DEPLOYMENT COMPLETE!"
echo ""
echo "────────────────────────────────────────────────────────────"
echo ""
echo "  Environment:     ${ENV_COLOR}${ENV_NAME}${NC} [${ENV_LABEL}]"
echo "  Project ID:      ${PROJECT_ID}"
echo "  Project URL:     ${SUPABASE_URL}"
echo "  Health Status:   ${HEALTH_STATUS}"
echo "  Function:        make-server-6fcaeea3"
echo ""
echo "────────────────────────────────────────────────────────────"
echo ""
echo "  📋 Next Steps:"
echo ""
echo "  1. Configure in Admin UI:"
echo "     • Go to /admin/environment-config"
echo "     • Edit ${ENV_NAME} environment"
echo "     • Paste credentials"
echo "     • Test connection"
echo ""
echo "  2. Create admin user:"
echo "     • Run: ./scripts/create-admin-user.sh"
echo "     • Or use signup API endpoint"
echo ""
echo "  3. Test the deployment:"
echo "     curl ${HEALTH_URL} \\"
echo "       -H \"Authorization: Bearer [ANON_KEY]\""
echo ""
echo "════════════════════════════════════════════════════════════"
echo ""

# Save deployment info
DEPLOYMENT_LOG="deployments/${ENV}-deployment-$(date +%Y%m%d-%H%M%S).log"
mkdir -p deployments

cat > "$DEPLOYMENT_LOG" << EOF
JALA2 ${ENV_NAME} Deployment
═══════════════════════════════════════════════════

Date: $(date '+%Y-%m-%d %H:%M:%S')
Environment: ${ENV_NAME} [${ENV_LABEL}]
Project ID: ${PROJECT_ID}
Project URL: ${SUPABASE_URL}
Function: make-server-6fcaeea3
Health Status: ${HEALTH_STATUS}

Deployment completed successfully!
EOF

print_success "Deployment log saved to: ${DEPLOYMENT_LOG}"
echo ""

# Prompt for next environment
if [ "$ENV" == "dev" ]; then
    echo ""
    print_info "Ready to deploy Production?"
    echo ""
    echo "Run: ./scripts/deploy-to-environment.sh prod"
    echo ""
fi

print_success "All done! 🚀"
echo ""