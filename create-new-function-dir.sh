#!/bin/bash
set -e

echo "📁 Creating new Edge Function directory structure..."

# Paths
SRC="supabase/functions/server"
DEST="supabase/functions/make-server-6fcaeea3"

# Create destination
mkdir -p "$DEST"
mkdir -p "$DEST/tests"

# Copy all files except index.tsx (we'll process that separately)
for file in "$SRC"/*.{ts,tsx,json,md,sh} 2>/dev/null; do
  [ -e "$file" ] || continue
  filename=$(basename "$file")
  if [ "$filename" != "index.tsx" ]; then
    cp "$file" "$DEST/$filename"
    echo "✓ Copied: $filename"
  fi
done

# Copy tests directory
if [ -d "$SRC/tests" ]; then
  cp -r "$SRC/tests"/* "$DEST/tests/" 2>/dev/null || true
  echo "✓ Copied: tests/"
fi

# Process index.tsx with route replacements
if [ -f "$SRC/index.tsx" ]; then
  # Use perl for in-place replacement (more reliable than sed)
  cat "$SRC/index.tsx" | \
    perl -pe 's{"/make-server-6fcaeea3/}{"/}g' > "$DEST/index.tsx"
  
  ROUTES_FIXED=$(grep -c '"/make-server-6fcaeea3/' "$SRC/index.tsx" || echo "0")
  echo "✓ Processed index.tsx ($ROUTES_FIXED routes fixed)"
fi

echo ""
echo "✅ New directory created: $DEST"
echo ""
ls -la "$DEST" | head -15

echo ""
echo "Ready to deploy!"
