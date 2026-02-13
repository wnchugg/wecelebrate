#!/bin/bash

# ============================================================================
# Environment Variables Setup Helper
# ============================================================================
# This script helps you set environment variables in Supabase
# ============================================================================

set -e

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
cat << "EOF"
  _____            __  __                 
 | ____|_ ____   _|  \/  | __ _ _ __ ___ 
 |  _| | '_ \ \ / / |\/| |/ _` | '__/ __|
 | |___| | | \ V /| |  | | (_| | |  \__ \
 |_____|_| |_|\_/ |_|  |_|\__,_|_|  |___/
                                          
  Environment Variables Setup
EOF

echo ""
warning "This script helps you set environment variables in Supabase"
info "You'll need to set these manually via the Supabase Dashboard"
echo ""

# Ask which project
echo "Which project?"
echo ""
echo "  1) 🔧 Development (wjfcqqrlhwdvvjmefxky)"
echo "  2) 🚀 Production (lmffeqwhrnbsbhdztwyv)"
echo "  3) 📋 Both"
echo ""
read -p "Choice (1-3): " project_choice

case $project_choice in
    1)
        PROJECT_ID="wjfcqqrlhwdvvjmefxky"
        PROJECT_NAME="Development"
        ;;
    2)
        PROJECT_ID="lmffeqwhrnbsbhdztwyv"
        PROJECT_NAME="Production"
        ;;
    3)
        header "Setting up both projects"
        bash "$0" "dev"
        echo ""
        bash "$0" "prod"
        exit 0
        ;;
    *)
        error "Invalid choice"
        exit 1
        ;;
esac

header "$PROJECT_NAME Environment Variables"

info "Opening Supabase Dashboard..."
echo ""
echo "Go to:"
echo "👉 https://supabase.com/dashboard/project/$PROJECT_ID/settings/functions"
echo ""
info "Click 'Edge Functions' → Scroll to 'Secrets' section"
echo ""

warning "You need to set these 6 environment variables:"
echo ""

# Get values from user or show where to find them
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "1. SUPABASE_URL"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
info "Where to find: Settings → API → Project URL"
echo "Value: https://$PROJECT_ID.supabase.co"
echo ""
read -p "Press Enter to continue..."

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "2. SUPABASE_ANON_KEY"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
info "Where to find: Settings → API → 'anon public' key"
warning "Long string starting with 'eyJ...'"
echo ""
read -p "Press Enter to continue..."

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "3. SUPABASE_SERVICE_ROLE_KEY"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
info "Where to find: Settings → API → 'service_role secret' key"
warning "Long string starting with 'eyJ...'"
error "⚠️  NEVER expose this in frontend code!"
echo ""
read -p "Press Enter to continue..."

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "4. SUPABASE_DB_URL"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
info "Where to find: Settings → Database → Connection String → URI"
warning "Click 'Show password' to reveal your database password"
echo "Format: postgresql://postgres:[PASSWORD]@db.xxx.supabase.co:5432/postgres"
echo ""
read -p "Press Enter to continue..."

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "5. ALLOWED_ORIGINS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
info "For testing, use: *"
warning "For production, use your domain: https://yourdomain.com"
echo "Value for now: *"
echo ""
read -p "Press Enter to continue..."

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "6. SEED_ON_STARTUP"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
info "Set to 'false' for now"
echo "Value: false"
echo ""
read -p "Press Enter to continue..."

echo ""
header "Summary"
echo ""
info "Set these in Supabase Dashboard:"
echo ""
echo "Project: $PROJECT_NAME ($PROJECT_ID)"
echo "URL: https://supabase.com/dashboard/project/$PROJECT_ID/settings/functions"
echo ""
echo "Variables to set:"
echo "  1. SUPABASE_URL = https://$PROJECT_ID.supabase.co"
echo "  2. SUPABASE_ANON_KEY = (from Settings → API)"
echo "  3. SUPABASE_SERVICE_ROLE_KEY = (from Settings → API)"
echo "  4. SUPABASE_DB_URL = (from Settings → Database)"
echo "  5. ALLOWED_ORIGINS = *"
echo "  6. SEED_ON_STARTUP = false"
echo ""

warning "After setting all 6 variables, redeploy:"
echo ""
echo "  ./quick-deploy.sh"
echo ""

info "Opening browser..."
open "https://supabase.com/dashboard/project/$PROJECT_ID/settings/functions" 2>/dev/null || echo "Visit: https://supabase.com/dashboard/project/$PROJECT_ID/settings/functions"

echo ""
success "Setup guide complete!"
echo ""
info "Next steps:"
echo "  1. Set the 6 environment variables in Supabase Dashboard"
echo "  2. Run: ./quick-deploy.sh"
echo "  3. Health checks should pass!"
echo ""
