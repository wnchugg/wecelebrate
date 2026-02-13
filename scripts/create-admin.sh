#!/bin/bash

# Create Admin Account Script
# Usage: ./scripts/create-admin.sh [dev|test|uat|prod] [email] [password]

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check arguments
if [ -z "$1" ]; then
    print_error "No environment specified"
    echo ""
    echo "Usage: ./scripts/create-admin.sh [dev|test|uat|prod] [email] [password]"
    echo ""
    echo "Examples:"
    echo "  ./scripts/create-admin.sh dev admin@example.com MyPassword123!"
    echo "  ./scripts/create-admin.sh prod admin@company.com SecurePass456!"
    exit 1
fi

ENV=$1
EMAIL=${2:-}
PASSWORD=${3:-}

# Validate environment
if [[ ! "$ENV" =~ ^(dev|test|uat|prod)$ ]]; then
    print_error "Invalid environment: $ENV"
    echo "Valid environments: dev, test, uat, prod"
    exit 1
fi

# Environment names
case $ENV in
    dev)
        ENV_NAME="Development"
        DEFAULT_EMAIL="admin-dev@example.com"
        ;;
    test)
        ENV_NAME="Test"
        DEFAULT_EMAIL="admin-test@example.com"
        ;;
    uat)
        ENV_NAME="UAT"
        DEFAULT_EMAIL="admin-uat@example.com"
        ;;
    prod)
        ENV_NAME="Production"
        DEFAULT_EMAIL="admin@yourcompany.com"
        ;;
esac

echo ""
echo -e "${GREEN}═══════════════════════════════════════════════════${NC}"
echo -e "${GREEN}  Creating Admin Account - ${ENV_NAME}${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════════${NC}"
echo ""

# Load environment variables
ENV_FILE=".env.${ENV}"
if [ "$ENV" = "dev" ]; then
    ENV_FILE=".env.local"
fi

if [ ! -f "$ENV_FILE" ]; then
    print_error "Environment file not found: $ENV_FILE"
    exit 1
fi

source "$ENV_FILE"

# Determine which variables to use
case $ENV in
    dev)
        PROJECT_URL=$VITE_SUPABASE_URL
        ANON_KEY=$VITE_SUPABASE_ANON_KEY
        ;;
    test)
        PROJECT_URL=${VITE_SUPABASE_URL_TEST:-$VITE_SUPABASE_URL}
        ANON_KEY=${VITE_SUPABASE_ANON_KEY_TEST:-$VITE_SUPABASE_ANON_KEY}
        ;;
    uat)
        PROJECT_URL=${VITE_SUPABASE_URL_UAT:-$VITE_SUPABASE_URL}
        ANON_KEY=${VITE_SUPABASE_ANON_KEY_UAT:-$VITE_SUPABASE_ANON_KEY}
        ;;
    prod)
        PROJECT_URL=${VITE_SUPABASE_URL_PROD:-$VITE_SUPABASE_URL}
        ANON_KEY=${VITE_SUPABASE_ANON_KEY_PROD:-$VITE_SUPABASE_ANON_KEY}
        ;;
esac

print_info "Environment: ${ENV_NAME}"
print_info "API URL: ${PROJECT_URL}"
echo ""

# Prompt for email if not provided
if [ -z "$EMAIL" ]; then
    read -p "Email (default: $DEFAULT_EMAIL): " EMAIL
    EMAIL=${EMAIL:-$DEFAULT_EMAIL}
fi

# Prompt for password if not provided
if [ -z "$PASSWORD" ]; then
    read -s -p "Password (min 8 characters): " PASSWORD
    echo ""
    if [ ${#PASSWORD} -lt 8 ]; then
        print_error "Password must be at least 8 characters"
        exit 1
    fi
fi

# Prompt for username
read -p "Username (default: Admin): " USERNAME
USERNAME=${USERNAME:-Admin}

# Confirm for production
if [ "$ENV" = "prod" ]; then
    echo ""
    print_error "⚠️  WARNING: Creating admin account in PRODUCTION"
    read -p "Are you sure? (type 'yes' to confirm): " confirm
    if [ "$confirm" != "yes" ]; then
        print_info "Cancelled"
        exit 0
    fi
fi

echo ""
print_info "Creating admin account..."
print_info "Email: $EMAIL"
print_info "Username: $USERNAME"
print_info "Role: super_admin"
echo ""

# Create the admin account
SIGNUP_URL="${PROJECT_URL}/functions/v1/make-server-6fcaeea3/auth/signup"

response=$(curl -s -w "\n%{http_code}" \
  -X POST \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ANON_KEY" \
  -d "{
    \"email\": \"$EMAIL\",
    \"password\": \"$PASSWORD\",
    \"username\": \"$USERNAME\",
    \"role\": \"super_admin\"
  }" \
  "$SIGNUP_URL" 2>/dev/null || echo -e "\n000")

http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | sed '$d')

echo ""
if [ "$http_code" = "200" ] || [ "$http_code" = "201" ]; then
    print_success "Admin account created successfully! 🎉"
    echo ""
    print_info "Login credentials:"
    echo "  Email: $EMAIL"
    echo "  Password: (the one you entered)"
    echo "  Environment: ${ENV_NAME}"
    echo ""
    print_info "Next steps:"
    echo "  1. Go to /admin/login"
    echo "  2. Select '${ENV_NAME}' environment"
    echo "  3. Log in with your credentials"
    echo ""
else
    print_error "Failed to create admin account"
    print_error "HTTP Status: $http_code"
    echo ""
    echo "Response:"
    echo "$body" | jq . 2>/dev/null || echo "$body"
    echo ""
    
    if [ "$http_code" = "000" ]; then
        print_error "Could not reach the API. Is the Edge Function deployed?"
        echo ""
        echo "Deploy it with:"
        echo "  ./scripts/deploy-environment.sh $ENV"
    elif [ "$http_code" = "409" ]; then
        print_error "User already exists with this email"
        echo ""
        echo "Try logging in instead, or use a different email"
    elif [ "$http_code" = "429" ]; then
        print_error "Rate limit exceeded. Please wait a few minutes and try again"
    fi
    
    exit 1
fi
