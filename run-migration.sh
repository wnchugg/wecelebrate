#!/bin/bash

echo "🔧 Edge Function Directory Migration"
echo "====================================="
echo ""

# Run the Node.js migration script
node do-migration.js

echo ""
echo "✅ Migration script completed!"
echo ""
echo "To verify:"
echo "  ls -la supabase/functions/make-server-6fcaeea3/"
echo ""
echo "To deploy:"
echo "  ./scripts/deploy-full-stack.sh dev"
echo ""
