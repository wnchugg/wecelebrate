#!/bin/bash

# ============================================================================
# JALA 2 Quick Deploy - Streamlined Deployment Script
# ============================================================================
# One command to deploy everything!
# Handles .tsx to .ts conversion automatically
# ============================================================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# Configuration
DEV_PROJECT="wjfcqqrlhwdvvjmefxky"
PROD_PROJECT="lmffeqwhrnbsbhdztwyv"
TEMP_DEPLOY_DIR="./.deploy-temp"

# Print helpers
info() { echo -e "${BLUE}ℹ️  $1${NC}"; }
success() { echo -e "${GREEN}✅ $1${NC}"; }
warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }
error() { echo -e "${RED}❌ $1${NC}"; exit 1; }
header() { echo -e "\n${CYAN}━━━ $1 ━━━${NC}\n"; }
step() { echo -e "${CYAN}▶️  $1${NC}"; }

# ============================================================================
# File Conversion Function
# ============================================================================

prepare_deployment_files() {
    header "Preparing Backend Files for Deployment"
    
    # Remove old temp directory if exists
    if [ -d "$TEMP_DEPLOY_DIR" ]; then
        step "Cleaning old deployment files..."
        rm -rf "$TEMP_DEPLOY_DIR"
    fi
    
    # Create temp directory structure
    step "Creating deployment directory..."
    mkdir -p "$TEMP_DEPLOY_DIR/supabase/functions/server"
    
    # Check if source files exist
    if [ ! -d "./supabase/functions/server" ]; then
        error "supabase/functions/server directory not found!"
    fi
    
    step "Converting .tsx files to .ts..."
    
    # List of files to convert
    local files=(
        "index.tsx"
        "kv_store.tsx"
        "kv_env.tsx"
        "security.tsx"
        "seed.tsx"
        "erp_integration.tsx"
        "erp_scheduler.tsx"
    )
    
    local converted_count=0
    
    for file in "${files[@]}"; do
        local source="./supabase/functions/server/$file"
        local target="$TEMP_DEPLOY_DIR/supabase/functions/server/${file%.tsx}.ts"
        
        if [ -f "$source" ]; then
            # Copy and convert
            cp "$source" "$target"
            
            # Update import references from .tsx to .ts
            if [[ "$OSTYPE" == "darwin"* ]]; then
                # macOS
                sed -i '' 's/from ["'\'']\(.*\)\.tsx["'\'']/from "\1.ts"/g' "$target"
                sed -i '' 's/import ["'\'']\(.*\)\.tsx["'\'']/import "\1.ts"/g' "$target"
            else
                # Linux
                sed -i 's/from ["'\'']\(.*\)\.tsx["'\'']/from "\1.ts"/g' "$target"
                sed -i 's/import ["'\'']\(.*\)\.tsx["'\'']/import "\1.ts"/g' "$target"
            fi
            
            info "Converted: $file → ${file%.tsx}.ts"
            ((converted_count++))
        else
            warning "File not found: $file (skipping)"
        fi
    done
    
    # Copy any additional files (.md, .sh, .json, etc.)
    step "Copying additional files..."
    find "./supabase/functions/server" -type f \( -name "*.md" -o -name "*.sh" -o -name "*.json" \) 2>/dev/null | while read file; do
        local filename=$(basename "$file")
        cp "$file" "$TEMP_DEPLOY_DIR/supabase/functions/server/" 2>/dev/null || true
        info "Copied: $filename"
    done
    
    success "Prepared $converted_count files for deployment"
    
    # Show what's ready
    echo ""
    info "Files ready in deployment directory:"
    ls -lh "$TEMP_DEPLOY_DIR/supabase/functions/server/" | grep -v "^total" | awk '{print "  📄 " $9}' || true
    echo ""
}

# ============================================================================
# Cleanup Function
# ============================================================================

cleanup_deployment_files() {
    if [ -d "$TEMP_DEPLOY_DIR" ]; then
        step "Cleaning up temporary files..."
        rm -rf "$TEMP_DEPLOY_DIR"
        success "Cleanup complete"
    fi
}

# Trap cleanup on exit
trap cleanup_deployment_files EXIT

# ============================================================================
# Quick Deploy Function
# ============================================================================

quick_deploy() {
    clear
    cat << "EOF"
     _    _    _        _      ____  
    | |  / \  | |      / \    |___ \ 
 _  | | / _ \ | |     / _ \     __) |
| |_| |/ ___ \| |___ / ___ \   / __/ 
 \___//_/   \_\_____/_/   \_\ |_____|
                                      
        Quick Deploy Script
EOF
    
    echo ""
    info "This will deploy your JALA 2 application to production!"
    echo ""
    
    # Ask what to deploy
    echo "What would you like to deploy?"
    echo ""
    echo "  1) 🚀 Everything (Backend + Frontend)"
    echo "  2) 🔧 Backend Only (Dev + Prod)"
    echo "  3) 🎨 Frontend Only"
    echo "  4) ❌ Cancel"
    echo ""
    read -p "Choice (1-4): " deploy_choice
    
    case $deploy_choice in
        1)
            prepare_deployment_files
            deploy_backend_both
            deploy_frontend_quick
            ;;
        2)
            prepare_deployment_files
            deploy_backend_both
            ;;
        3)
            deploy_frontend_quick
            ;;
        4)
            info "Deployment cancelled"
            exit 0
            ;;
        *)
            error "Invalid choice"
            ;;
    esac
}

# ============================================================================
# Backend Deployment
# ============================================================================

deploy_backend_both() {
    header "Backend Deployment"
    
    # Check if Supabase CLI is installed
    if ! command -v supabase &> /dev/null; then
        error "Supabase CLI not found. Install with: npm install -g supabase"
    fi
    
    # Check if logged in
    info "Checking Supabase login..."
    if ! supabase projects list &> /dev/null 2>&1; then
        warning "Not logged in. Logging in..."
        supabase login
    fi
    success "Logged in to Supabase"
    
    # Save current directory
    local original_dir=$(pwd)
    
    # Change to temp deployment directory
    cd "$TEMP_DEPLOY_DIR"
    
    # Deploy to Development
    info "Deploying to Development..."
    supabase link --project-ref $DEV_PROJECT
    supabase functions deploy server --project-ref $DEV_PROJECT
    success "Development deployment complete!"
    
    # Test dev (with auth header)
    info "Testing development endpoint..."
    sleep 3
    
    # Get anon key from Supabase CLI
    DEV_ANON_KEY=$(supabase projects api-keys --project-ref $DEV_PROJECT 2>/dev/null | grep "anon key" | awk '{print $NF}' || echo "")
    
    if [ -n "$DEV_ANON_KEY" ]; then
        if curl -s -f -H "Authorization: Bearer $DEV_ANON_KEY" "https://${DEV_PROJECT}.supabase.co/functions/v1/make-server-6fcaeea3/health" > /dev/null 2>&1; then
            success "Development health check PASSED ✓"
        else
            warning "Development health check failed - check logs at:"
            info "https://supabase.com/dashboard/project/$DEV_PROJECT/logs/edge-functions"
        fi
    else
        warning "Could not retrieve anon key for testing"
        info "Test manually: https://${DEV_PROJECT}.supabase.co/functions/v1/make-server-6fcaeea3/health"
    fi
    
    echo ""
    
    # Ask about production
    warning "Deploy to PRODUCTION?"
    read -p "Type 'yes' to confirm: " confirm
    
    if [ "$confirm" != "yes" ]; then
        info "Production deployment skipped"
        cd "$original_dir"
        return 0
    fi
    
    # Deploy to Production
    info "Deploying to Production..."
    supabase link --project-ref $PROD_PROJECT
    supabase functions deploy server --project-ref $PROD_PROJECT
    success "Production deployment complete!"
    
    # Test prod (with auth header)
    info "Testing production endpoint..."
    sleep 3
    
    # Get anon key from Supabase CLI
    PROD_ANON_KEY=$(supabase projects api-keys --project-ref $PROD_PROJECT 2>/dev/null | grep "anon key" | awk '{print $NF}' || echo "")
    
    if [ -n "$PROD_ANON_KEY" ]; then
        if curl -s -f -H "Authorization: Bearer $PROD_ANON_KEY" "https://${PROD_PROJECT}.supabase.co/functions/v1/make-server-6fcaeea3/health" > /dev/null 2>&1; then
            success "Production health check PASSED ✓"
        else
            warning "Production health check failed - check logs at:"
            info "https://supabase.com/dashboard/project/$PROD_PROJECT/logs/edge-functions"
        fi
    else
        warning "Could not retrieve anon key for testing"
        info "Test manually: https://${PROD_PROJECT}.supabase.co/functions/v1/make-server-6fcaeea3/health"
    fi
    
    # Return to original directory
    cd "$original_dir"
    
    echo ""
    header "✅ Backend Deployment Complete!"
    echo ""
    info "Development: https://${DEV_PROJECT}.supabase.co/functions/v1/make-server-6fcaeea3"
    info "Production:  https://${PROD_PROJECT}.supabase.co/functions/v1/make-server-6fcaeea3"
    echo ""
    info "Manual Health Check Commands:"
    echo ""
    if [ -n "$DEV_ANON_KEY" ]; then
        echo "# Development:"
        echo "curl -H \"Authorization: Bearer $DEV_ANON_KEY\" \\"
        echo "  https://${DEV_PROJECT}.supabase.co/functions/v1/make-server-6fcaeea3/health"
        echo ""
    fi
    if [ -n "$PROD_ANON_KEY" ]; then
        echo "# Production:"
        echo "curl -H \"Authorization: Bearer $PROD_ANON_KEY\" \\"
        echo "  https://${PROD_PROJECT}.supabase.co/functions/v1/make-server-6fcaeea3/health"
        echo ""
    fi
}

# ============================================================================
# Frontend Deployment
# ============================================================================

deploy_frontend_quick() {
    header "Frontend Deployment"
    
    # Check if package.json exists
    if [ ! -f "package.json" ]; then
        error "package.json not found - are you in the right directory?"
    fi
    
    # Install dependencies
    info "Installing dependencies..."
    npm install --silent || npm install
    
    # Build
    info "Building production bundle..."
    npm run build
    
    if [ ! -d "dist" ]; then
        error "Build failed - dist/ folder not created"
    fi
    
    success "Frontend built successfully!"
    
    # Show build stats
    local size=$(du -sh dist 2>/dev/null | awk '{print $1}' || echo "unknown")
    info "Build size: $size"
    
    echo ""
    echo "How would you like to deploy the frontend?"
    echo ""
    echo "  1) 🌐 Netlify (CLI)"
    echo "  2) 🌐 Vercel (CLI)"
    echo "  3) 📦 Manual (just show me the folder)"
    echo "  4) ⏭️  Skip frontend deployment"
    echo ""
    read -p "Choice (1-4): " frontend_choice
    
    case $frontend_choice in
        1)
            if ! command -v netlify &> /dev/null; then
                warning "Netlify CLI not found"
                info "Install with: npm install -g netlify-cli"
                info "Then run: netlify login"
                info "Then deploy with: netlify deploy --prod --dir=dist"
            else
                info "Deploying to Netlify..."
                netlify deploy --prod --dir=dist
                success "Deployed to Netlify!"
            fi
            ;;
        2)
            if ! command -v vercel &> /dev/null; then
                warning "Vercel CLI not found"
                info "Install with: npm install -g vercel"
                info "Then run: vercel login"
                info "Then deploy with: vercel --prod"
            else
                info "Deploying to Vercel..."
                vercel --prod
                success "Deployed to Vercel!"
            fi
            ;;
        3)
            info "Frontend built and ready!"
            info "Upload the 'dist/' folder to your hosting provider"
            info "Or use Netlify Drop: https://app.netlify.com/drop"
            ;;
        4)
            info "Frontend deployment skipped"
            ;;
        *)
            error "Invalid choice"
            ;;
    esac
    
    echo ""
    header "✅ Frontend Deployment Complete!"
}

# ============================================================================
# Main Entry Point
# ============================================================================

quick_deploy