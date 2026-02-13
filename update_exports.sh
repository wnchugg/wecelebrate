#!/bin/bash

# Script to add default exports to all page components that need them

# PUBLIC PAGES (lazy loaded)
files=(
  "TechnicalReview"
  "MagicLinkRequest"
  "MagicLinkValidation"
  "SSOValidation"
  "PrivacyPolicy"
  "DiagnosticPage"
  "InitialSeed"
  "SystemStatus"
  "ValidationTest"
  "PerformanceTest"
  "JWTDebug"
  "QuickDiagnostic"
  "BackendTest"
  "LanguageTest"
  "CelebrationTest"
)

# ADMIN PAGES (lazy loaded)
admin_files=(
  "AdminLogout"
  "BootstrapAdmin"
  "DiagnosticTools"
  "ClientManagement"
  "ClientDetail"
  "SiteManagement"
  "GiftManagement"
  "ProductBulkImport"
  "OrderManagement"
  "EmployeeManagement"
  "ERPManagement"
  "ImportExportSettings"
  "Analytics"
  "Reports"
  "BrandManagement"
  "SiteConfiguration"
  "SiteGiftConfiguration"
  "EmailTemplates"
  "ShippingConfiguration"
  "AccessManagement"
  "AuditLogs"
  "SecurityDashboard"
  "AdminUserManagement"
  "RoleManagement"
  "AccessGroupManagement"
  "RBACOverview"
  "SessionExpired"
  "EnvironmentManagement"
  "AdminDebug"
  "AdminHelper"
  "AdminLoginDebug"
  "ForceTokenClear"
  "ConnectionTest"
  "DataDiagnostic"
  "TestDataReference"
  "ApplicationDocumentation"
  "DevelopmentDocumentation"
  "LandingPageEditor"
  "WelcomePageEditor"
  "PerformanceDashboard"
)

# Process public pages
for file in "${files[@]}"; do
  filepath="/src/app/pages/${file}.tsx"
  if [ -f "$filepath" ]; then
    # Check if default export already exists
    if ! grep -q "^export default ${file}" "$filepath"; then
      echo "export default ${file};" >> "$filepath"
      echo "Added default export to ${file}.tsx"
    else
      echo "Default export already exists in ${file}.tsx - skipping"
    fi
  else
    echo "File not found: $filepath"
  fi
done

# Process admin pages
for file in "${admin_files[@]}"; do
  filepath="/src/app/pages/admin/${file}.tsx"
  if [ -f "$filepath" ]; then
    # Check if default export already exists
    if ! grep -q "^export default ${file}" "$filepath"; then
      echo "export default ${file};" >> "$filepath"
      echo "Added default export to admin/${file}.tsx"
    else
      echo "Default export already exists in admin/${file}.tsx - skipping"
    fi
  else
    echo "File not found: $filepath"
  fi
done

echo "Export updates complete!"
