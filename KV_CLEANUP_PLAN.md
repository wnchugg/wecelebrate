# KV Store Cleanup Plan

## Overview
Remove old KV-based CRUD endpoints that have been replaced by v2 database-backed endpoints.

## Endpoints to Remove

### 1. Employee CRUD (Lines 6270-6475)
- `GET /sites/:siteId/employees` - Replaced by `GET /v2/employees?site_id=:siteId`
- `POST /sites/:siteId/employees` - Replaced by `POST /v2/employees`
- `GET /employees/:id` - Replaced by `GET /v2/employees/:id`
- `PUT /employees/:id` - Replaced by `PUT /v2/employees/:id`
- `DELETE /employees/:id` - Replaced by `DELETE /v2/employees/:id`

### 2. Order CRUD (Lines 3816-3986)
- `POST /orders` - Replaced by `POST /v2/orders`
- `GET /orders/:id` - Replaced by `GET /v2/orders/:id`
- `PUT /orders/:id` - Replaced by `PUT /v2/orders/:id`

### 3. Site Update (Line 3696-3733)
- `PUT /sites/:siteId` - Replaced by `PUT /v2/sites/:id`

## Endpoints to Keep (Special Features)

### Site Features
- `GET /sites/:siteId/gift-config` - Gift assignment logic
- `PUT /sites/:siteId/gift-config` - Gift assignment strategy
- `GET /sites/:siteId/gifts` - Filtered gift catalog
- `GET /sites/:siteId/catalog-stats` - Catalog statistics
- `GET /sites/:siteId/categories` - Available categories
- `GET /sites/:siteId/gifts/:giftId/availability` - Gift availability check

### Employee Features
- `/employees/:employeeId/roles` - Role assignments
- `/employees/:employeeId/access-groups` - Access group assignments
- `/clients/:clientId/employees` - Filtered employee query
- `/clients/:clientId/employees/import` - CSV import
- `/employees/import` - Bulk import

### Client Features
- `/clients/:clientId/mapping-rules` - SFTP mapping rules
- `/clients/:clientId/sftp-config` - SFTP configuration
- `/clients/:clientId/erp-assignments` - ERP assignments

### Other Features
- Roles management
- Access groups management
- Admin users management
- Brands management
- Email templates
- Automation rules
- Webhooks
- Scheduled emails
- Dashboard analytics
- Public endpoints

## Impact Analysis

### Low Risk
- Old endpoints are not used by frontend (already migrated to v2)
- V2 endpoints are fully tested and working
- Backward compatibility not needed

### Benefits
- Reduced code complexity
- Easier maintenance
- Clearer codebase structure
- Removes ~400 lines of deprecated code

## Execution Plan

1. Remove old employee CRUD endpoints (5 endpoints)
2. Remove old order CRUD endpoints (3 endpoints)
3. Remove old site update endpoint (1 endpoint)
4. Test that v2 endpoints still work
5. Deploy changes
6. Monitor for any issues

## Rollback Plan

If issues arise:
- Git revert the changes
- Redeploy previous version
- Old code is preserved in git history
