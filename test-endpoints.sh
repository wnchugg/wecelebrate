#!/bin/bash

# ============================================================================
# Quick Endpoint Tester
# ============================================================================
# Tests your deployed endpoints with proper authentication
# ============================================================================

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

info() { echo -e "${BLUE}ℹ️  $1${NC}"; }
success() { echo -e "${GREEN}✅ $1${NC}"; }
warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }
error() { echo -e "${RED}❌ $1${NC}"; }
header() { echo -e "\n${CYAN}━━━ $1 ━━━${NC}\n"; }

# Configuration
DEV_PROJECT="wjfcqqrlhwdvvjmefxky"
PROD_PROJECT="lmffeqwhrnbsbhdztwyv"

clear
header "JALA 2 Endpoint Tester"

echo "Which environment do you want to test?"
echo ""
echo "  1) 🔧 Development"
echo "  2) 🚀 Production"
echo "  3) 🔄 Both"
echo ""
read -p "Choice (1-3): " env_choice

test_environment() {
    local project_id=$1
    local env_name=$2
    
    header "Testing $env_name Environment"
    
    info "Project ID: $project_id"
    info "Getting anon key..."
    
    # Get anon key from Supabase CLI
    local anon_key=$(supabase projects api-keys --project-ref $project_id 2>/dev/null | grep "anon key" | awk '{print $NF}' || echo "")
    
    if [ -z "$anon_key" ]; then
        error "Could not retrieve anon key"
        warning "Make sure you're logged in: supabase login"
        return 1
    fi
    
    success "Retrieved anon key"
    echo ""
    
    # Test health endpoint
    info "Testing /health endpoint..."
    echo ""
    
    response=$(curl -s -w "\n%{http_code}" -H "Authorization: Bearer $anon_key" \
        "https://${project_id}.supabase.co/functions/v1/make-server-6fcaeea3/health")
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | head -n-1)
    
    if [ "$http_code" = "200" ]; then
        success "Health check PASSED ✓"
        echo ""
        echo "Response:"
        echo "$body" | python3 -m json.tool 2>/dev/null || echo "$body"
        echo ""
    else
        error "Health check FAILED"
        echo "HTTP Status: $http_code"
        echo "Response: $body"
        echo ""
        warning "Check logs at:"
        info "https://supabase.com/dashboard/project/$project_id/logs/edge-functions"
        echo ""
    fi
    
    # Show cURL command for manual testing
    echo ""
    info "Manual test command:"
    echo ""
    echo "curl -H \"Authorization: Bearer $anon_key\" \\"
    echo "  https://${project_id}.supabase.co/functions/v1/make-server-6fcaeea3/health"
    echo ""
}

case $env_choice in
    1)
        test_environment "$DEV_PROJECT" "Development"
        ;;
    2)
        test_environment "$PROD_PROJECT" "Production"
        ;;
    3)
        test_environment "$DEV_PROJECT" "Development"
        echo ""
        test_environment "$PROD_PROJECT" "Production"
        ;;
    *)
        error "Invalid choice"
        exit 1
        ;;
esac

echo ""
header "Testing Complete!"
echo ""
info "Available endpoints:"
echo ""
echo "  • /health - Health check"
echo "  • /test-db - Database connection test"
echo "  • /employees - Employee management"
echo "  • /clients - Client management"
echo "  • /sites - Site management"
echo "  • /gifts - Gift catalog management"
echo "  • /site-gifts - Site-to-gift assignments"
echo ""
info "All requests require: Authorization: Bearer <anon_key>"
echo ""
