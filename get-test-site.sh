#!/bin/bash

# Helper script to get a site UUID for testing

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

BASE_URL="https://wjfcqqrlhwdvvjmefxky.supabase.co/functions/v1/make-server-6fcaeea3"

echo "========================================="
echo "Get Test Site UUID"
echo "========================================="
echo ""

read -p "Auth Token: " AUTH_TOKEN

if [ -z "$AUTH_TOKEN" ]; then
    echo "Error: Auth Token is required"
    exit 1
fi

echo ""
echo "Fetching sites..."
echo ""

# Get sites
RESPONSE=$(curl -s -X GET "$BASE_URL/v2/sites?limit=10" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json")

# Check if jq is available
if ! command -v jq &> /dev/null; then
    echo "Raw response (install jq for better formatting):"
    echo "$RESPONSE"
    exit 0
fi

# Parse and display sites
SUCCESS=$(echo $RESPONSE | jq -r '.success')

if [ "$SUCCESS" = "true" ]; then
    echo -e "${GREEN}Available Sites:${NC}"
    echo "========================================="
    echo ""
    
    # Display sites in a table format
    echo $RESPONSE | jq -r '.data[] | "\(.id)\t\(.name)\t\(.status)"' | while IFS=$'\t' read -r id name status; do
        echo -e "${YELLOW}Site ID:${NC} $id"
        echo "  Name: $name"
        echo "  Status: $status"
        echo ""
    done
    
    # Get first site ID
    FIRST_SITE=$(echo $RESPONSE | jq -r '.data[0].id')
    
    if [ "$FIRST_SITE" != "null" ]; then
        echo "========================================="
        echo -e "${GREEN}Recommended for testing:${NC}"
        echo ""
        echo "  $FIRST_SITE"
        echo ""
        echo "Copy this UUID and use it in the test script!"
    fi
else
    echo "Error fetching sites:"
    echo "$RESPONSE" | jq '.'
fi
