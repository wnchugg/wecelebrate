#!/bin/bash
# Documentation Organization Script
# This script moves documentation files from the root into organized folders

set -e  # Exit on error

echo "=================================================="
echo "  wecelebrate Documentation Organization Script"
echo "=================================================="
echo ""
echo "This script will organize documentation into:"
echo "  - docs/getting-started/"
echo "  - docs/architecture/"
echo "  - docs/features/"
echo "  - docs/debugging/"
echo "  - docs/testing/"
echo "  - docs/deployment/"
echo "  - docs/security/"
echo "  - docs/cicd/"
echo "  - docs/project-history/"
echo "  - docs/quick-reference/"
echo ""

# Create directory structure
echo "Creating directory structure..."
mkdir -p docs/getting-started/{environment-setup,database-setup,admin-setup}
mkdir -p docs/architecture/{multi-catalog,backend}
mkdir -p docs/features/{dashboard/phases,catalog,orders,employees,brands,sites,celebration,email/visual-composer,erp,i18n,analytics}
mkdir -p docs/debugging/{authentication,jwt-errors,401-errors,backend-connection,deployment}
mkdir -p docs/testing/{automation/daily,setup}
mkdir -p docs/deployment/{checklists,environments,figma-make,scripts}
mkdir -p docs/security/{implementation,audits,production-hardening}
mkdir -p docs/cicd
mkdir -p docs/project-history/{weekly/{week1,week2,week3,week4,week5},phases,refactoring}
mkdir -p docs/quick-reference
mkdir -p docs/{config,accessibility,performance,compliance}

echo "✓ Directory structure created"
echo ""

# Function to move file if it exists
move_if_exists() {
    if [ -f "$1" ]; then
        mv "$1" "$2"
        echo "  ✓ Moved: $1 → $2"
    fi
}

echo "Organizing Getting Started documentation..."
move_if_exists "QUICK_START.md" "docs/getting-started/QUICK_START.md"
move_if_exists "DEVELOPER_GUIDE.md" "docs/getting-started/DEVELOPER_GUIDE.md"
move_if_exists "START_HERE.md" "docs/getting-started/START_HERE.md"

# Environment Setup
move_if_exists "ENVIRONMENT_SETUP_COMPLETE.md" "docs/getting-started/environment-setup/ENVIRONMENT_SETUP_COMPLETE.md"
move_if_exists "ENVIRONMENT_SETUP_INSTRUCTIONS.md" "docs/getting-started/environment-setup/ENVIRONMENT_SETUP_INSTRUCTIONS.md"
move_if_exists "SIMPLE_ENVIRONMENT_SETUP.md" "docs/getting-started/environment-setup/SIMPLE_ENVIRONMENT_SETUP.md"
move_if_exists "QUICK_SETUP_2_ENVIRONMENTS.md" "docs/getting-started/environment-setup/QUICK_SETUP_2_ENVIRONMENTS.md"
move_if_exists "SETUP_DEV_AND_PROD_PROJECTS.md" "docs/getting-started/environment-setup/SETUP_DEV_AND_PROD_PROJECTS.md"

# Database Setup
move_if_exists "DATABASE_INITIALIZATION_GUIDE.md" "docs/getting-started/database-setup/DATABASE_INITIALIZATION_GUIDE.md"
move_if_exists "STORAGE_SETUP.md" "docs/getting-started/database-setup/STORAGE_SETUP.md"

# Admin Setup
move_if_exists "ADMIN_SETUP.md" "docs/getting-started/admin-setup/ADMIN_SETUP.md"
move_if_exists "ADMIN_LOGIN_CREDENTIALS.md" "docs/getting-started/admin-setup/ADMIN_LOGIN_CREDENTIALS.md"
move_if_exists "BOOTSTRAP_FIX_SUMMARY.md" "docs/getting-started/admin-setup/BOOTSTRAP_FIX_SUMMARY.md"

echo ""
echo "Organizing Architecture documentation..."
move_if_exists "ARCHITECTURE.md" "docs/architecture/ARCHITECTURE.md"
move_if_exists "MULTI_SITE_IMPLEMENTATION.md" "docs/architecture/MULTI_SITE_IMPLEMENTATION.md"
move_if_exists "CLIENT_SITE_ARCHITECTURE.md" "docs/architecture/CLIENT_SITE_ARCHITECTURE.md"
move_if_exists "ACCESS_MANAGEMENT_ARCHITECTURE.md" "docs/architecture/ACCESS_MANAGEMENT_ARCHITECTURE.md"

# Multi-Catalog
move_if_exists "MULTI_CATALOG_ARCHITECTURE_PROPOSAL.md" "docs/architecture/multi-catalog/MULTI_CATALOG_ARCHITECTURE_PROPOSAL.md"
move_if_exists "MULTI_CATALOG_IMPLEMENTATION_PLAN.md" "docs/architecture/multi-catalog/MULTI_CATALOG_IMPLEMENTATION_PLAN.md"
move_if_exists "MULTI_CATALOG_COMPLETE.md" "docs/architecture/multi-catalog/MULTI_CATALOG_COMPLETE.md"
move_if_exists "MULTI_CATALOG_ROADMAP.md" "docs/architecture/multi-catalog/MULTI_CATALOG_ROADMAP.md"
move_if_exists "MULTI_CATALOG_CHECKLIST.md" "docs/architecture/multi-catalog/MULTI_CATALOG_CHECKLIST.md"

# Backend
move_if_exists "BACKEND_API_README.md" "docs/architecture/backend/BACKEND_API_README.md"

echo ""
echo "Organizing Features documentation..."

# Dashboard
move_if_exists "PROJECT_COMPLETE.md" "docs/features/dashboard/PROJECT_COMPLETE.md"
move_if_exists "DASHBOARD_PRODUCTION_READINESS_EVALUATION.md" "docs/features/dashboard/DASHBOARD_PRODUCTION_READINESS_EVALUATION.md"
move_if_exists "PHASE_1_COMPLETE.md" "docs/features/dashboard/phases/PHASE_1_COMPLETE.md"
move_if_exists "PHASE_1_SUMMARY.md" "docs/features/dashboard/phases/PHASE_1_SUMMARY.md"
move_if_exists "PHASE_2_COMPLETE.md" "docs/features/dashboard/phases/PHASE_2_COMPLETE.md"
move_if_exists "PHASE_2_SUMMARY.md" "docs/features/dashboard/phases/PHASE_2_SUMMARY.md"
move_if_exists "PHASE_3_COMPLETE.md" "docs/features/dashboard/phases/PHASE_3_COMPLETE.md"
move_if_exists "PHASE_3_SUMMARY.md" "docs/features/dashboard/phases/PHASE_3_SUMMARY.md"
move_if_exists "PHASE_4_COMPLETE.md" "docs/features/dashboard/phases/PHASE_4_COMPLETE.md"
move_if_exists "PHASE_4_SUMMARY.md" "docs/features/dashboard/phases/PHASE_4_SUMMARY.md"

# Catalog
move_if_exists "GIFT_CATALOG_INTEGRATION_COMPLETE.md" "docs/features/catalog/GIFT_CATALOG_INTEGRATION_COMPLETE.md"
move_if_exists "CATALOG_MIGRATION.md" "docs/features/catalog/CATALOG_MIGRATION.md"
move_if_exists "GIFT_MANAGEMENT_COMPLETE.md" "docs/features/catalog/GIFT_MANAGEMENT_COMPLETE.md"

# Orders
move_if_exists "ORDER_CREATION_COMPLETE.md" "docs/features/orders/ORDER_CREATION_COMPLETE.md"
move_if_exists "ORDER_MANAGEMENT_COMPLETE.md" "docs/features/orders/ORDER_MANAGEMENT_COMPLETE.md"
move_if_exists "ORDER_TRACKING_COMPLETE.md" "docs/features/orders/ORDER_TRACKING_COMPLETE.md"

# Employees
move_if_exists "EMPLOYEE_MANAGEMENT_COMPLETE.md" "docs/features/employees/EMPLOYEE_MANAGEMENT_COMPLETE.md"
move_if_exists "EMPLOYEE_DATA_IMPORT.md" "docs/features/employees/EMPLOYEE_DATA_IMPORT.md"

# Brands
move_if_exists "BRAND_MANAGEMENT_COMPLETE.md" "docs/features/brands/BRAND_MANAGEMENT_COMPLETE.md"

# Sites
move_if_exists "SITE_MANAGEMENT_COMPLETE.md" "docs/features/sites/SITE_MANAGEMENT_COMPLETE.md"
move_if_exists "SITE_GIFT_ASSIGNMENT_COMPLETE.md" "docs/features/sites/SITE_GIFT_ASSIGNMENT_COMPLETE.md"

# Celebration
move_if_exists "CELEBRATION_SYSTEM_COMPLETE.md" "docs/features/celebration/CELEBRATION_SYSTEM_COMPLETE.md"
move_if_exists "CELEBRATION_SYSTEM_SUMMARY.md" "docs/features/celebration/CELEBRATION_SYSTEM_SUMMARY.md"
move_if_exists "CELEBRATION_TESTING_GUIDE.md" "docs/features/celebration/CELEBRATION_TESTING_GUIDE.md"

# Email
move_if_exists "EMAIL_INTEGRATION_SUMMARY.md" "docs/features/email/EMAIL_INTEGRATION_SUMMARY.md"
move_if_exists "EMAIL_INTEGRATION_SETUP.md" "docs/features/email/EMAIL_INTEGRATION_SETUP.md"
move_if_exists "EMAIL_TEMPLATES_COMPLETE.md" "docs/features/email/EMAIL_TEMPLATES_COMPLETE.md"
move_if_exists "SHIPPING_EMAILS_COMPLETE.md" "docs/features/email/SHIPPING_EMAILS_COMPLETE.md"

# ERP
move_if_exists "ERP_BACKEND_IMPLEMENTATION_COMPLETE.md" "docs/features/erp/ERP_BACKEND_IMPLEMENTATION_COMPLETE.md"
move_if_exists "ERP_INTEGRATION_SYSTEM_SUMMARY.md" "docs/features/erp/ERP_INTEGRATION_SYSTEM_SUMMARY.md"
move_if_exists "ERP_IMPLEMENTATION_ROADMAP.md" "docs/features/erp/ERP_IMPLEMENTATION_ROADMAP.md"
move_if_exists "ERP_GETTING_STARTED_SAP.md" "docs/features/erp/ERP_GETTING_STARTED_SAP.md"

# i18n
move_if_exists "LANGUAGE_EXPANSION_COMPLETE.md" "docs/features/i18n/LANGUAGE_EXPANSION_COMPLETE.md"
move_if_exists "TRANSLATION_COMPLETION_SUMMARY.md" "docs/features/i18n/TRANSLATION_COMPLETION_SUMMARY.md"
move_if_exists "TRANSLATION_COVERAGE_COMPLETE.md" "docs/features/i18n/TRANSLATION_COVERAGE_COMPLETE.md"

# Analytics
move_if_exists "DAY26_ANALYTICS_DASHBOARD_COMPLETE.md" "docs/features/analytics/DAY26_ANALYTICS_DASHBOARD_COMPLETE.md"
move_if_exists "DAY27_CATALOG_ANALYTICS_COMPLETE.md" "docs/features/analytics/DAY27_CATALOG_ANALYTICS_COMPLETE.md"
move_if_exists "DAY28_ORDER_GIFTING_ANALYTICS_COMPLETE.md" "docs/features/analytics/DAY28_ORDER_GIFTING_ANALYTICS_COMPLETE.md"
move_if_exists "DAY29_EMPLOYEE_RECOGNITION_ANALYTICS_COMPLETE.md" "docs/features/analytics/DAY29_EMPLOYEE_RECOGNITION_ANALYTICS_COMPLETE.md"
move_if_exists "DAY30_EXPORT_REPORTING_SYSTEM_COMPLETE.md" "docs/features/analytics/DAY30_EXPORT_REPORTING_SYSTEM_COMPLETE.md"
move_if_exists "REPORTS_ANALYTICS_COMPLETE.md" "docs/features/analytics/REPORTS_ANALYTICS_COMPLETE.md"

echo ""
echo "Organizing Debugging documentation..."

# Authentication
move_if_exists "ADMIN_AUTH_DEBUG_GUIDE.md" "docs/debugging/authentication/ADMIN_AUTH_DEBUG_GUIDE.md"
move_if_exists "AUTHENTICATION_FIX_GUIDE.md" "docs/debugging/authentication/AUTHENTICATION_FIX_GUIDE.md"
move_if_exists "INVALID_LOGIN_TROUBLESHOOTING.md" "docs/debugging/authentication/INVALID_LOGIN_TROUBLESHOOTING.md"
move_if_exists "TOKEN_FIX_V2.md" "docs/debugging/authentication/TOKEN_FIX_V2.md"
move_if_exists "AUTHENTICATION_ERRORS_FIXED.md" "docs/debugging/authentication/AUTHENTICATION_ERRORS_FIXED.md"

# JWT Errors
move_if_exists "JWT_FIX_COMPLETE.md" "docs/debugging/jwt-errors/JWT_FIX_COMPLETE.md"
move_if_exists "JWT_ERROR_COMPLETE_FIX.md" "docs/debugging/jwt-errors/JWT_ERROR_COMPLETE_FIX.md"
move_if_exists "JWT_FIX_QUICK_CARD.md" "docs/debugging/jwt-errors/JWT_FIX_QUICK_CARD.md"
move_if_exists "FIX_INVALID_JWT_NOW.md" "docs/debugging/jwt-errors/FIX_INVALID_JWT_NOW.md"
move_if_exists "401_JWT_ERRORS_FIXED.md" "docs/debugging/jwt-errors/401_JWT_ERRORS_FIXED.md"

# 401 Errors
move_if_exists "COMPLETE_401_FIX.md" "docs/debugging/401-errors/COMPLETE_401_FIX.md"
move_if_exists "401_ERROR_FIX_COMPLETE.md" "docs/debugging/401-errors/401_ERROR_FIX_COMPLETE.md"
move_if_exists "SIMPLE_FIX_401_ERROR.md" "docs/debugging/401-errors/SIMPLE_FIX_401_ERROR.md"
move_if_exists "QUICK_FIX_401_ERRORS.md" "docs/debugging/401-errors/QUICK_FIX_401_ERRORS.md"
move_if_exists "FIX_401_ERROR.md" "docs/debugging/401-errors/FIX_401_ERROR.md"

# Backend Connection
move_if_exists "BACKEND_CONNECTION_TROUBLESHOOTING.md" "docs/debugging/backend-connection/BACKEND_CONNECTION_TROUBLESHOOTING.md"
move_if_exists "BACKEND_CONNECTION_FIX.md" "docs/debugging/backend-connection/BACKEND_CONNECTION_FIX.md"
move_if_exists "FAILED_TO_FETCH_FIX.md" "docs/debugging/backend-connection/FAILED_TO_FETCH_FIX.md"
move_if_exists "FAILED_TO_FETCH_FIX_SUMMARY.md" "docs/debugging/backend-connection/FAILED_TO_FETCH_FIX_SUMMARY.md"
move_if_exists "FIGMA_MAKE_FAILED_TO_FETCH_FIX.md" "docs/debugging/backend-connection/FIGMA_MAKE_FAILED_TO_FETCH_FIX.md"

# Deployment Debugging
move_if_exists "DEPLOYMENT_TROUBLESHOOTING.md" "docs/debugging/deployment/DEPLOYMENT_TROUBLESHOOTING.md"
move_if_exists "FIGMA_MAKE_TROUBLESHOOTING.md" "docs/debugging/deployment/FIGMA_MAKE_TROUBLESHOOTING.md"
move_if_exists "FIGMA_MAKE_PUBLISH_TROUBLESHOOTING.md" "docs/debugging/deployment/FIGMA_MAKE_PUBLISH_TROUBLESHOOTING.md"

# Error Summaries
move_if_exists "ALL_ERRORS_FIXED_SUMMARY.md" "docs/debugging/ALL_ERRORS_FIXED_SUMMARY.md"
move_if_exists "ERROR_FIXES_SUMMARY.md" "docs/debugging/ERROR_FIXES_SUMMARY.md"
move_if_exists "COMPLETE_FIX_SUMMARY.md" "docs/debugging/COMPLETE_FIX_SUMMARY.md"
move_if_exists "TROUBLESHOOTING.md" "docs/debugging/TROUBLESHOOTING.md"

echo ""
echo "Organizing Testing documentation..."
move_if_exists "TESTING.md" "docs/testing/TESTING.md"
move_if_exists "TESTING_QUICK_REFERENCE.md" "docs/testing/TESTING_QUICK_REFERENCE.md"
move_if_exists "TESTING_INSTRUCTIONS.md" "docs/testing/TESTING_INSTRUCTIONS.md"
move_if_exists "TESTING_IN_FIGMA_MAKE.md" "docs/testing/TESTING_IN_FIGMA_MAKE.md"
move_if_exists "TESTING_EXECUTIVE_SUMMARY.md" "docs/testing/TESTING_EXECUTIVE_SUMMARY.md"
move_if_exists "COMPLETE_TESTING_PROGRESS_FEB_12_2026.md" "docs/testing/COMPLETE_TESTING_PROGRESS_FEB_12_2026.md"

# Test Automation
move_if_exists "TEST_AUTOMATION_QUICKSTART.md" "docs/testing/automation/TEST_AUTOMATION_QUICKSTART.md"
move_if_exists "COMPREHENSIVE_TESTING_PLAN.md" "docs/testing/automation/COMPREHENSIVE_TESTING_PLAN.md"

# Daily test automation progress (Days 1-30)
for i in {1..30}; do
    move_if_exists "DAY${i}_TEST_AUTOMATION_COMPLETE.md" "docs/testing/automation/daily/DAY${i}_TEST_AUTOMATION_COMPLETE.md"
    move_if_exists "DAY${i}_COMPONENT_TESTING_COMPLETE.md" "docs/testing/automation/daily/DAY${i}_COMPONENT_TESTING_COMPLETE.md"
    move_if_exists "DAY${i}_COMPLETE.md" "docs/testing/automation/daily/DAY${i}_COMPLETE.md"
done

# Test Setup
move_if_exists "SETUP_TESTS_GUIDE.md" "docs/testing/setup/SETUP_TESTS_GUIDE.md"
move_if_exists "SETUP_TESTS_SUMMARY.md" "docs/testing/setup/SETUP_TESTS_SUMMARY.md"
move_if_exists "TEST_SETUP_COMPLETE.md" "docs/testing/setup/TEST_SETUP_COMPLETE.md"

echo ""
echo "Organizing Deployment documentation..."
move_if_exists "DEPLOYMENT_GUIDE.md" "docs/deployment/DEPLOYMENT_GUIDE.md"
move_if_exists "FULL_DEPLOYMENT_GUIDE.md" "docs/deployment/FULL_DEPLOYMENT_GUIDE.md"
move_if_exists "DEPLOYMENT_QUICK_START.md" "docs/deployment/DEPLOYMENT_QUICK_START.md"
move_if_exists "READY_TO_DEPLOY_NOW.md" "docs/deployment/READY_TO_DEPLOY_NOW.md"
move_if_exists "DEPLOYMENT_SUCCESS.md" "docs/deployment/DEPLOYMENT_SUCCESS.md"
move_if_exists "DEPLOYMENT_COMPLETE.md" "docs/deployment/DEPLOYMENT_COMPLETE.md"
move_if_exists "DEPLOYMENT_READY_FINAL_SUMMARY.md" "docs/deployment/DEPLOYMENT_READY_FINAL_SUMMARY.md"

# Deployment Checklists
move_if_exists "DEPLOYMENT_CHECKLIST.md" "docs/deployment/checklists/DEPLOYMENT_CHECKLIST.md"
move_if_exists "DEPLOYMENT_CHECKLIST_DETAILED.md" "docs/deployment/checklists/DEPLOYMENT_CHECKLIST_DETAILED.md"
move_if_exists "PRE_DEPLOYMENT_CHECKLIST.md" "docs/deployment/checklists/PRE_DEPLOYMENT_CHECKLIST.md"

# Environment-Specific
move_if_exists "DEV_DEPLOYMENT_GUIDE.md" "docs/deployment/environments/DEV_DEPLOYMENT_GUIDE.md"

# Figma Make Deployment
move_if_exists "DEPLOY_FROM_FIGMA_MAKE.md" "docs/deployment/figma-make/DEPLOY_FROM_FIGMA_MAKE.md"
move_if_exists "HOW_TO_PUBLISH_FIGMA_MAKE.md" "docs/deployment/figma-make/HOW_TO_PUBLISH_FIGMA_MAKE.md"
move_if_exists "FIGMA_MAKE_DEPLOYMENT_FIX.md" "docs/deployment/figma-make/FIGMA_MAKE_DEPLOYMENT_FIX.md"

# Deployment Scripts
move_if_exists "DEPLOYMENT_SCRIPTS_README.md" "docs/deployment/scripts/DEPLOYMENT_SCRIPTS_README.md"

echo ""
echo "Organizing Security documentation..."
move_if_exists "SECURITY.md" "docs/security/SECURITY.md"
move_if_exists "SECURITY_POLICY.md" "docs/security/SECURITY_POLICY.md"
move_if_exists "OWASP_COMPLIANCE.md" "docs/security/OWASP_COMPLIANCE.md"
move_if_exists "PRODUCTION_READINESS_AUDIT.md" "docs/security/PRODUCTION_READINESS_AUDIT.md"
move_if_exists "PRODUCTION_READINESS_REPORT.md" "docs/security/PRODUCTION_READINESS_REPORT.md"

# Security Implementation
move_if_exists "SECURITY_IMPLEMENTATION_COMPLETE.md" "docs/security/implementation/SECURITY_IMPLEMENTATION_COMPLETE.md"
move_if_exists "SECURITY_IMPLEMENTATION_SUMMARY.md" "docs/security/implementation/SECURITY_IMPLEMENTATION_SUMMARY.md"
move_if_exists "SECURITY_HARDENING.md" "docs/security/implementation/SECURITY_HARDENING.md"

# Security Audits
move_if_exists "SECURITY_AUDIT_SUMMARY.md" "docs/security/audits/SECURITY_AUDIT_SUMMARY.md"
move_if_exists "SECURITY_HARDENING_REPORT.md" "docs/security/audits/SECURITY_HARDENING_REPORT.md"
move_if_exists "FRONTEND_SECURITY_REPORT.md" "docs/security/audits/FRONTEND_SECURITY_REPORT.md"

# Production Hardening
move_if_exists "PRODUCTION_HARDENING_PLAN.md" "docs/security/production-hardening/PRODUCTION_HARDENING_PLAN.md"
move_if_exists "PRODUCTION_HARDENING_CHECKLIST.md" "docs/security/production-hardening/PRODUCTION_HARDENING_CHECKLIST.md"
move_if_exists "PRODUCTION_HARDENING_FINAL_REPORT.md" "docs/security/production-hardening/PRODUCTION_HARDENING_FINAL_REPORT.md"
move_if_exists "HARDENING_COMPLETE_SUMMARY.md" "docs/security/production-hardening/HARDENING_COMPLETE_SUMMARY.md"

echo ""
echo "Organizing CI/CD documentation..."
move_if_exists "CI_CD_COMPLETE_SUMMARY.md" "docs/cicd/CI_CD_COMPLETE_SUMMARY.md"
move_if_exists "CI_CD_FINAL_SUMMARY.md" "docs/cicd/CI_CD_FINAL_SUMMARY.md"
move_if_exists "CI_CD_SETUP_GUIDE.md" "docs/cicd/CI_CD_SETUP_GUIDE.md"
move_if_exists "CI_CD_SETUP_CHECKLIST.md" "docs/cicd/CI_CD_SETUP_CHECKLIST.md"
move_if_exists "CI_CD_QUICKSTART_5MIN.md" "docs/cicd/CI_CD_QUICKSTART_5MIN.md"
move_if_exists "CI_CD_QUICK_REFERENCE.md" "docs/cicd/CI_CD_QUICK_REFERENCE.md"
move_if_exists "CI_CD_FIGMA_MAKE_GUIDE.md" "docs/cicd/CI_CD_FIGMA_MAKE_GUIDE.md"
move_if_exists "CI_CD_PIPELINE_DIAGRAM.md" "docs/cicd/CI_CD_PIPELINE_DIAGRAM.md"
move_if_exists "CI_CD_DOCUMENTATION_INDEX.md" "docs/cicd/CI_CD_DOCUMENTATION_INDEX.md"

echo ""
echo "Organizing Project History documentation..."
move_if_exists "STATUS.md" "docs/project-history/STATUS.md"
move_if_exists "APPLICATION_STATUS.md" "docs/project-history/APPLICATION_STATUS.md"
move_if_exists "PLATFORM_STATUS_DASHBOARD.md" "docs/project-history/PLATFORM_STATUS_DASHBOARD.md"
move_if_exists "PROGRESS_TRACKER.md" "docs/project-history/PROGRESS_TRACKER.md"

# Weekly Progress
for week in 1 2 3 4 5; do
    move_if_exists "WEEK${week}_COMPLETE.md" "docs/project-history/weekly/week${week}/WEEK${week}_COMPLETE.md"
    move_if_exists "WEEK${week}_COMPLETE_SUMMARY.md" "docs/project-history/weekly/week${week}/WEEK${week}_COMPLETE_SUMMARY.md"
    move_if_exists "WEEK${week}_CELEBRATION.md" "docs/project-history/weekly/week${week}/WEEK${week}_CELEBRATION.md"
done

# Refactoring
move_if_exists "REFACTORING_PLAN.md" "docs/project-history/refactoring/REFACTORING_PLAN.md"
move_if_exists "REFACTORING_PROGRESS.md" "docs/project-history/refactoring/REFACTORING_PROGRESS.md"
move_if_exists "REFACTORING_COMPLETION_REPORT.md" "docs/project-history/refactoring/REFACTORING_COMPLETION_REPORT.md"
move_if_exists "REFACTORING_INDEX.md" "docs/project-history/refactoring/REFACTORING_INDEX.md"

# Phases
move_if_exists "P1.1_DYNAMIC_SITE_CONFIGURATION.md" "docs/project-history/phases/P1.1_DYNAMIC_SITE_CONFIGURATION.md"
move_if_exists "P1.2_COMPLETION_SUMMARY.md" "docs/project-history/phases/P1.2_COMPLETION_SUMMARY.md"
move_if_exists "P1.3_CLEANUP_COMPLETE.md" "docs/project-history/phases/P1.3_CLEANUP_COMPLETE.md"
move_if_exists "PHASE_2_INFRASTRUCTURE_COMPLETE.md" "docs/project-history/phases/PHASE_2_INFRASTRUCTURE_COMPLETE.md"
move_if_exists "PHASE_3_BACKEND_REFACTORING_COMPLETE.md" "docs/project-history/phases/PHASE_3_BACKEND_REFACTORING_COMPLETE.md"
move_if_exists "PHASE_4_FRONTEND_REFACTORING_COMPLETE.md" "docs/project-history/phases/PHASE_4_FRONTEND_REFACTORING_COMPLETE.md"

echo ""
echo "Organizing Quick Reference documentation..."
move_if_exists "QUICK_REFERENCE.md" "docs/quick-reference/QUICK_REFERENCE.md"
move_if_exists "QUICK_REFERENCE_CARD.md" "docs/quick-reference/QUICK_REFERENCE_CARD.md"
move_if_exists "DEVELOPER_QUICK_REFERENCE.md" "docs/quick-reference/DEVELOPER_QUICK_REFERENCE.md"
move_if_exists "EMAIL_QUICK_REFERENCE.md" "docs/quick-reference/EMAIL_QUICK_REFERENCE.md"
move_if_exists "ERP_QUICK_REFERENCE.md" "docs/quick-reference/ERP_QUICK_REFERENCE.md"
move_if_exists "ENVIRONMENT_QUICK_REFERENCE.md" "docs/quick-reference/ENVIRONMENT_QUICK_REFERENCE.md"
move_if_exists "TESTING_QUICK_REFERENCE.md" "docs/quick-reference/TESTING_QUICK_REFERENCE.md"
move_if_exists "SECURITY_QUICK_REFERENCE.md" "docs/quick-reference/SECURITY_QUICK_REFERENCE.md"

echo ""
echo "Organizing Configuration documentation..."
move_if_exists "CONFIGURATION_MANAGEMENT.md" "docs/config/CONFIGURATION_MANAGEMENT.md"
move_if_exists "CONFIGURATION_QUICK_REFERENCE.md" "docs/config/CONFIGURATION_QUICK_REFERENCE.md"
move_if_exists "ENVIRONMENT_SYSTEM_GUIDE.md" "docs/config/ENVIRONMENT_SYSTEM_GUIDE.md"

echo ""
echo "Organizing Accessibility documentation..."
move_if_exists "ACCESSIBILITY.md" "docs/accessibility/ACCESSIBILITY.md"
move_if_exists "ACCESSIBILITY_AUDIT_SUMMARY.md" "docs/accessibility/ACCESSIBILITY_AUDIT_SUMMARY.md"

echo ""
echo "Organizing Performance documentation..."
move_if_exists "PERFORMANCE_OPTIMIZATION.md" "docs/performance/PERFORMANCE_OPTIMIZATION.md"

echo ""
echo "Organizing Compliance documentation..."
move_if_exists "COMPLIANCE_SUMMARY.md" "docs/compliance/COMPLIANCE_SUMMARY.md"

echo ""
echo "=================================================="
echo "✅ Documentation organization complete!"
echo "=================================================="
echo ""
echo "Documentation is now organized in /docs/"
echo ""
echo "View the index at: docs/INDEX.md"
echo ""
echo "Next steps:"
echo "  1. Review the new structure: cd docs && ls -la"
echo "  2. Check the INDEX.md for navigation"
echo "  3. Update any internal documentation links"
echo ""
