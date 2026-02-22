#!/bin/bash

# Quick script to find a site UUID

BASE_URL="https://wjfcqqrlhwdvvjmefxky.supabase.co/functions/v1/make-server-6fcaeea3"

echo "Trying to find a site UUID..."
echo ""

# Try with the anon key (public endpoint)
ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndqZmNxcXJsaHdkdnZqbWVmeGt5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAzNTQ4NjgsImV4cCI6MjA4NTkzMDg2OH0.utZqFFSYWNkpiHsvU8qQbu4-abPZ41hAZhNL1XDv6ec"

# Try public sites endpoint
echo "Checking public sites..."
RESPONSE=$(curl -s -X GET "$BASE_URL/v2/public/sites" \
  -H "apikey: $ANON_KEY" \
  -H "Content-Type: application/json")

if command -v jq &> /dev/null; then
    SITE_ID=$(echo $RESPONSE | jq -r '.sites[0].id' 2>/dev/null)
    SITE_NAME=$(echo $RESPONSE | jq -r '.sites[0].name' 2>/dev/null)
    
    if [ "$SITE_ID" != "null" ] && [ -n "$SITE_ID" ]; then
        echo "✓ Found a site!"
        echo ""
        echo "Site ID: $SITE_ID"
        echo "Name: $SITE_NAME"
        echo ""
        echo "Use this UUID for testing:"
        echo "$SITE_ID"
    else
        echo "No sites found via public endpoint."
        echo ""
        echo "Try these test UUIDs if you have seed data:"
        echo "  00000000-0000-0000-0000-000000000001"
        echo "  00000000-0000-0000-0000-000000000002"
        echo "  00000000-0000-0000-0000-000000000003"
    fi
else
    echo "Install jq for better output: brew install jq"
    echo ""
    echo "Raw response:"
    echo "$RESPONSE"
fi
