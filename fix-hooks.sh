#!/bin/bash

# Script to add useCallback import and wrap load functions
# This fixes react-hooks/exhaustive-deps warnings

FILES=(
  "src/app/pages/admin/ClientDetail.tsx"
  "src/app/pages/admin/Dashboard.tsx"
  "src/app/pages/admin/GiftManagement.tsx"
  "src/app/pages/admin/GlobalTemplateLibrary.tsx"
  "src/app/pages/admin/ScheduledEmailManagement.tsx"
  "src/app/pages/admin/ScheduledTriggersManagement.tsx"
  "src/app/pages/admin/SiteCatalogConfiguration.tsx"
  "src/app/pages/admin/SiteGiftAssignment.tsx"
  "src/app/pages/SSOValidation.tsx"
)

for file in "${FILES[@]}"; do
  echo "Processing $file..."
  
  # Add useCallback to imports if not present
  if grep -q "import.*{.*useState.*useEffect.*}.*from 'react'" "$file"; then
    if ! grep -q "useCallback" "$file"; then
      sed -i.bak "s/import { \(.*\)useState, useEffect\(.*\) } from 'react'/import { \1useState, useEffect, useCallback\2 } from 'react'/" "$file"
      echo "  ✓ Added useCallback import"
    fi
  fi
done

echo "Done! Run 'npm run lint' to check remaining issues."
