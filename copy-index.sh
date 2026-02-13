#!/bin/bash

# Copy index.tsx to index.ts
echo "📋 Copying index.tsx to index.ts..."

if [ ! -f "/supabase/functions/server/index.tsx" ]; then
  echo "❌ Error: index.tsx not found!"
  exit 1
fi

cp /supabase/functions/server/index.tsx /supabase/functions/server/index.ts

if [ -f "/supabase/functions/server/index.ts" ]; then
  echo "✅ Successfully created index.ts"
  echo "📊 File size: $(wc -l < /supabase/functions/server/index.ts) lines"
else
  echo "❌ Failed to create index.ts"
  exit 1
fi
