#!/bin/bash

# JALA2 Frontend Deployment Script
# Builds frontend for Development or Production
# Usage: ./scripts/deploy-frontend.sh [dev|prod]

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
    print_error "Usage: ./scripts/deploy-frontend.sh [dev|prod]"
    echo ""
    echo "Examples:"
    echo "  ./scripts/deploy-frontend.sh dev   # Build frontend for Development"
    echo "  ./scripts/deploy-frontend.sh prod  # Build frontend for Production"
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
echo "║         JALA2 Frontend Deployment Script                  ║"
echo "║                                                            ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo "  Environment: ${ENV_NAME}"
echo "  Project ID:  ${PROJECT_ID}"
echo "  Timestamp:   $(date '+%Y-%m-%d %H:%M:%S')"
echo ""
echo "────────────────────────────────────────────────────────────"
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

echo ""

# Install dependencies
print_info "Installing dependencies..."
echo ""

if npm ci; then
    print_success "Dependencies installed (from package-lock.json)"
else
    print_warning "npm ci failed, trying npm install..."
    if npm install; then
        print_success "Dependencies installed"
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
    print_success "All tests passed ✓"
else
    print_warning "Some tests failed, but continuing..."
    if [ "$ENV" == "prod" ]; then
        print_error "Tests must pass before deploying to production!"
        read -p "Continue anyway? (y/N): " CONTINUE
        if [ "$CONTINUE" != "y" ] && [ "$CONTINUE" != "Y" ]; then
            exit 1
        fi
    fi
fi

echo ""

# Build frontend
print_info "Building frontend for ${ENV_NAME}..."
echo ""

# Set build environment
if [ "$ENV" == "prod" ]; then
    export NODE_ENV=production
    export VITE_ENV=production
    print_info "Building in PRODUCTION mode"
else
    export NODE_ENV=development
    export VITE_ENV=development
    print_info "Building in DEVELOPMENT mode"
fi

echo ""

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
    
    echo ""
    print_info "Build contents:"
    echo ""
    echo "  Total size: ${DIST_SIZE}"
    echo ""
    echo "  Files:"
    ls -lh dist/ 2>/dev/null | head -10 || echo "    (Unable to list files)"
    
    # Count files
    FILE_COUNT=$(find dist -type f | wc -l | tr -d ' ')
    echo ""
    echo "  Total files: ${FILE_COUNT}"
else
    print_error "Build output directory not found!"
    exit 1
fi

echo ""

# Save deployment log
DEPLOYMENT_LOG="deployments/${ENV}-frontend-$(date +%Y%m%d-%H%M%S).log"
mkdir -p deployments

cat > "$DEPLOYMENT_LOG" << EOF
JALA2 Frontend ${ENV_NAME} Build
═══════════════════════════════════════════════════

Date: $(date '+%Y-%m-%d %H:%M:%S')
Environment: ${ENV_NAME}
Project ID: ${PROJECT_ID}
Build Output: dist/
Build Size: ${DIST_SIZE}
File Count: ${FILE_COUNT}
Node Version: $(node --version)
npm Version: $(npm --version)

Build completed successfully!
EOF

print_success "Build log saved to: ${DEPLOYMENT_LOG}"
echo ""

# Deployment options
echo "────────────────────────────────────────────────────────────"
echo ""
print_info "Frontend build is ready for deployment!"
echo ""
echo "Choose a deployment option:"
echo ""
echo "  1. Vercel"
echo "     npm install -g vercel"
echo "     vercel --prod"
echo ""
echo "  2. Netlify"
echo "     npm install -g netlify-cli"
echo "     netlify deploy --prod --dir=dist"
echo ""
echo "  3. Cloudflare Pages"
echo "     npm install -g wrangler"
echo "     wrangler pages deploy dist"
echo ""
echo "  4. GitHub Pages"
echo "     # Push to GitHub and enable Pages in settings"
echo ""
echo "  5. Firebase Hosting"
echo "     npm install -g firebase-tools"
echo "     firebase deploy --only hosting"
echo ""
echo "  6. AWS S3 + CloudFront"
echo "     aws s3 sync dist/ s3://your-bucket/"
echo ""
echo "  7. Manual Upload"
echo "     # Upload dist/ contents to your web server"
echo ""

echo "────────────────────────────────────────────────────────────"
echo ""

# Quick deploy helpers
echo "Quick deploy commands:"
echo ""
echo "  Vercel:     ./scripts/deploy-to-vercel.sh ${ENV}"
echo "  Netlify:    ./scripts/deploy-to-netlify.sh ${ENV}"
echo "  Manual:     # Upload dist/ to your server"
echo ""

echo "════════════════════════════════════════════════════════════"
print_success "Frontend build complete! 🚀"
echo "════════════════════════════════════════════════════════════"
echo ""