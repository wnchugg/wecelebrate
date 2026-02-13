#!/bin/bash

# ============================================================================
# JALA 2 Automated Deployment Script
# ============================================================================
# This script automates:
# 1. Converting .tsx to .ts files for Deno/Supabase
# 2. Copying files to the right locations
# 3. Updating import/export references
# 4. Deploying to dev and/or production
# ============================================================================

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
DEV_PROJECT_REF="wjfcqqrlhwdvvjmefxky"
PROD_PROJECT_REF="lmffeqwhrnbsbhdztwyv"
SOURCE_DIR="./supabase/functions/server"
TEMP_DIR="./temp-deploy"

# ============================================================================
# Helper Functions
# ============================================================================

print_header() {
    echo ""
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${CYAN}  $1${NC}"
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
}

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

print_step() {
    echo -e "${MAGENTA}▶️  $1${NC}"
}

# ============================================================================
# Pre-flight Checks
# ============================================================================

preflight_checks() {
    print_header "Pre-flight Checks"
    
    # Check if we're in the right directory
    if [ ! -d "supabase/functions/server" ]; then
        print_error "supabase/functions/server directory not found!"
        print_info "Please run this script from the project root directory"
        exit 1
    fi
    print_success "Project directory verified"
    
    # Check if Supabase CLI is installed
    if ! command -v supabase &> /dev/null; then
        print_error "Supabase CLI not found"
        print_info "Install with: npm install -g supabase"
        exit 1
    fi
    print_success "Supabase CLI installed: $(supabase --version)"
    
    # Check if logged in
    if ! supabase projects list &> /dev/null 2>&1; then
        print_warning "Not logged in to Supabase"
        print_info "Logging in..."
        supabase login
    else
        print_success "Supabase authentication verified"
    fi
    
    # Check if Node.js is installed (for frontend build)
    if ! command -v node &> /dev/null; then
        print_warning "Node.js not found - frontend deployment will be skipped"
    else
        print_success "Node.js installed: $(node --version)"
    fi
}

# ============================================================================
# File Conversion Functions
# ============================================================================

convert_tsx_to_ts() {
    local file=$1
    local output_file=$2
    
    print_step "Converting: $(basename $file)"
    
    # Copy the file
    cp "$file" "$output_file"
    
    # Update file extension references in imports
    # Change .tsx imports to .ts
    sed -i.bak 's/from ["'\'']\(.*\)\.tsx["'\'']/from "\1.ts"/g' "$output_file"
    sed -i.bak 's/import ["'\'']\(.*\)\.tsx["'\'']/import "\1.ts"/g' "$output_file"
    
    # Remove .bak files
    rm -f "${output_file}.bak"
    
    print_success "Converted: $(basename $output_file)"
}

prepare_deployment_files() {
    print_header "Preparing Deployment Files"
    
    # Create temp directory
    print_step "Creating temporary deployment directory..."
    rm -rf "$TEMP_DIR"
    mkdir -p "$TEMP_DIR"
    
    # Copy all files from source
    print_step "Copying files from $SOURCE_DIR..."
    
    # List of files to copy and convert
    local files_to_process=(
        "index.tsx"
        "kv_store.tsx"
        "kv_env.tsx"
        "security.tsx"
        "seed.tsx"
        "erp_integration.tsx"
        "erp_scheduler.tsx"
    )
    
    # Process each file
    for file in "${files_to_process[@]}"; do
        if [ -f "$SOURCE_DIR/$file" ]; then
            # Convert .tsx to .ts
            local output_file="$TEMP_DIR/${file%.tsx}.ts"
            convert_tsx_to_ts "$SOURCE_DIR/$file" "$output_file"
        else
            print_warning "File not found: $file (skipping)"
        fi
    done
    
    # Copy any additional files (like .md, .sh, etc.)
    print_step "Copying additional files..."
    find "$SOURCE_DIR" -type f \( -name "*.md" -o -name "*.sh" -o -name "*.json" \) -exec cp {} "$TEMP_DIR/" \;
    
    print_success "Deployment files prepared in $TEMP_DIR"
    
    # Show summary
    echo ""
    print_info "Files ready for deployment:"
    ls -lh "$TEMP_DIR" | grep -v "^total" | awk '{print "  - " $9 " (" $5 ")"}'
    echo ""
}

# ============================================================================
# Backend Deployment Functions
# ============================================================================

deploy_backend() {
    local environment=$1
    local project_ref=$2
    
    print_header "Deploying Backend to $environment"
    
    # Confirm deployment
    if [ "$environment" == "Production" ]; then
        print_warning "You are about to deploy to PRODUCTION!"
        read -p "Are you sure? (yes/no): " confirm
        
        if [ "$confirm" != "yes" ]; then
            print_info "Production deployment cancelled"
            return 0
        fi
    fi
    
    # Link to project
    print_step "Linking to $environment project: $project_ref"
    supabase link --project-ref "$project_ref"
    
    # Create deployment directory structure
    print_step "Preparing deployment structure..."
    local deploy_dir="./supabase/functions/server-deploy-temp"
    rm -rf "$deploy_dir"
    mkdir -p "$deploy_dir"
    
    # Copy converted files
    cp -r "$TEMP_DIR"/* "$deploy_dir/"
    
    # Deploy the function
    print_step "Deploying edge function to $environment..."
    supabase functions deploy server --project-ref "$project_ref"
    
    # Cleanup
    rm -rf "$deploy_dir"
    
    print_success "Backend deployed to $environment!"
    
    # Test health endpoint
    local base_url="https://${project_ref}.supabase.co/functions/v1/make-server-6fcaeea3"
    print_step "Testing health endpoint..."
    
    sleep 2  # Give it a moment to be ready
    
    if curl -s -f "${base_url}/health" > /dev/null 2>&1; then
        print_success "$environment health check PASSED ✓"
        echo ""
        print_info "Endpoint: ${base_url}/health"
        curl -s "${base_url}/health" | jq '.' || curl -s "${base_url}/health"
        echo ""
    else
        print_warning "$environment health check FAILED"
        print_info "Check logs with: supabase functions logs server --project-ref $project_ref"
    fi
}

# ============================================================================
# Frontend Deployment Functions
# ============================================================================

build_frontend() {
    print_header "Building Frontend"
    
    if [ ! -f "package.json" ]; then
        print_error "package.json not found - cannot build frontend"
        return 1
    fi
    
    print_step "Installing dependencies..."
    npm install --silent
    
    print_step "Building production bundle..."
    npm run build
    
    if [ -d "dist" ]; then
        print_success "Frontend build complete!"
        
        # Show build stats
        local size=$(du -sh dist | awk '{print $1}')
        local files=$(find dist -type f | wc -l)
        print_info "Build size: $size"
        print_info "Total files: $files"
    else
        print_error "Build failed - dist/ folder not created"
        return 1
    fi
}

deploy_frontend_netlify() {
    print_header "Deploying Frontend to Netlify"
    
    if ! command -v netlify &> /dev/null; then
        print_error "Netlify CLI not found"
        print_info "Install with: npm install -g netlify-cli"
        print_info "Then run: netlify login"
        return 1
    fi
    
    if [ ! -d "dist" ]; then
        print_error "dist/ folder not found - build frontend first"
        return 1
    fi
    
    print_step "Deploying to Netlify..."
    netlify deploy --prod --dir=dist
    
    print_success "Frontend deployed to Netlify!"
}

deploy_frontend_vercel() {
    print_header "Deploying Frontend to Vercel"
    
    if ! command -v vercel &> /dev/null; then
        print_error "Vercel CLI not found"
        print_info "Install with: npm install -g vercel"
        print_info "Then run: vercel login"
        return 1
    fi
    
    print_step "Deploying to Vercel..."
    vercel --prod
    
    print_success "Frontend deployed to Vercel!"
}

# ============================================================================
# Environment Variable Helper
# ============================================================================

show_env_vars_instructions() {
    print_header "Environment Variables Setup"
    
    echo "You need to set these environment variables in Supabase Dashboard:"
    echo ""
    echo -e "${YELLOW}For Development ($DEV_PROJECT_REF):${NC}"
    echo "Go to: https://supabase.com/dashboard/project/$DEV_PROJECT_REF/settings/functions"
    echo ""
    echo "Add these secrets:"
    echo "  SUPABASE_URL=https://$DEV_PROJECT_REF.supabase.co"
    echo "  SUPABASE_ANON_KEY=[Get from Settings → API]"
    echo "  SUPABASE_SERVICE_ROLE_KEY=[Get from Settings → API]"
    echo "  SUPABASE_DB_URL=[Get from Settings → Database]"
    echo "  SUPABASE_SERVICE_ROLE_KEY_PROD=[Production service role key]"
    echo "  ALLOWED_ORIGINS=*"
    echo "  SEED_ON_STARTUP=false"
    echo ""
    echo -e "${YELLOW}For Production ($PROD_PROJECT_REF):${NC}"
    echo "Go to: https://supabase.com/dashboard/project/$PROD_PROJECT_REF/settings/functions"
    echo ""
    echo "Add these secrets:"
    echo "  SUPABASE_URL=https://$PROD_PROJECT_REF.supabase.co"
    echo "  SUPABASE_ANON_KEY=[Get from Settings → API]"
    echo "  SUPABASE_SERVICE_ROLE_KEY=[Get from Settings → API]"
    echo "  SUPABASE_DB_URL=[Get from Settings → Database]"
    echo "  SUPABASE_SERVICE_ROLE_KEY_DEV=[Development service role key]"
    echo "  ALLOWED_ORIGINS=https://yourdomain.com"
    echo "  SEED_ON_STARTUP=false"
    echo ""
    
    read -p "Press Enter when you've set all environment variables..."
}

# ============================================================================
# Cleanup Function
# ============================================================================

cleanup() {
    print_step "Cleaning up temporary files..."
    rm -rf "$TEMP_DIR"
    print_success "Cleanup complete"
}

# ============================================================================
# Main Menu
# ============================================================================

show_main_menu() {
    clear
    
    cat << "EOF"
     _    _    _        _      ____  
    | |  / \  | |      / \    |___ \ 
 _  | | / _ \ | |     / _ \     __) |
| |_| |/ ___ \| |___ / ___ \   / __/ 
 \___//_/   \_\_____/_/   \_\ |_____|
                                      
   Quick Deployment Automation
         Version 2.0
EOF
    
    echo ""
    print_info "This script automates the entire deployment process!"
    echo ""
    
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "  1) 🚀 FULL DEPLOYMENT (Everything)"
    echo "     - Prepare files"
    echo "     - Deploy backend to Dev & Prod"
    echo "     - Build & deploy frontend"
    echo ""
    echo "  2) 🔧 Backend Only (Dev + Prod)"
    echo "     - Prepare files"
    echo "     - Deploy to both environments"
    echo ""
    echo "  3) 🔧 Backend to Development Only"
    echo "  4) 🔧 Backend to Production Only"
    echo ""
    echo "  5) 🎨 Frontend Only"
    echo "     - Build production bundle"
    echo "     - Deploy to hosting"
    echo ""
    echo "  6) 📝 Show Environment Variables Instructions"
    echo "  7) 🧪 Test Deployed Endpoints"
    echo "  8) 📊 View Logs"
    echo ""
    echo "  9) 🧹 Cleanup Temp Files"
    echo "  0) ❌ Exit"
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    
    read -p "Select option: " choice
    
    case $choice in
        1)  # FULL DEPLOYMENT
            preflight_checks
            prepare_deployment_files
            show_env_vars_instructions
            deploy_backend "Development" "$DEV_PROJECT_REF"
            deploy_backend "Production" "$PROD_PROJECT_REF"
            build_frontend
            
            echo ""
            echo "Select frontend deployment platform:"
            echo "  1) Netlify"
            echo "  2) Vercel"
            echo "  3) Skip frontend deployment"
            read -p "Choice: " platform_choice
            
            case $platform_choice in
                1) deploy_frontend_netlify ;;
                2) deploy_frontend_vercel ;;
                3) print_info "Skipping frontend deployment" ;;
                *) print_error "Invalid choice" ;;
            esac
            
            cleanup
            
            print_header "🎉 Full Deployment Complete!"
            print_success "Backend deployed to Dev and Prod"
            print_success "Frontend built and deployed"
            print_info "Test your application and verify everything works!"
            ;;
            
        2)  # Backend Only (Both)
            preflight_checks
            prepare_deployment_files
            show_env_vars_instructions
            deploy_backend "Development" "$DEV_PROJECT_REF"
            deploy_backend "Production" "$PROD_PROJECT_REF"
            cleanup
            
            print_header "✅ Backend Deployment Complete!"
            ;;
            
        3)  # Backend Dev Only
            preflight_checks
            prepare_deployment_files
            deploy_backend "Development" "$DEV_PROJECT_REF"
            cleanup
            ;;
            
        4)  # Backend Prod Only
            preflight_checks
            prepare_deployment_files
            show_env_vars_instructions
            deploy_backend "Production" "$PROD_PROJECT_REF"
            cleanup
            ;;
            
        5)  # Frontend Only
            build_frontend
            
            echo ""
            echo "Select frontend deployment platform:"
            echo "  1) Netlify"
            echo "  2) Vercel"
            echo "  3) Manual (just build)"
            read -p "Choice: " platform_choice
            
            case $platform_choice in
                1) deploy_frontend_netlify ;;
                2) deploy_frontend_vercel ;;
                3) print_info "Frontend built in dist/ - deploy manually" ;;
                *) print_error "Invalid choice" ;;
            esac
            ;;
            
        6)  # Show env vars
            show_env_vars_instructions
            ;;
            
        7)  # Test endpoints
            print_header "Testing Endpoints"
            
            echo ""
            echo "Development Environment:"
            echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
            echo ""
            curl -s "https://${DEV_PROJECT_REF}.supabase.co/functions/v1/make-server-6fcaeea3/health" | jq '.' 2>/dev/null || \
            curl -s "https://${DEV_PROJECT_REF}.supabase.co/functions/v1/make-server-6fcaeea3/health"
            
            echo ""
            echo ""
            echo "Production Environment:"
            echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
            echo ""
            curl -s "https://${PROD_PROJECT_REF}.supabase.co/functions/v1/make-server-6fcaeea3/health" | jq '.' 2>/dev/null || \
            curl -s "https://${PROD_PROJECT_REF}.supabase.co/functions/v1/make-server-6fcaeea3/health"
            echo ""
            ;;
            
        8)  # View logs
            echo ""
            echo "1) Development logs"
            echo "2) Production logs"
            read -p "Select environment (1/2): " env_choice
            
            if [ "$env_choice" == "1" ]; then
                print_info "Viewing development logs (Ctrl+C to exit)..."
                supabase functions logs server --project-ref "$DEV_PROJECT_REF"
            elif [ "$env_choice" == "2" ]; then
                print_info "Viewing production logs (Ctrl+C to exit)..."
                supabase functions logs server --project-ref "$PROD_PROJECT_REF"
            else
                print_error "Invalid choice"
            fi
            ;;
            
        9)  # Cleanup
            cleanup
            ;;
            
        0)  # Exit
            cleanup
            print_info "Goodbye! 👋"
            exit 0
            ;;
            
        *)
            print_error "Invalid option"
            ;;
    esac
    
    echo ""
    read -p "Press Enter to continue..."
    show_main_menu
}

# ============================================================================
# Script Entry Point
# ============================================================================

# Trap cleanup on exit
trap cleanup EXIT

# Start the menu
show_main_menu
