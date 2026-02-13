#!/bin/bash

# ============================================================================
# Simple Endpoint Tester (Manual Keys)
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

clear
header "JALA 2 Simple Health Check"

echo ""
info "Get your anon key from:"
echo "  Development: https://supabase.com/dashboard/project/wjfcqqrlhwdvvjmefxky/settings/api"
echo "  Production:  https://supabase.com/dashboard/project/lmffeqwhrnbsbhdztwyv/settings/api"
echo ""
info "Look for 'anon public' key (starts with eyJ...)"
echo ""

echo "Which environment?"
echo "  1) Development"
echo "  2) Production"
echo ""
read -p "Choice: " choice

if [ "$choice" = "1" ]; then
    PROJECT_ID="wjfcqqrlhwdvvjmefxky"
    ENV_NAME="Development"
elif [ "$choice" = "2" ]; then
    PROJECT_ID="lmffeqwhrnbsbhdztwyv"
    ENV_NAME="Production"
else
    error "Invalid choice"
    exit 1
fi

echo ""
read -p "Paste your anon key: " ANON_KEY

if [ -z "$ANON_KEY" ]; then
    error "No key provided"
    exit 1
fi

header "Testing $ENV_NAME"

info "Making request..."
echo ""

response=$(curl -s -w "\n%{http_code}" \
    -H "Authorization: Bearer $ANON_KEY" \
    "https://${PROJECT_ID}.supabase.co/functions/v1/make-server-6fcaeea3/health")

http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | head -n-1)

echo "HTTP Status: $http_code"
echo ""

if [ "$http_code" = "200" ]; then
    success "✅ HEALTH CHECK PASSED!"
    echo ""
    echo "Response:"
    echo "$body" | python3 -m json.tool 2>/dev/null || echo "$body"
    echo ""
    success "Your backend is working! 🎉"
elif [ "$http_code" = "401" ]; then
    error "❌ AUTHENTICATION FAILED"
    echo "The anon key is invalid or incorrect"
    echo ""
    info "Double-check you copied the 'anon public' key from:"
    echo "https://supabase.com/dashboard/project/$PROJECT_ID/settings/api"
elif [ "$http_code" = "404" ]; then
    error "❌ FUNCTION NOT FOUND"
    echo "The Edge Function hasn't been deployed yet"
    echo ""
    info "Deploy it with: ./quick-deploy.sh"
elif [ "$http_code" = "500" ]; then
    error "❌ SERVER ERROR"
    echo "The function is deployed but crashed"
    echo ""
    echo "Response:"
    echo "$body"
    echo ""
    warning "Check the logs at:"
    echo "https://supabase.com/dashboard/project/$PROJECT_ID/logs/edge-functions"
    echo ""
    info "Common causes:"
    echo "  • Missing environment variables"
    echo "  • Database table not created (kv_store_6fcaeea3)"
    echo "  • Connection string incorrect"
else
    error "❌ UNEXPECTED ERROR"
    echo "HTTP Status: $http_code"
    echo "Response: $body"
fi

echo ""
info "Full cURL command:"
echo ""
echo "curl -H \"Authorization: Bearer $ANON_KEY\" \\"
echo "  https://${PROJECT_ID}.supabase.co/functions/v1/make-server-6fcaeea3/health"
echo ""
