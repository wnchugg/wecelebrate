#!/bin/bash

# JALA2 Admin User Creation Script
# Creates an admin user in the currently linked Supabase project
# Usage: ./scripts/create-admin-user.sh

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║                                                            ║"
echo "║            JALA2 Admin User Creation Script               ║"
echo "║                                                            ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Get current project info
print_info "Detecting current Supabase project..."
echo ""

if command -v supabase &> /dev/null; then
    PROJECT_REF=$(supabase status 2>/dev/null | grep "Project ID" | awk '{print $3}' || echo "")
    if [ -n "$PROJECT_REF" ]; then
        print_success "Linked project: ${PROJECT_REF}"
        SUPABASE_URL="https://${PROJECT_REF}.supabase.co"
    else
        print_warning "No project linked. Will prompt for URL."
    fi
else
    print_warning "Supabase CLI not found. Will prompt for URL."
fi

echo ""
echo "────────────────────────────────────────────────────────────"
print_info "Please provide the following information:"
echo ""

# Get project URL
if [ -z "$SUPABASE_URL" ]; then
    read -p "Supabase Project URL (e.g., https://abc123.supabase.co): " SUPABASE_URL
    if [ -z "$SUPABASE_URL" ]; then
        print_error "Project URL is required!"
        exit 1
    fi
fi

echo "Project URL: ${SUPABASE_URL}"
echo ""

# Get anon key
read -sp "Anon Key: " ANON_KEY
echo ""
if [ -z "$ANON_KEY" ]; then
    print_error "Anon Key is required!"
    exit 1
fi

echo ""
print_success "Project credentials collected"
echo ""

# Get admin details
echo "────────────────────────────────────────────────────────────"
print_info "Enter admin user details:"
echo ""

read -p "Email: " ADMIN_EMAIL
if [ -z "$ADMIN_EMAIL" ]; then
    print_error "Email is required!"
    exit 1
fi

read -p "Username: " ADMIN_USERNAME
if [ -z "$ADMIN_USERNAME" ]; then
    ADMIN_USERNAME="Admin User"
    print_warning "Using default username: ${ADMIN_USERNAME}"
fi

read -sp "Password (min 8 chars): " ADMIN_PASSWORD
echo ""
if [ -z "$ADMIN_PASSWORD" ]; then
    print_error "Password is required!"
    exit 1
fi

if [ ${#ADMIN_PASSWORD} -lt 8 ]; then
    print_error "Password must be at least 8 characters!"
    exit 1
fi

echo ""
read -p "Role (super_admin/admin/manager) [super_admin]: " ADMIN_ROLE
if [ -z "$ADMIN_ROLE" ]; then
    ADMIN_ROLE="super_admin"
fi

# Validate role
if [ "$ADMIN_ROLE" != "super_admin" ] && [ "$ADMIN_ROLE" != "admin" ] && [ "$ADMIN_ROLE" != "manager" ]; then
    print_error "Invalid role: ${ADMIN_ROLE}"
    print_info "Must be one of: super_admin, admin, manager"
    exit 1
fi

echo ""
print_success "Admin details collected"
echo ""

# Create JSON payload
JSON_PAYLOAD=$(cat <<EOF
{
  "email": "${ADMIN_EMAIL}",
  "password": "${ADMIN_PASSWORD}",
  "username": "${ADMIN_USERNAME}",
  "role": "${ADMIN_ROLE}"
}
EOF
)

# Create admin user
echo "────────────────────────────────────────────────────────────"
print_info "Creating admin user..."
echo ""

API_URL="${SUPABASE_URL}/functions/v1/make-server-6fcaeea3/auth/signup"

RESPONSE=$(curl -s -w "\n%{http_code}" \
  -X POST \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${ANON_KEY}" \
  -d "${JSON_PAYLOAD}" \
  "${API_URL}")

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

echo ""

if [ "$HTTP_CODE" == "200" ] || [ "$HTTP_CODE" == "201" ]; then
    print_success "Admin user created successfully!"
    echo ""
    echo "────────────────────────────────────────────────────────────"
    echo ""
    echo "  📧 Email:    ${ADMIN_EMAIL}"
    echo "  👤 Username: ${ADMIN_USERNAME}"
    echo "  🔐 Role:     ${ADMIN_ROLE}"
    echo ""
    echo "────────────────────────────────────────────────────────────"
    echo ""
    print_info "You can now log in at: /admin/login"
    echo ""
    
    # Save credentials (optional)
    echo ""
    read -p "Save login credentials to file? (y/n): " SAVE_CREDS
    if [ "$SAVE_CREDS" == "y" ] || [ "$SAVE_CREDS" == "Y" ]; then
        CRED_FILE="admin-credentials-$(date +%Y%m%d-%H%M%S).txt"
        cat > "$CRED_FILE" << EOF
JALA2 Admin User Credentials
═══════════════════════════════════════════════════

Created: $(date '+%Y-%m-%d %H:%M:%S')
Project: ${SUPABASE_URL}

Email: ${ADMIN_EMAIL}
Username: ${ADMIN_USERNAME}
Role: ${ADMIN_ROLE}

Login URL: /admin/login

⚠️  IMPORTANT: Keep this file secure and delete after use!
EOF
        print_success "Credentials saved to: ${CRED_FILE}"
        print_warning "Remember to delete this file after saving the credentials elsewhere!"
    fi
else
    print_error "Failed to create admin user!"
    echo ""
    echo "HTTP Status: ${HTTP_CODE}"
    echo "Response: ${BODY}"
    echo ""
    
    # Common errors
    if echo "$BODY" | grep -q "already exists"; then
        print_warning "User with this email already exists"
        print_info "Try logging in instead, or use a different email"
    elif echo "$BODY" | grep -q "password"; then
        print_warning "Password does not meet requirements"
        print_info "Password must be at least 8 characters with mixed case, numbers, and symbols"
    elif [ "$HTTP_CODE" == "401" ] || [ "$HTTP_CODE" == "403" ]; then
        print_warning "Authentication failed"
        print_info "Check that your Anon Key is correct"
    elif [ "$HTTP_CODE" == "404" ]; then
        print_warning "API endpoint not found"
        print_info "Ensure the Edge Function is deployed:"
        echo "  supabase functions deploy make-server-6fcaeea3"
    else
        print_info "Check the Edge Function logs for more details:"
        echo "  supabase functions logs make-server-6fcaeea3"
    fi
    echo ""
    exit 1
fi

echo ""
print_success "All done! 🎉"
echo ""
