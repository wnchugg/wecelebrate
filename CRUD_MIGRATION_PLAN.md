# CRUD API Migration Plan

**Date:** February 9, 2026  
**Phase:** 3.2 API Migration  
**Goal:** Migrate all existing CRUD routes to use the CRUD factory

---

## 📋 **Migration Overview**

This document outlines the plan to migrate existing manual CRUD routes to the new CRUD factory.

---

## 🎯 **Resources to Migrate**

### **Priority 1: Core Resources** (High Traffic)
1. ✅ **Clients** - Client management
2. ✅ **Sites** - Site configuration
3. ✅ **Gifts/Products** - Gift catalog
4. ✅ **Orders** - Order processing

### **Priority 2: User Management** (Medium Traffic)
5. ✅ **Employees** - Employee records
6. ✅ **Admin Users** - Admin user management
7. ✅ **Roles** - RBAC roles
8. ✅ **Access Groups** - RBAC access groups

### **Priority 3: Configuration** (Low Traffic)
9. ✅ **Email Templates** - Email templates
10. ✅ **Page Configurations** - WIX-like page editor
11. ✅ **Celebrations** - Celebration events
12. ✅ **Brands** - Brand configurations

---

## 🔄 **Migration Strategy**

### **Phase 1: Preparation**
- [x] Analyze existing routes
- [x] Create type definitions
- [x] Plan validation rules
- [ ] Backup current implementation

### **Phase 2: Core Migration**
- [ ] Migrate Clients
- [ ] Migrate Sites
- [ ] Migrate Gifts
- [ ] Migrate Orders

### **Phase 3: User Management**
- [ ] Migrate Employees
- [ ] Migrate Admin Users
- [ ] Migrate Roles
- [ ] Migrate Access Groups

### **Phase 4: Configuration**
- [ ] Migrate Email Templates
- [ ] Migrate Page Configurations
- [ ] Migrate Celebrations
- [ ] Migrate Brands

### **Phase 5: Testing & Cleanup**
- [ ] Test all migrated routes
- [ ] Remove old code
- [ ] Update documentation
- [ ] Deploy to production

---

## 📝 **Migration Checklist per Resource**

For each resource:
- [ ] Extract existing validation logic
- [ ] Define TypeScript interface
- [ ] Create validation function
- [ ] Create transformation function (if needed)
- [ ] Create access control function (if needed)
- [ ] Replace routes with factory call
- [ ] Test CRUD operations
- [ ] Update documentation

---

## 🎯 **Expected Benefits**

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| Lines per resource | ~150 | ~10-20 | 85-90% reduction |
| Validation coverage | Partial | 100% | Complete |
| Audit logging | Manual | Automatic | Consistent |
| Error handling | Varies | Standard | Uniform |
| Pagination | Manual | Automatic | Built-in |

---

**Status:** Ready to begin migration 🚀
