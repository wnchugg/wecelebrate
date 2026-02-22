#!/bin/bash

# Check the site status and draft_settings in the database

echo "🔍 Checking Site Status and Draft Settings"
echo ""

SITE_ID="10000000-0000-0000-0000-000000000002"

echo "Run this query in Supabase Dashboard SQL Editor:"
echo ""
echo "SELECT"
echo "  id,"
echo "  name as live_name,"
echo "  status,"
echo "  draft_settings->>'name' as draft_name,"
echo "  draft_settings IS NOT NULL as has_draft,"
echo "  jsonb_pretty(draft_settings) as draft_preview"
echo "FROM sites"
echo "WHERE id = '$SITE_ID';"
echo ""
echo "Expected results:"
echo "  - status should be 'active' (not 'draft') to enable Live toggle"
echo "  - has_draft should be true if you saved changes"
echo "  - draft_name should show your new value"
echo "  - live_name should show the old value"
