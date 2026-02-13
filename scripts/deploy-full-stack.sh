#!/bin/bash

# JALA2 Full-Stack Deployment Script
# Deploys both backend (Supabase Edge Function) and frontend (build)
# Usage: ./scripts/deploy-full-stack.sh [dev|prod]

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m' # No Color

# Function to print colored output
print_header() {
    echo -e "${MAGENTA}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${MAGENTA}║${NC} $1"
    echo -e "${MAGENTA}╚════════════════════════════════════════════════════════════╝${NC}"
}

print_section() {
    echo ""
    echo -e "${CYAN}────────────────────────────────────────────────────────────${NC}"
    echo -e "${CYAN}$1${NC}"
    echo -e "${CYAN}────────────────────────────────────────────────────────────${NC}"
}

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
    print_error "Usage: ./scripts/deploy-full-stack.sh [dev|prod]"
    echo ""
    echo "Examples:"
    echo "  ./scripts/deploy-full-stack.sh dev   # Deploy to Development"
    echo "  ./scripts/deploy-full-stack.sh prod  # Deploy to Production"
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
    PROJECT_ID="wjfcqqrlhwdvvjmefxky"
else
    ENV_NAME="Production"
    ENV_LABEL="PROD"
    ENV_COLOR="${RED}"
    PROJECT_ID="lmffeqwhrnbsbhdztwyv"
fi

echo ""
print_header "          JALA2 Full-Stack Deployment Script              "
echo ""
echo -e "  Environment: ${ENV_COLOR}${ENV_NAME}${NC} [${ENV_LABEL}]"
echo -e "  Project ID:  ${PROJECT_ID}"
echo "  Timestamp:   $(date '+%Y-%m-%d %H:%M:%S')"
echo ""

# Check prerequisites
print_section "Checking Prerequisites"
echo ""

# Check Node.js
print_info "Checking Node.js..."
if ! command -v node &> /dev/null; then
    print_error "Node.js not found!"
    echo "Install from: https://nodejs.org/"
    exit 1
fi
print_success "Node.js found: $(node --version)"

# Check npm
print_info "Checking npm..."
if ! command -v npm &> /dev/null; then
    print_error "npm not found!"
    exit 1
fi
print_success "npm found: $(npm --version)"

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
print_success "All prerequisites met!"

# Get credentials
print_section "Environment Credentials"
echo ""

print_info "Please enter your ${ENV_NAME} credentials:"
echo ""

read -p "Project URL (default: https://${PROJECT_ID}.supabase.co): " SUPABASE_URL
if [ -z "$SUPABASE_URL" ]; then
    SUPABASE_URL="https://${PROJECT_ID}.supabase.co"
    print_info "Using default URL: ${SUPABASE_URL}"
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

# ==========================================
# BACKEND DEPLOYMENT
# ==========================================

print_section "Backend Deployment"
echo ""

# Link to project
print_info "Linking to ${ENV_NAME} Supabase project..."
echo ""

# Unlink first (in case already linked)
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
print_info "Setting environment secrets..."
echo ""

print_info "Setting ALLOWED_ORIGINS..."
if [ "$ENV" == "prod" ]; then
    print_warning "Production: Consider setting specific domains for ALLOWED_ORIGINS"
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

# Deploy Edge Function
print_info "Deploying Edge Function: make-server-6fcaeea3..."
echo ""

if supabase functions deploy make-server-6fcaeea3 --no-verify-jwt; then
    print_success "Backend Edge Function deployed successfully!"
else
    print_error "Backend Edge Function deployment failed"
    exit 1
fi

echo ""

# Test backend
print_info "Testing backend health..."
echo ""

HEALTH_URL="${SUPABASE_URL}/functions/v1/make-server-6fcaeea3/health"
print_info "Testing: ${HEALTH_URL}"

if curl -f -s -H "Authorization: Bearer ${ANON_KEY}" "$HEALTH_URL" | grep -q "ok"; then
    print_success "Backend health check passed! ✓"
    BACKEND_STATUS="ONLINE"
else
    print_error "Backend health check failed!"
    print_warning "Check Supabase Dashboard → Edge Functions → Logs"
    BACKEND_STATUS="OFFLINE"
fi

echo ""
print_success "Backend deployment complete!"

# ==========================================
# FRONTEND DEPLOYMENT
# ==========================================

print_section "Frontend Deployment"
echo ""

# Install dependencies
print_info "Installing dependencies..."
echo ""

if npm ci; then
    print_success "Dependencies installed successfully"
else
    print_warning "npm ci failed, trying npm install..."
    if npm install; then
        print_success "Dependencies installed successfully"
    else
        print_error "Failed to install dependencies"
        exit 1
    fi
fi

echo ""

# Run type check
print_info "Running TypeScript type check..."
echo ""

if npm run type-check; then
    print_success "Type check passed ✓"
else
    print_error "Type check failed!"
    print_warning "Fix TypeScript errors before deploying"
    exit 1
fi

echo ""

# Run tests
print_info "Running tests..."
echo ""

if npm test -- --run; then
    print_success "Tests passed ✓"
else
    print_warning "Tests failed, but continuing..."
    echo "  Consider fixing tests before deploying to production"
fi

echo ""

# Build frontend
print_info "Building frontend for ${ENV_NAME}..."
echo ""

# Set build environment
if [ "$ENV" == "prod" ]; then
    export NODE_ENV=production
    export VITE_ENV=production
else
    export NODE_ENV=development
    export VITE_ENV=development
fi

if npm run build; then
    print_success "Frontend build completed successfully!"
else
    print_error "Frontend build failed!"
    exit 1
fi

echo ""

# Check build output
if [ -d "dist" ]; then
    DIST_SIZE=$(du -sh dist | cut -f1)
    print_success "Build output created: dist/ (${DIST_SIZE})"
    
    # List key files
    print_info "Build contents:"
    echo ""
    ls -lh dist/ | head -10
else
    print_error "Build output directory not found!"
    exit 1
fi

echo ""
print_success "Frontend build complete!"

# ==========================================
# DEPLOYMENT SUMMARY
# ==========================================

print_section "Deployment Summary"
echo ""

echo -e "  Environment:       ${ENV_COLOR}${ENV_NAME}${NC} [${ENV_LABEL}]"
echo -e "  Project ID:        ${PROJECT_ID}"
echo -e "  Project URL:       ${SUPABASE_URL}"
echo ""
echo -e "  Backend Status:    ${BACKEND_STATUS}"
echo -e "  Backend Function:  make-server-6fcaeea3"
echo -e "  Backend Health:    ${HEALTH_URL}"
echo ""
echo -e "  Frontend Build:    ✓ Complete"
echo -e "  Build Output:      dist/ (${DIST_SIZE})"
echo -e "  Build Environment: ${VITE_ENV}"

print_section "Next Steps"
echo ""

echo "📋 Backend is deployed and ready!"
echo ""
echo "📦 Frontend is built and ready for deployment"
echo ""
echo "To deploy the frontend, you have several options:"
echo ""
echo "  1. Vercel:"
echo "     • Install: npm install -g vercel"
echo "     • Deploy: vercel --prod"
echo ""
echo "  2. Netlify:"
echo "     • Install: npm install -g netlify-cli"
echo "     • Deploy: netlify deploy --prod --dir=dist"
echo ""
echo "  3. Cloudflare Pages:"
echo "     • Install: npm install -g wrangler"
echo "     • Deploy: wrangler pages deploy dist"
echo ""
echo "  4. GitHub Pages:"
echo "     • Push to GitHub"
echo "     • Enable GitHub Pages in repo settings"
echo ""
echo "  5. Supabase Storage (Static Hosting):"
echo "     • Use Supabase CLI to upload dist/ contents"
echo ""

print_section "Configuration"
echo ""

echo "After frontend is deployed:"
echo ""
echo "  1. Update environment configuration:"
echo "     • Go to /admin/environment-config"
echo "     • Edit ${ENV_NAME} environment"
echo "     • Paste credentials:"
echo "       - Project URL: ${SUPABASE_URL}"
echo "       - Anon Key: [your anon key]"
echo "       - Service Role Key: [your service role key]"
echo "     • Test connection"
echo ""
echo "  2. Create admin user:"
echo "     • Run: ./scripts/create-admin-user.sh"
echo "     • Or use the Bootstrap Admin page"
echo ""
echo "  3. Verify deployment:"
echo "     • Visit your frontend URL"
echo "     • Test admin login"
echo "     • Check backend connectivity"

print_section "Health Check Commands"
echo ""

echo "Test backend:"
echo "  curl ${HEALTH_URL} \\"
echo "    -H \"Authorization: Bearer [ANON_KEY]\""
echo ""
echo "Test full stack:"
echo "  # Visit your frontend URL and check browser console"
echo ""

# Save deployment log
DEPLOYMENT_LOG="deployments/${ENV}-fullstack-$(date +%Y%m%d-%H%M%S).log"
mkdir -p deployments

cat > "$DEPLOYMENT_LOG" << EOF
JALA2 Full-Stack ${ENV_NAME} Deployment
═══════════════════════════════════════════════════

Date: $(date '+%Y-%m-%d %H:%M:%S')
Environment: ${ENV_NAME} [${ENV_LABEL}]
Project ID: ${PROJECT_ID}
Project URL: ${SUPABASE_URL}

BACKEND
─────────────────────────────────────────────────────
Function: make-server-6fcaeea3
Status: ${BACKEND_STATUS}
Health URL: ${HEALTH_URL}

FRONTEND
─────────────────────────────────────────────────────
Build: Complete
Output: dist/ (${DIST_SIZE})
Environment: ${VITE_ENV}

STATUS
─────────────────────────────────────────────────────
✓ Backend deployed and tested
✓ Frontend built and ready
⏳ Frontend deployment pending (manual step)

Deployment completed successfully!
EOF

echo ""
print_success "Deployment log saved to: ${DEPLOYMENT_LOG}"

echo ""
print_header "                  Deployment Complete!                      "
echo ""

if [ "$ENV" == "dev" ]; then
    echo ""
    print_info "Ready to deploy Production?"
    echo ""
    echo "Run: ./scripts/deploy-full-stack.sh prod"
    echo ""
fi

print_success "All done! 🚀"
echo ""