# 🗺️ JALA 2 - Feature Completion Roadmap

**Goal:** Complete all critical features to achieve production-ready status  
**Timeline:** 3-4 weeks (132 development hours)  
**Current Completion:** 75% → Target: 95%+

---

## 📅 WEEK 1: User-Facing Features (40 hours)

### **Day 1-2: Celebration System** (14 hours)

#### Backend Work (8 hours)
**Create New Endpoints:**

```typescript
// 1. Get celebrations for employee
GET /public/celebrations/:employeeId
Response: { celebrations: CelebrationMessage[] }

// 2. Create celebration message
POST /public/celebrations
Body: {
  recipientId: string;
  milestoneId: string;
  message: string;
  eCardId?: string;
  from: string;
}

// 3. Send celebration invite
POST /public/celebrations/invite
Body: {
  celebrationId: string;
  email: string;
}

// 4. Get celebration by ID (for shared links)
GET /public/celebrations/:id
Response: CelebrationMessage
```

**Backend Files to Create/Update:**
- `/supabase/functions/server/celebrations.ts` (new module)
- `/supabase/functions/server/index.tsx` (add routes)

#### Frontend Work (6 hours)
**Files to Update:**
1. `/src/app/pages/Welcome.tsx`
   - Remove mock data (line 28)
   - Add API call to fetch celebrations
   - Integrate eCard display

2. `/src/app/pages/CelebrationCreate.tsx`
   - Implement handleSubmit (line 116)
   - Implement handleSendInvite (line 138)
   - Add form validation
   - Add success/error handling

3. `/src/app/pages/Celebration.tsx`
   - Connect to real celebration data
   - Add sharing functionality

**Acceptance Criteria:**
- ✅ Employees can view celebration messages on Welcome page
- ✅ Users can create celebration messages with eCards
- ✅ Email invites send successfully
- ✅ Share links work correctly
- ✅ No mock data used

---

### **Day 3: Order History** (8 hours)

#### Backend Work (4 hours)
**Create Endpoint:**

```typescript
GET /public/employees/:employeeId/orders
Query Params: {
  status?: string;
  limit?: number;
  offset?: number;
}
Response: {
  orders: Order[];
  total: number;
}
```

**Implementation:**
- Add route to `/supabase/functions/server/index.tsx`
- Fetch orders from kv_store with employee filter
- Include gift details, shipping info, tracking
- Add pagination support

#### Frontend Work (4 hours)
**Files to Update:**
1. `/src/app/pages/OrderHistory.tsx`
   - Remove TODO comment (line 46)
   - Remove mock toast (line 49)
   - Add API integration
   - Display order cards
   - Add order status filtering
   - Add order detail modal
   - Add tracking link

**Acceptance Criteria:**
- ✅ Employees can view their order history
- ✅ Orders show correct status and details
- ✅ Can filter by status
- ✅ Can view tracking information
- ✅ Pagination works for many orders

---

### **Day 4-5: Analytics & Reporting** (16 hours)

#### Backend Work (10 hours)
**Create Analytics Module:**

```typescript
// 1. Order Analytics
GET /analytics/orders
Query: { startDate?, endDate?, siteId?, clientId? }
Response: {
  totalOrders: number;
  totalRevenue: number;
  ordersByStatus: Record<string, number>;
  ordersOverTime: Array<{ date: string; count: number }>;
  averageOrderValue: number;
}

// 2. Gift Analytics
GET /analytics/gifts
Response: {
  totalGifts: number;
  popularGifts: Array<{ gift: Gift; orderCount: number }>;
  giftsByCategory: Record<string, number>;
  inventoryStatus: { low: number; adequate: number; high: number };
}

// 3. Employee Analytics
GET /analytics/employees
Response: {
  totalEmployees: number;
  activeEmployees: number;
  employeesBySite: Record<string, number>;
  employeesByDepartment: Record<string, number>;
}

// 4. Revenue Analytics
GET /analytics/revenue
Response: {
  totalRevenue: number;
  revenueByMonth: Array<{ month: string; revenue: number }>;
  revenueBySite: Array<{ site: Site; revenue: number }>;
}
```

**Implementation:**
- Create `/supabase/functions/server/analytics.ts`
- Aggregate data from kv_store
- Add caching for performance
- Support date range filtering

#### Frontend Work (6 hours)
**Files to Update:**

1. `/src/app/pages/admin/Dashboard.tsx`
   - Remove mock data
   - Fetch real analytics
   - Add date range selector
   - Update charts with real data

2. `/src/app/pages/admin/SystemAdminDashboard.tsx`
   - Remove mock data
   - Fetch system-wide analytics
   - Add export to CSV functionality

3. `/src/app/pages/admin/ClientDashboard.tsx`
   - Remove mock data (line 8)
   - Fetch client-specific analytics
   - Add comparison charts

4. `/src/app/pages/admin/Analytics.tsx`
   - Connect to real analytics endpoints
   - Add advanced filtering
   - Add export functionality

5. `/src/app/pages/admin/Reports.tsx`
   - Create report generation
   - Add scheduled reports
   - Add email delivery

**Acceptance Criteria:**
- ✅ All dashboards show real data
- ✅ Date range filtering works
- ✅ Charts update dynamically
- ✅ Export to CSV works
- ✅ Reports can be generated on-demand
- ✅ No mock data anywhere

---

### **Day 6: Mock Data Cleanup** (6 hours)

#### Tasks:
1. **Search & Destroy Mock Data** (3 hours)
   - Search codebase for "mock", "placeholder", "fake"
   - Remove `/src/app/data/mockGiftFlow.ts` if unused
   - Update EventCard.tsx (line 39)
   - Check SecurityDashboard.tsx (line 49)
   - Verify AdminUserManagement.tsx (line 74)

2. **Verify All API Integrations** (2 hours)
   - Test each admin page
   - Verify data persists on refresh
   - Check error handling
   - Ensure no console errors

3. **Update Documentation** (1 hour)
   - Mark features as "Real API" in docs
   - Update API endpoint list
   - Remove references to mock data

**Acceptance Criteria:**
- ✅ No mock data in production code
- ✅ All features use real backend
- ✅ Data persists correctly
- ✅ Documentation updated

---

## 📅 WEEK 2: Integrations (36 hours)

### **Day 1-2: Email Service Completion** (8 hours)

#### Backend Work (5 hours)
**Tasks:**

1. **Order Confirmation Integration** (2 hours)
   - Update order creation endpoint
   - Trigger email automatically on order creation
   - Include order details, gift info, tracking
   - Test with real Resend API

2. **Shipping Notification System** (2 hours)
   - Add webhook/trigger for status changes
   - Send email when order status → "Shipped"
   - Include tracking number
   - Add delivery confirmation email

3. **Email Queue System** (1 hour)
   - Create email queue in kv_store
   - Add retry logic for failed sends
   - Add rate limiting (Resend limits)

**Files:**
- `/supabase/functions/server/index.tsx` - Update order creation
- `/supabase/functions/server/email.ts` - Add queue system

#### Frontend Work (3 hours)
**Tasks:**

1. **Email Preview** (1 hour)
   - Add live preview to EmailTemplates page
   - Show variable substitution

2. **Email Analytics** (2 hours)
   - Track email sends
   - Show delivery status
   - Add email history viewer

**Acceptance Criteria:**
- ✅ Order confirmation emails send automatically
- ✅ Shipping notifications work
- ✅ Email queue handles failures gracefully
- ✅ Rate limiting prevents API overuse
- ✅ Email history visible in admin

---

### **Day 3-4: File Upload System** (12 hours)

#### Backend Work (6 hours)
**Tasks:**

1. **Supabase Storage Setup** (2 hours)
   ```typescript
   // Create buckets
   const buckets = [
     'gift-images',
     'site-logos',
     'brand-logos',
     'employee-photos'
   ];
   ```

2. **Upload Endpoints** (3 hours)
   ```typescript
   POST /upload/image
   Body: FormData with file
   Response: { url: string; id: string }

   DELETE /upload/image/:id
   Response: { success: boolean }

   GET /upload/images
   Response: { images: Array<{id, url, size, uploadedAt}> }
   ```

3. **Image Processing** (1 hour)
   - Add image validation (size, type)
   - Generate thumbnails
   - Add image optimization

**Files:**
- `/supabase/functions/server/upload.ts` (new)
- `/supabase/functions/server/index.tsx` (add routes)

#### Frontend Work (6 hours)
**Tasks:**

1. **Upload Component** (3 hours)
   - Create `ImageUpload.tsx`
   - Drag & drop support
   - Multiple file upload
   - Progress indicator
   - Preview before upload
   - Crop/resize tool

2. **Integration** (3 hours)
   - Update GiftManagement forms
   - Update BrandManagement forms
   - Update SiteManagement forms
   - Replace URL inputs with upload option
   - Allow both URL and file upload

**Files to Create/Update:**
- `/src/app/components/ImageUpload.tsx` (new)
- `/src/app/pages/admin/GiftManagement.tsx`
- `/src/app/pages/admin/BrandManagement.tsx`
- `/src/app/pages/admin/SiteManagement.tsx`

**Acceptance Criteria:**
- ✅ Users can upload images via drag & drop
- ✅ Images stored in Supabase Storage
- ✅ Thumbnails generated automatically
- ✅ File size limits enforced
- ✅ Image URLs work in production
- ✅ Can delete uploaded images

---

### **Day 5-6-7: Shipping Integration** (24 hours)

⚠️ **DECISION POINT:** This is a complex integration. Consider:
- **Option A:** Full carrier integration (24 hours)
- **Option B:** Manual shipping workflow (4 hours)
- **Option C:** Delay to post-launch (0 hours now)

#### Option A: Full Integration (24 hours)

**Backend Work (16 hours):**

1. **Choose Integration Partner** (2 hours)
   - ShipEngine (recommended - multi-carrier)
   - EasyPost
   - Direct carrier APIs

2. **Carrier Setup** (6 hours)
   ```typescript
   POST /shipping/carriers
   Body: { name, apiKey, config }
   
   GET /shipping/carriers
   Response: Carrier[]
   
   POST /shipping/calculate-rate
   Body: {
     weight: number;
     dimensions: Dimensions;
     origin: Address;
     destination: Address;
   }
   Response: { rates: ShippingRate[] }
   
   POST /shipping/create-label
   Body: {
     orderId: string;
     carrierId: string;
     serviceType: string;
   }
   Response: {
     trackingNumber: string;
     labelUrl: string;
     cost: number;
   }
   
   GET /shipping/track/:trackingNumber
   Response: TrackingInfo
   ```

3. **Integration with Orders** (4 hours)
   - Auto-calculate shipping on checkout
   - Generate label when order status → Processing
   - Update tracking number in order
   - Webhook for tracking updates

4. **Testing** (4 hours)
   - Test with sandbox/test accounts
   - Verify label generation
   - Test tracking updates
   - Handle errors gracefully

**Frontend Work (8 hours):**

1. **Shipping Configuration Page** (4 hours)
   - Carrier management CRUD
   - Test connection
   - Configure shipping zones
   - Set rate rules

2. **Order Shipping UI** (4 hours)
   - Show shipping options at checkout
   - Display tracking number in order details
   - Add "Generate Label" button
   - Show tracking status timeline

**Acceptance Criteria:**
- ✅ Shipping rates calculated automatically
- ✅ Labels generated from admin
- ✅ Tracking numbers stored with orders
- ✅ Tracking updates show in UI
- ✅ Multiple carriers supported

#### Option B: Manual Workflow (4 hours)

**Backend Work (2 hours):**
```typescript
PUT /orders/:id/shipping
Body: {
  carrier: string;
  trackingNumber: string;
  shippingCost: number;
}
```

**Frontend Work (2 hours):**
- Add manual tracking number input
- Add shipping cost input
- Add carrier dropdown

**Acceptance Criteria:**
- ✅ Admin can manually enter tracking numbers
- ✅ Tracking links work for major carriers
- ✅ Shipping costs can be added manually

---

## 📅 WEEK 3: Polish & Security (30 hours)

### **Day 1-2-3: Access Management & RBAC** (16 hours)

#### Backend Work (10 hours)

1. **Define Roles** (2 hours)
   ```typescript
   enum Role {
     SUPER_ADMIN = 'super_admin',
     ADMIN = 'admin',
     MANAGER = 'manager',
     VIEWER = 'viewer'
   }
   
   const permissions = {
     super_admin: ['*'],
     admin: [
       'clients.read', 'clients.write',
       'sites.read', 'sites.write',
       'gifts.read', 'gifts.write',
       'orders.read', 'orders.write',
       'employees.read', 'employees.write'
     ],
     manager: [
       'orders.read', 'orders.write',
       'employees.read', 'employees.write',
       'gifts.read'
     ],
     viewer: [
       'orders.read',
       'employees.read',
       'gifts.read'
     ]
   };
   ```

2. **Permission Middleware** (4 hours)
   ```typescript
   function requirePermission(permission: string) {
     return async (c: Context, next: Next) => {
       const user = c.get('user');
       const userPermissions = permissions[user.role];
       
       if (!userPermissions.includes(permission) && !userPermissions.includes('*')) {
         return c.json({ error: 'Forbidden' }, 403);
       }
       
       await next();
     };
   }
   ```

3. **Update All Protected Routes** (4 hours)
   - Add permission checks to each route
   - Test permission enforcement
   - Add audit logging for permission denials

#### Frontend Work (6 hours)

1. **Role Management UI** (3 hours)
   - Update AdminUserManagement
   - Add role selector
   - Show permissions for each role
   - Prevent users from elevating own role

2. **UI Permission Enforcement** (3 hours)
   - Hide/disable features based on role
   - Show permission denied messages
   - Add role indicator in header

**Files:**
- `/supabase/functions/server/permissions.ts` (new)
- `/supabase/functions/server/middleware.ts` (update)
- `/src/app/pages/admin/AdminUserManagement.tsx`
- `/src/app/context/AdminContext.tsx` (add permissions)

**Acceptance Criteria:**
- ✅ 4 distinct roles exist
- ✅ Permissions enforced on backend
- ✅ UI reflects user permissions
- ✅ Cannot escalate own permissions
- ✅ Audit logs permission denials

---

### **Day 4: Audit Logs Enhancement** (8 hours)

#### Backend Work (4 hours)

**Create Endpoint:**
```typescript
GET /audit-logs
Query: {
  userId?: string;
  action?: string;
  resource?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
}
Response: {
  logs: AuditLog[];
  total: number;
}

GET /audit-logs/export
Query: same as above
Response: CSV file
```

#### Frontend Work (4 hours)

**Update `/src/app/pages/admin/AuditLogs.tsx`:**
1. Remove mock data
2. Add advanced filtering UI
3. Add export to CSV button
4. Add detail modal for each log
5. Add charts:
   - Events over time
   - Events by type
   - Events by user

**Acceptance Criteria:**
- ✅ All audit logs displayed
- ✅ Filtering works (user, action, resource, date)
- ✅ Export to CSV
- ✅ Detail view shows all log fields
- ✅ Charts visualize security events

---

### **Day 5: CSRF Server Validation** (4 hours)

#### Backend Work (4 hours)

**Add CSRF Middleware:**
```typescript
// /supabase/functions/server/security.ts

function validateCSRF(c: Context, next: Next) {
  const csrfToken = c.req.header('X-CSRF-Token');
  const sessionToken = c.req.header('Authorization')?.replace('Bearer ', '');
  
  if (!csrfToken || !sessionToken) {
    return c.json({ error: 'Missing CSRF token' }, 403);
  }
  
  // Validate CSRF token matches session
  const expectedToken = generateCSRFToken(sessionToken);
  if (csrfToken !== expectedToken) {
    return c.json({ error: 'Invalid CSRF token' }, 403);
  }
  
  await next();
}

// Apply to all state-changing routes
app.post('/make-server-6fcaeea3/*', validateCSRF);
app.put('/make-server-6fcaeea3/*', validateCSRF);
app.delete('/make-server-6fcaeea3/*', validateCSRF);
```

**Testing:**
1. Verify CSRF protection blocks invalid requests
2. Verify legitimate requests work
3. Test token rotation
4. Test across different browsers

**Acceptance Criteria:**
- ✅ CSRF tokens validated on server
- ✅ Invalid tokens rejected
- ✅ Legitimate requests work
- ✅ Security tests pass

---

### **Day 6-7: Notification System** (14 hours)

#### Backend Work (8 hours)

**Create Notification System:**
```typescript
// Data model
interface Notification {
  id: string;
  userId: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  read: boolean;
  actionUrl?: string;
  createdAt: string;
}

// Endpoints
POST /notifications
Body: NotificationCreate

GET /notifications
Query: { userId, read?, limit?, offset? }
Response: { notifications: Notification[]; unreadCount: number }

PUT /notifications/:id/read
Response: { success: boolean }

PUT /notifications/mark-all-read
Response: { success: boolean }

DELETE /notifications/:id
Response: { success: boolean }

GET /notifications/preferences
Response: NotificationPreferences

PUT /notifications/preferences
Body: NotificationPreferences
```

**Notification Triggers:**
- Order status changes
- Low inventory warnings
- Failed ERP syncs
- Admin login from new IP
- Employee import completion
- Report generation complete

#### Frontend Work (6 hours)

**Create Components:**

1. **NotificationCenter.tsx** (3 hours)
   - Bell icon with badge count
   - Dropdown with recent notifications
   - Mark as read functionality
   - Link to full notification page

2. **NotificationPage.tsx** (2 hours)
   - List all notifications
   - Filter by type/read status
   - Bulk mark as read
   - Delete notifications

3. **NotificationPreferences.tsx** (1 hour)
   - Enable/disable notification types
   - Email notification settings

**Integration:**
- Add NotificationCenter to admin header
- Set up polling (every 30 seconds) or WebSocket
- Show toast for new notifications

**Acceptance Criteria:**
- ✅ Notifications created for key events
- ✅ Bell icon shows unread count
- ✅ Can mark notifications as read
- ✅ Notifications persist across sessions
- ✅ Preferences work correctly

---

## 📅 WEEK 4: Advanced Features (26 hours)

### **Day 1-2-3-4: SSO Integration** (20 hours)

⚠️ **DECISION POINT:** SSO is complex. Consider if required for MVP.

**If Yes, Proceed:**

#### Backend Work (14 hours)

1. **Choose SSO Method** (2 hours)
   - OAuth 2.0 (Google, Microsoft, GitHub)
   - SAML 2.0 (Enterprise SSO)
   - Decision: Start with OAuth 2.0

2. **Implement OAuth 2.0** (8 hours)
   ```typescript
   // Google OAuth example
   POST /sso/google/authorize
   Body: { redirectUri: string }
   Response: { authorizationUrl: string }
   
   GET /sso/google/callback
   Query: { code: string, state: string }
   Response: { sessionToken: string, user: Employee }
   
   // Add to site settings
   interface SiteSettings {
     sso: {
       enabled: boolean;
       provider: 'google' | 'microsoft' | 'github';
       clientId: string;
       clientSecret: string; // encrypted
       allowedDomains: string[];
     }
   }
   ```

3. **User Matching Logic** (2 hours)
   - Match by email
   - Create employee if not exists
   - Link to site

4. **Security & Testing** (2 hours)
   - Validate state parameter
   - Verify token signatures
   - Test login flow
   - Handle errors

#### Frontend Work (6 hours)

1. **SSO Configuration UI** (3 hours)
   - Add to SiteConfiguration page
   - OAuth provider setup form
   - Test SSO connection
   - Allowed domains configuration

2. **SSO Login Flow** (3 hours)
   - Update AccessValidation page
   - Add "Sign in with Google" button
   - Handle OAuth redirect
   - Error handling

**Files:**
- `/supabase/functions/server/sso.ts` (new)
- `/src/app/pages/SSOValidation.tsx` (update)
- `/src/app/pages/admin/SiteConfiguration.tsx` (update)

**Acceptance Criteria:**
- ✅ Users can log in with Google
- ✅ Email matching works correctly
- ✅ Site admins can configure SSO
- ✅ Domain restrictions enforced
- ✅ Security best practices followed

---

### **Day 5-6: Multi-Language Admin** (12 hours)

#### Translation Work (8 hours)

**Tasks:**

1. **Extract Text** (3 hours)
   - Scan all admin pages
   - Extract hardcoded English text
   - Create translation keys
   - Update `/src/app/translations/en.json`

2. **Create Translations** (3 hours)
   - Spanish (`es.json`)
   - French (`fr.json`)
   - German (`de.json`)

3. **Update Components** (2 hours)
   - Replace hardcoded text with `t()` calls
   - Test each page in each language

#### UI Work (4 hours)

1. **Language Switcher** (2 hours)
   - Add to admin header
   - Persist selection
   - Apply to all pages

2. **RTL Support** (2 hours)
   - Add CSS for RTL languages (Arabic, Hebrew)
   - Test layout in RTL mode

**Files:**
- `/src/app/translations/*.json`
- All admin page components
- `/src/app/components/LanguageSwitcher.tsx` (new)

**Acceptance Criteria:**
- ✅ All admin pages translated
- ✅ Language switcher works
- ✅ Selection persists
- ✅ 4+ languages supported

---

### **Day 7: Error Handling & Polish** (8 hours)

#### Tasks:

1. **Error Message Audit** (3 hours)
   - Review all API calls
   - Improve error messages
   - Add user-friendly explanations
   - Add recovery suggestions

2. **Offline Mode** (2 hours)
   - Detect network status
   - Show offline indicator
   - Queue actions for retry
   - Sync when back online

3. **Retry Logic** (2 hours)
   - Add exponential backoff
   - Retry failed API calls
   - Show retry status

4. **Final Testing** (1 hour)
   - Test all flows
   - Check mobile responsiveness
   - Verify error handling
   - Check accessibility

**Acceptance Criteria:**
- ✅ All error messages are user-friendly
- ✅ Offline mode works
- ✅ Failed requests retry automatically
- ✅ No broken functionality

---

## ✅ DEFINITION OF DONE

### **MVP Launch Criteria:**

- ✅ All user-facing features complete
  - Welcome page with real data
  - Celebration system working
  - Order history functional
  - Gift selection integrated

- ✅ Admin features complete
  - Analytics showing real data
  - All management pages functional
  - No mock data anywhere

- ✅ Integrations working
  - Email service functional
  - File uploads working
  - (Shipping - decision pending)

- ✅ Security hardened
  - CSRF validation enabled
  - RBAC implemented
  - Audit logs complete

- ✅ Quality standards met
  - No console errors
  - Mobile responsive
  - Accessibility checked
  - Documentation updated

---

## 🎯 SUCCESS METRICS

**Code Quality:**
- 0 mock data references
- 0 TODO comments in production code
- < 5 console errors on any page
- > 90% feature completion

**Performance:**
- < 2s page load time
- < 500ms API response time
- Smooth animations (60fps)

**User Experience:**
- All flows tested end-to-end
- Error messages are helpful
- Mobile works perfectly
- Accessibility score > 90

---

## 📞 CHECKPOINTS

### **Weekly Reviews:**
- ✅ Week 1 End: User features complete, no mock data
- ✅ Week 2 End: Integrations working, file uploads ready
- ✅ Week 3 End: Security hardened, polish complete
- ✅ Week 4 End: Advanced features done, launch ready

### **Daily Standups:**
- What was completed yesterday?
- What's planned for today?
- Any blockers?

---

**Next Action:** Begin Week 1, Day 1 - Celebration System Backend
