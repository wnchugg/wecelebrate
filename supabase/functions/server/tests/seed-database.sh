#!/bin/bash

# Seed Database with Test Data
# Uses the database seed script (not KV store)

set -e

echo "🌱 Seeding database with test data..."
echo ""

# Get the directory where this script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Try to get Supabase credentials from .env file in tests directory
if [ -f "$SCRIPT_DIR/.env" ]; then
  source "$SCRIPT_DIR/.env"
fi

# If not set, try to get from .env.local in project root
if [ -z "$SUPABASE_URL" ] && [ -f ".env.local" ]; then
  source .env.local
fi

# Check for required environment variables
if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
  echo "❌ Error: Missing required environment variables"
  echo ""
  echo "   SUPABASE_URL: ${SUPABASE_URL:-NOT SET}"
  echo "   SUPABASE_SERVICE_ROLE_KEY: ${SUPABASE_SERVICE_ROLE_KEY:+SET (hidden)}${SUPABASE_SERVICE_ROLE_KEY:-NOT SET}"
  echo ""
  echo "📝 To fix this, add the service_role key to your .env file:"
  echo ""
  echo "   1. Go to: https://app.supabase.com/project/wjfcqqrlhwdvvjmefxky/settings/api"
  echo "   2. Find 'service_role' key under 'Project API keys'"
  echo "   3. Copy the key (long JWT token starting with eyJ...)"
  echo "   4. Add it to $SCRIPT_DIR/.env:"
  echo ""
  echo "      echo 'SUPABASE_SERVICE_ROLE_KEY=your_key_here' >> $SCRIPT_DIR/.env"
  echo ""
  echo "   Or export it in your shell:"
  echo ""
  echo "      export SUPABASE_SERVICE_ROLE_KEY=your_key_here"
  echo ""
  exit 1
fi

export SUPABASE_URL
export SUPABASE_SERVICE_ROLE_KEY

# Set Deno TLS CA store to use system certificates
export DENO_TLS_CA_STORE=system

echo "✓ Environment variables loaded"
echo "  SUPABASE_URL: $SUPABASE_URL"
echo "  SUPABASE_SERVICE_ROLE_KEY: ${SUPABASE_SERVICE_ROLE_KEY:0:20}..."
echo ""

# Run the seed script
cd "$SCRIPT_DIR/.."
~/.deno/bin/deno run \
  --allow-net \
  --allow-env \
  --allow-read \
  database/seed-test-data.ts

echo ""
echo "✅ Database seeding complete!"
echo ""
echo "📝 Next steps:"
echo "   1. Run dashboard API tests: cd supabase/functions/server && deno test tests/dashboard_api.test.ts"
echo "   2. Or run all tests: npm test"
