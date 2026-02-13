#!/bin/bash

# Test Environment Connectivity Script
# Usage: ./scripts/test-environment.sh [dev|test|uat|prod|all]

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_info() { echo -e "${BLUE}ℹ️  $1${NC}"; }
print_success() { echo -e "${GREEN}✅ $1${NC}"; }
print_error() { echo -e "${RED}❌ $1${NC}"; }
print_warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }

# Test a single environment
test_environment() {
    local env=$1
    local env_name=$2
    local project_url=$3
    local anon_key=$4
    
    echo ""
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}  Testing ${env_name} Environment${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    
    if [ -z "$project_url" ]; then
        print_warning "No URL configured for ${env_name}"
        return 1
    fi
    
    print_info "URL: ${project_url}"
    
    # Test health endpoint
    local health_url="${project_url}/functions/v1/make-server-6fcaeea3/health"
    
    print_info "Testing health endpoint..."
    
    response=$(curl -s -w "\n%{http_code}" \
      -H "Authorization: Bearer $anon_key" \
      --max-time 10 \
      "$health_url" 2>/dev/null || echo -e "\n000")
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    if [ "$http_code" = "200" ]; then
        print_success "${env_name}: Health check passed"
        print_info "Response: $body"
        return 0
    elif [ "$http_code" = "000" ]; then
        print_error "${env_name}: Could not reach endpoint (timeout or network error)"
        print_warning "The Edge Function may not be deployed"
        return 1
    else
        print_error "${env_name}: Health check failed with status $http_code"
        print_info "Response: $body"
        return 1
    fi
}

# Load environment file and test
load_and_test() {
    local env=$1
    local env_file=".env.${env}"
    
    if [ "$env" = "dev" ]; then
        env_file=".env.local"
    fi
    
    if [ ! -f "$env_file" ]; then
        print_warning "Environment file not found: $env_file"
        return 1
    fi
    
    source "$env_file"
    
    case $env in
        dev)
            ENV_NAME="Development"
            PROJECT_URL=$VITE_SUPABASE_URL
            ANON_KEY=$VITE_SUPABASE_ANON_KEY
            ;;
        test)
            ENV_NAME="Test"
            PROJECT_URL=${VITE_SUPABASE_URL_TEST:-$VITE_SUPABASE_URL}
            ANON_KEY=${VITE_SUPABASE_ANON_KEY_TEST:-$VITE_SUPABASE_ANON_KEY}
            ;;
        uat)
            ENV_NAME="UAT"
            PROJECT_URL=${VITE_SUPABASE_URL_UAT:-$VITE_SUPABASE_URL}
            ANON_KEY=${VITE_SUPABASE_ANON_KEY_UAT:-$VITE_SUPABASE_ANON_KEY}
            ;;
        prod)
            ENV_NAME="Production"
            PROJECT_URL=${VITE_SUPABASE_URL_PROD:-$VITE_SUPABASE_URL}
            ANON_KEY=${VITE_SUPABASE_ANON_KEY_PROD:-$VITE_SUPABASE_ANON_KEY}
            ;;
    esac
    
    test_environment "$env" "$ENV_NAME" "$PROJECT_URL" "$ANON_KEY"
}

# Main
ENV=${1:-all}

echo ""
echo -e "${GREEN}╔════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║    JALA 2 Environment Connectivity Test           ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════╝${NC}"

if [ "$ENV" = "all" ]; then
    # Test all environments
    success_count=0
    total_count=0
    
    for env in dev test uat prod; do
        total_count=$((total_count + 1))
        if load_and_test "$env"; then
            success_count=$((success_count + 1))
        fi
    done
    
    echo ""
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}  Test Summary${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    
    if [ $success_count -eq $total_count ]; then
        print_success "All $total_count environments passed! 🎉"
    else
        print_warning "$success_count out of $total_count environments passed"
        
        echo ""
        print_info "Failed environments may need:"
        echo "  1. Edge Function deployment"
        echo "  2. Environment variable configuration"
        echo "  3. Network connectivity check"
    fi
else
    # Test single environment
    if [[ ! "$ENV" =~ ^(dev|test|uat|prod)$ ]]; then
        print_error "Invalid environment: $ENV"
        echo ""
        echo "Usage: ./scripts/test-environment.sh [dev|test|uat|prod|all]"
        exit 1
    fi
    
    if load_and_test "$ENV"; then
        echo ""
        print_success "Environment test passed! ✅"
    else
        echo ""
        print_error "Environment test failed"
        echo ""
        print_info "Troubleshooting:"
        echo "  1. Deploy the Edge Function:"
        echo "     ./scripts/deploy-environment.sh $ENV"
        echo ""
        echo "  2. Verify environment variables in .env.${ENV}"
        echo ""
        echo "  3. Check Supabase project status"
        exit 1
    fi
fi

echo ""
