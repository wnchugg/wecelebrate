#!/bin/bash

# JALA 2 Deployment Script
# Automates backend and frontend deployment

set -e  # Exit on any error

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

print_header() {
    echo ""
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}  $1${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
}

# Project configuration
DEV_PROJECT_REF="wjfcqqrlhwdvvjmefxky"
PROD_PROJECT_REF="lmffeqwhrnbsbhdztwyv"

# Check if Supabase CLI is installed
check_supabase_cli() {
    print_header "Checking Prerequisites"
    
    if ! command -v supabase &> /dev/null; then
        print_error "Supabase CLI not found"
        print_info "Install with: npm install -g supabase"
        exit 1
    fi
    
    print_success "Supabase CLI installed: $(supabase --version)"
}

# Check if user is logged in
check_login() {
    print_info "Checking Supabase login status..."
    
    # Try to list projects - this will fail if not logged in
    if ! supabase projects list &> /dev/null; then
        print_warning "Not logged in to Supabase"
        print_info "Logging in..."
        supabase login
    else
        print_success "Already logged in to Supabase"
    fi
}

# Deploy backend to development
deploy_backend_dev() {
    print_header "Deploying Backend to Development"
    
    print_info "Linking to development project: $DEV_PROJECT_REF"
    supabase link --project-ref $DEV_PROJECT_REF
    
    print_info "Deploying edge function to development..."
    supabase functions deploy server --project-ref $DEV_PROJECT_REF
    
    print_success "Backend deployed to development!"
    
    # Test health endpoint
    print_info "Testing development health endpoint..."
    DEV_URL="https://${DEV_PROJECT_REF}.supabase.co/functions/v1/make-server-6fcaeea3/health"
    
    if curl -s "$DEV_URL" | grep -q "healthy"; then
        print_success "Development health check passed!"
    else
        print_warning "Development health check failed. Check logs with:"
        echo "  supabase functions logs server --project-ref $DEV_PROJECT_REF"
    fi
}

# Deploy backend to production
deploy_backend_prod() {
    print_header "Deploying Backend to Production"
    
    print_warning "You are about to deploy to PRODUCTION"
    read -p "Are you sure? (yes/no): " confirm
    
    if [ "$confirm" != "yes" ]; then
        print_info "Production deployment cancelled"
        return 0
    fi
    
    print_info "Linking to production project: $PROD_PROJECT_REF"
    supabase link --project-ref $PROD_PROJECT_REF
    
    print_info "Deploying edge function to production..."
    supabase functions deploy server --project-ref $PROD_PROJECT_REF
    
    print_success "Backend deployed to production!"
    
    # Test health endpoint
    print_info "Testing production health endpoint..."
    PROD_URL="https://${PROD_PROJECT_REF}.supabase.co/functions/v1/make-server-6fcaeea3/health"
    
    if curl -s "$PROD_URL" | grep -q "healthy"; then
        print_success "Production health check passed!"
    else
        print_warning "Production health check failed. Check logs with:"
        echo "  supabase functions logs server --project-ref $PROD_PROJECT_REF"
    fi
}

# Build frontend
build_frontend() {
    print_header "Building Frontend"
    
    print_info "Installing dependencies..."
    npm install
    
    print_info "Building production bundle..."
    npm run build
    
    if [ -d "dist" ]; then
        print_success "Frontend build successful! Output in dist/"
    else
        print_error "Frontend build failed - dist/ folder not found"
        exit 1
    fi
}

# Deploy frontend to Netlify
deploy_frontend_netlify() {
    print_header "Deploying Frontend to Netlify"
    
    if ! command -v netlify &> /dev/null; then
        print_warning "Netlify CLI not found"
        print_info "Install with: npm install -g netlify-cli"
        print_info "Then run: netlify login"
        return 1
    fi
    
    print_info "Deploying to Netlify..."
    netlify deploy --prod --dir=dist
    
    print_success "Frontend deployed to Netlify!"
}

# Deploy frontend to Vercel
deploy_frontend_vercel() {
    print_header "Deploying Frontend to Vercel"
    
    if ! command -v vercel &> /dev/null; then
        print_warning "Vercel CLI not found"
        print_info "Install with: npm install -g vercel"
        print_info "Then run: vercel login"
        return 1
    fi
    
    print_info "Deploying to Vercel..."
    vercel --prod
    
    print_success "Frontend deployed to Vercel!"
}

# View logs
view_logs() {
    print_header "Viewing Backend Logs"
    
    echo "1) Development logs"
    echo "2) Production logs"
    read -p "Select environment (1/2): " env_choice
    
    if [ "$env_choice" == "1" ]; then
        print_info "Viewing development logs (Ctrl+C to exit)..."
        supabase functions logs server --project-ref $DEV_PROJECT_REF
    elif [ "$env_choice" == "2" ]; then
        print_info "Viewing production logs (Ctrl+C to exit)..."
        supabase functions logs server --project-ref $PROD_PROJECT_REF
    else
        print_error "Invalid choice"
    fi
}

# Test endpoints
test_endpoints() {
    print_header "Testing API Endpoints"
    
    echo "Testing Development Environment..."
    echo ""
    
    DEV_BASE="https://${DEV_PROJECT_REF}.supabase.co/functions/v1/make-server-6fcaeea3"
    
    print_info "Health check..."
    curl -s "${DEV_BASE}/health" | jq '.'
    echo ""
    
    print_info "Database connection..."
    curl -s "${DEV_BASE}/test-db" | jq '.'
    echo ""
    
    echo ""
    echo "Testing Production Environment..."
    echo ""
    
    PROD_BASE="https://${PROD_PROJECT_REF}.supabase.co/functions/v1/make-server-6fcaeea3"
    
    print_info "Health check..."
    curl -s "${PROD_BASE}/health" | jq '.'
    echo ""
    
    print_info "Database connection..."
    curl -s "${PROD_BASE}/test-db" | jq '.'
    echo ""
}

# Main menu
show_menu() {
    print_header "JALA 2 Deployment Menu"
    
    echo "Backend Deployment:"
    echo "  1) Deploy backend to Development"
    echo "  2) Deploy backend to Production"
    echo "  3) Deploy backend to BOTH environments"
    echo ""
    echo "Frontend Deployment:"
    echo "  4) Build frontend"
    echo "  5) Deploy frontend to Netlify"
    echo "  6) Deploy frontend to Vercel"
    echo ""
    echo "Full Deployment:"
    echo "  7) Deploy EVERYTHING (Backend + Frontend)"
    echo ""
    echo "Monitoring:"
    echo "  8) View backend logs"
    echo "  9) Test API endpoints"
    echo ""
    echo "  0) Exit"
    echo ""
    read -p "Select option: " choice
    
    case $choice in
        1)
            check_supabase_cli
            check_login
            deploy_backend_dev
            ;;
        2)
            check_supabase_cli
            check_login
            deploy_backend_prod
            ;;
        3)
            check_supabase_cli
            check_login
            deploy_backend_dev
            deploy_backend_prod
            ;;
        4)
            build_frontend
            ;;
        5)
            deploy_frontend_netlify
            ;;
        6)
            deploy_frontend_vercel
            ;;
        7)
            check_supabase_cli
            check_login
            deploy_backend_dev
            deploy_backend_prod
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
            ;;
        8)
            check_supabase_cli
            check_login
            view_logs
            ;;
        9)
            test_endpoints
            ;;
        0)
            print_info "Exiting..."
            exit 0
            ;;
        *)
            print_error "Invalid option"
            ;;
    esac
    
    echo ""
    read -p "Press Enter to continue..."
    show_menu
}

# Start the script
clear
cat << "EOF"
     _    _    _        _      ____  
    | |  / \  | |      / \    |___ \ 
 _  | | / _ \ | |     / _ \     __) |
| |_| |/ ___ \| |___ / ___ \   / __/ 
 \___//_/   \_\_____/_/   \_\ |_____|
                                      
    Event Gifting Platform Deployment
              Version 1.0
EOF

echo ""
print_info "Welcome to the JALA 2 deployment script!"
print_info "This script will help you deploy backend and frontend to production."
echo ""

show_menu
