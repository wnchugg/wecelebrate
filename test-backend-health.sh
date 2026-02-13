#!/bin/bash

# Quick script to test backend health
# Usage: ./test-backend-health.sh

echo "Testing Backend Health..."
echo ""

# Development environment
DEV_URL="https://wjfcqqrlhwdvvjmefxky.supabase.co/functions/v1/make-server-6fcaeea3/health"
DEV_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndqZmNxcXJsaHdkdnZqbWVmeGt5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAzNTQ4NjgsImV4cCI6MjA4NTkzMDg2OH0.utZqFFSYWNkpiHsvU8qQbu4-abPZ41hAZhNL1XDv6ec"

echo "URL: ${DEV_URL}"
echo ""
echo "Response:"
curl -v -H "Authorization: Bearer ${DEV_KEY}" "${DEV_URL}"
echo ""
echo ""
echo "JSON formatted:"
curl -s -H "Authorization: Bearer ${DEV_KEY}" "${DEV_URL}" | jq .
