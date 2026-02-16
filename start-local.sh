#!/bin/bash

# ============================================================================
# Local Development Quick Start
# ============================================================================

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

info() { echo -e "${BLUE}ℹ️  $1${NC}"; }
success() { echo -e "${GREEN}✅ $1${NC}"; }
warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }
header() { echo -e "\n${CYAN}━━━ $1 ━━━${NC}\n"; }

clear
cat << "EOF"
  _                     _   ____             
 | |    ___   ___ __ _| | |  _ \  _____   __
 | |   / _ \ / __/ _` | | | | | |/ _ \ \ / /
 | |__| (_) | (_| (_| | | | |_| |  __/\ V / 
 |_____\___/ \___\__,_|_| |____/ \___| \_/  
                                             
  Local Development Server
EOF

echo ""

# Check if .env exists
if [ ! -f .env ]; then
    warning ".env file not found!"
    echo ""
    info "Creating .env file from template..."
    
    if [ -f .env.example ]; then
        cp .env.example .env
        success ".env file created!"
        echo ""
        warning "⚠️  IMPORTANT: Edit .env and add your Supabase keys"
        echo ""
        echo "You need to set:"
        echo "  1. VITE_SUPABASE_URL (already set to dev)"
        echo "  2. VITE_SUPABASE_ANON_KEY (get from Supabase Dashboard)"
        echo ""
        info "Get your keys from:"
        echo "👉 https://supabase.com/dashboard/project/wjfcqqrlhwdvvjmefxky/settings/api"
        echo ""
        read -p "Press Enter after you've updated .env..."
    else
        echo "Please create a .env file. See LOCAL_DEVELOPMENT_GUIDE.md"
        exit 1
    fi
fi

# Check if node_modules exists
if [ ! -d node_modules ]; then
    header "Installing Dependencies"
    info "This may take a few minutes..."
    npm install
    success "Dependencies installed!"
fi

header "Starting Development Server"
echo ""
info "The app will open at: http://localhost:5173"
info "Press Ctrl+C to stop the server"
echo ""
success "Starting..."
echo ""

# Start the dev server
npm run dev
