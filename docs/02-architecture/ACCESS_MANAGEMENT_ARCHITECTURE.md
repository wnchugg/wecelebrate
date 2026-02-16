# Access Management Architecture

## Overview

The JALA 2 platform has **two distinct types of access management** that serve different purposes:

---

## 1. Admin User Management (Global)

**Purpose:** Controls which HALO employees can access the admin platform and manage client sites.

**Location:** `/admin/users` (Global Settings)

**Access Level:** Super Admin only

### Key Features:
- ✅ Role-based access control (RBAC)
- ✅ Manage HALO employee accounts
- ✅ Control site access permissions per admin user
- ✅ Track admin activity and last login times

### Admin Roles:

#### Super Admin
- Full system access
- Create, edit, delete all sites
- Manage admin users and roles
- Access all orders and reports
- Configure global settings
- Manage gift catalog

#### Site Manager
- Create and manage assigned sites
- Configure site settings
- Manage site access controls
- View and manage orders
- Assign products to sites
- Cannot manage admin users

#### Content Editor
- Edit site content and branding
- Manage email templates
- Update product descriptions
- View orders (read-only)
- Cannot change access controls
- Cannot delete sites

#### Viewer
- Read-only access
- View sites and configurations
- View orders and reports
- Cannot make any changes
- Cannot access user management

### Use Cases:
```
✅ Sarah (Site Manager) can manage TechCorp and RetailCo sites
✅ Mike (Content Editor) can only edit content on his assigned sites
✅ Lisa (Viewer) can view all sites but make no changes
✅ Admin user gets deactivated when they leave HALO
```

### Security Features:
- Account lockout after failed login attempts
- Session timeout (30 minutes)
- Security audit logging
- Role-based permissions enforcement
- Site access restrictions per user

---

## 2. Site-Specific Access Management

**Purpose:** Controls which client employees can access each individual gifting portal.

**Location:** `/admin/access` (Site-Specific Settings - requires site selection)

**Access Level:** Site Manager and Super Admin

### Key Features:
- ✅ Configure validation method per site
- ✅ Manage authorized users per site (emails, employee IDs, serial cards)
- ✅ Import bulk user lists via CSV
- ✅ Domain whitelisting for email validation

### Validation Methods:

#### Email Address Validation
- Maintain list of authorized email addresses
- Optional domain whitelisting (e.g., `@techcorp.com`)
- Import/export email lists
- Use case: Tech companies with corporate email addresses

#### Employee ID Validation
- Maintain list of authorized employee ID numbers
- Bulk import from HR systems
- Format validation
- Use case: Large enterprises with employee ID systems

#### Serial Card Validation
- Generate unique card numbers
- Track card status (active, used, expired)
- Print-friendly format for physical cards
- Use case: Events where pre-printed cards are distributed

#### Magic Link Validation
- Send unique access links via email
- Time-limited, single-use links
- No pre-registration required
- Use case: Quick deployments, external contractors

### Data Isolation:

```
Site A: TechCorp Holiday 2026
├── Validation: Email
├── Allowed Domains: techcorp.com
└── Authorized Users: 1,500 employees

Site B: RetailCo Anniversary
├── Validation: Serial Card
├── Card Count: 500 cards
└── Authorized Users: Different set of 500 employees

❌ TechCorp employees CANNOT access RetailCo's site
❌ RetailCo employees CANNOT access TechCorp's site
✅ Each site has complete data isolation
```

### Privacy & Compliance:
- **GDPR Article 5(1)(c):** Data minimization - only collect necessary data
- **CCPA §1798.100:** Purpose limitation - access lists used only for validation
- **SOC 2 Type II:** Data segregation between clients
- Client A cannot see Client B's employee lists

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────┐
│           HALO Admin Platform (Internal)            │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ┌───────────────────────────────────────────┐    │
│  │   ADMIN USER MANAGEMENT (Global)          │    │
│  │   /admin/users                            │    │
│  │                                           │    │
│  │   Controls: HALO Employee Access          │    │
│  │   - Super Admin (full access)             │    │
│  │   - Site Manager (assigned sites)         │    │
│  │   - Content Editor (content only)         │    │
│  │   - Viewer (read-only)                    │    │
│  └───────────────────────────────────────────┘    │
│                                                     │
│  ┌───────────────────────────────────────────┐    │
│  │   SITE-SPECIFIC ACCESS MANAGEMENT         │    │
│  │   /admin/access (requires site selection) │    │
│  │                                           │    │
│  │   Site A: TechCorp                        │    │
│  │   └── Email validation (1,500 users)      │    │
│  │                                           │    │
│  │   Site B: RetailCo                        │    │
│  │   └── Serial card (500 cards)             │    │
│  │                                           │    │
│  │   Site C: FinanceCorp                     │    │
│  │   └── Employee ID (2,000 IDs)             │    │
│  └───────────────────────────────────────────┘    │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

## Navigation Structure

### Global Settings (Always Visible)
```
📁 Global
├── 🌍 All Sites (/admin/sites)
└── 🛡️ Admin Users (/admin/users) ← HALO employees
```

### Site-Specific Settings (Visible when site selected)
```
📁 Site Settings (requires site selection)
├── 📊 Dashboard
├── ⚙️ Site Configuration
├── ✉️ Email Templates
├── 📦 Product Assignment
├── 🚚 Shipping Configuration
├── 👥 Access Management ← Client employees
└── 🛒 Order Management
```

---

## Key Differences

| Feature | Admin User Management | Site Access Management |
|---------|----------------------|------------------------|
| **Scope** | Global | Per-Site |
| **Users** | HALO employees | Client employees |
| **Purpose** | Control admin access | Control end-user access |
| **Roles** | Super Admin, Site Manager, Editor, Viewer | End-users (no roles) |
| **Location** | `/admin/users` | `/admin/access` |
| **Access** | Super Admin only | Super Admin + Site Manager |
| **Data Sharing** | Shared across HALO | Isolated per client |

---

## Best Practices

### For Admin User Management:
1. **Principle of Least Privilege:** Grant only necessary permissions
2. **Regular Audits:** Review admin user access quarterly
3. **Deactivate Immediately:** When HALO employees leave the company
4. **Strong Authentication:** Enforce MFA for all admin accounts
5. **Site Assignment:** Limit Site Managers to only their assigned clients

### For Site Access Management:
1. **Data Isolation:** Never share access lists between sites
2. **Method Selection:** Choose validation method based on client needs
3. **Bulk Import:** Use CSV import for large user lists
4. **Domain Validation:** Use domain whitelisting when possible
5. **Expiration:** Set expiration dates for serial cards and magic links
6. **Audit Trail:** Log all access attempts and validations

---

## Security Considerations

### Admin User Management:
- ✅ Session timeout (30 minutes)
- ✅ Rate limiting (5 attempts per 15 minutes)
- ✅ Security audit logging
- ✅ Role-based permissions
- ⚠️ TODO: Implement MFA/2FA
- ⚠️ TODO: IP whitelisting for admin access

### Site Access Management:
- ✅ Per-site data isolation
- ✅ Input sanitization for user lists
- ✅ GDPR/CCPA compliance
- ✅ PII detection and handling
- ⚠️ TODO: Rate limiting on validation endpoints
- ⚠️ TODO: Suspicious activity detection

---

## Implementation Status

### ✅ Completed
- Admin User Management UI created
- Site-specific Access Management with site selector
- Navigation structure updated
- Role definitions and permissions
- Breadcrumb navigation
- Access control checks

### ⚠️ In Progress
- Backend API integration
- Database schema for user management
- Authentication token system
- RBAC enforcement middleware

### 📋 TODO
- Multi-factor authentication (MFA)
- Password reset workflow
- Bulk user import functionality
- CSV export capabilities
- Advanced filtering and search
- Activity monitoring dashboard

---

## Related Documentation

- [SECURITY_AUDIT_SUMMARY.md](/SECURITY_AUDIT_SUMMARY.md) - Comprehensive security audit
- [AdminContext.tsx](/src/app/context/AdminContext.tsx) - Admin authentication logic
- [SiteContext.tsx](/src/app/context/SiteContext.tsx) - Site management logic
- [AdminUserManagement.tsx](/src/app/pages/admin/AdminUserManagement.tsx) - Admin users UI
- [AccessManagement.tsx](/src/app/pages/admin/AccessManagement.tsx) - Site access UI

---

**Last Updated:** February 6, 2026  
**Version:** 1.0.0  
**Status:** Architecture Defined ✅
