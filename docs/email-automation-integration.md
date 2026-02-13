# Email Automation Integration Guide

## Phase 5: Workflow Integration - Complete! ✅

This guide shows how to trigger email automation events from different parts of the wecelebrate application.

## Available Trigger Types

1. **employee_added** - When an employee is added to a site
2. **gift_selected** - When an employee selects their gift
3. **order_placed** - When an order is placed
4. **order_shipped** - When an order ships
5. **order_delivered** - When an order is delivered
6. **selection_expiring** - Reminder before selection deadline
7. **anniversary_approaching** - Before service anniversary

---

## Integration Points

### 1. Employee Creation / Import

**Location:** `/supabase/functions/server/index.tsx` - Employee import endpoint

**Status:** ✅ Integrated

```typescript
import * as emailEventHelper from "./email_event_helper.tsx";

// After creating employee
await emailEventHelper.notifyEmployeeAdded(
  siteId,
  {
    email: employee.email,
    name: employee.name,
    serialCode: employee.serialCard,
  },
  {
    name: site.name,
  },
  {
    name: client.name,
  },
  environmentId
);
```

---

### 2. Gift Selection

**Location:** Gift selection endpoint (order creation)

**Status:** ✅ Integrated

```typescript
// After employee selects gift and places order
await emailEventHelper.notifyGiftSelected(
  siteId,
  {
    email: employee.email,
    name: employee.name,
  },
  {
    name: gift.name,
    imageUrl: gift.imageUrl,
  },
  environmentId
);
```

---

### 3. Order Placement

**Location:** Order creation endpoint

**Status:** ✅ Integrated

```typescript
// After order is placed
await emailEventHelper.notifyOrderPlaced(
  siteId,
  {
    id: order.id,
    recipientEmail: order.recipientEmail,
    recipientName: order.recipientName,
    totalAmount: order.totalAmount,
    items: order.items,
  },
  environmentId
);
```

---

### 4. Order Shipping

**Location:** Order status update endpoint (`gifts_api.ts`)

**Status:** ✅ Integrated

```typescript
// When order status changes to shipped
await emailEventHelper.notifyOrderShipped(
  siteId,
  {
    id: order.id,
    recipientEmail: order.recipientEmail,
    recipientName: order.recipientName,
    trackingNumber: order.trackingNumber,
    carrier: order.carrier,
    estimatedDelivery: order.estimatedDelivery,
  },
  environmentId
);
```

---

### 5. Order Delivery

**Location:** Order status update endpoint (`gifts_api.ts`)

**Status:** ✅ Integrated

```typescript
// When order status changes to delivered
await emailEventHelper.notifyOrderDelivered(
  siteId,
  {
    id: order.id,
    recipientEmail: order.recipientEmail,
    recipientName: order.recipientName,
    deliveryDate: order.deliveryDate,
  },
  environmentId
);
```

---

### 6. Selection Expiring (Scheduled)

**Location:** Background job / Scheduled trigger system

**Status:** ✅ Integrated

```typescript
// Run daily via cron to check for expiring selections
const result = await scheduledTriggers.processSelectionExpiringTriggers(environmentId);

// Automatically finds employees without gift selections
// Sends reminders 7, 3, and 1 days before site expiry date
```

**Triggered When:**
- Site has an expiry date
- 7 days before expiry
- 3 days before expiry
- 1 day before expiry
- Employee hasn't placed an order yet

---

### 7. Anniversary Approaching (Scheduled)

**Location:** Background job / Scheduled trigger system

**Status:** ✅ Integrated

```typescript
// Run daily via cron to check for upcoming anniversaries
const result = await scheduledTriggers.processAnniversaryApproachingTriggers(environmentId);

// Automatically finds employees with upcoming anniversaries
// Sends notifications 30 and 7 days before anniversary date
```

**Triggered When:**
- Site is anniversary-type
- 30 days before anniversary
- 7 days before anniversary
- Employee has hireDate or anniversaryDate set
```

---

## Batch Operations

For bulk operations (like importing multiple employees):

```typescript
import * as emailEventHelper from "./email_event_helper.tsx";

// Prepare contexts for all employees
const contexts = employees.map(emp => ({
  recipientEmail: emp.email,
  variables: {
    userName: emp.name,
    siteName: site.name,
    companyName: client.name,
    serialCode: emp.serialCard,
    magicLink: `https://app.wecelebrate.com/access?code=${emp.serialCard}`,
  },
}));

// Trigger batch
const result = await emailEventHelper.triggerBatchEvents(
  siteId,
  'employee_added',
  contexts,
  environmentId
);

console.log(`Sent ${result.sent} emails, ${result.failed} failed`);
```

---

## Webhook Integration

External systems can trigger automation events via webhook:

### Incoming Webhook Endpoint

**URL:** `POST /make-server-6fcaeea3/webhooks/incoming/:siteId`

**Headers:**
- `X-Webhook-Signature`: Signature for verification
- `X-Environment-ID`: Environment ID (optional, defaults to 'development')

**Body:**
```json
{
  "event": "employee_added",
  "recipientEmail": "john.smith@company.com",
  "variables": {
    "userName": "John Smith",
    "siteName": "Holiday Celebration 2026",
    "companyName": "Acme Corporation",
    "serialCode": "ABC123",
    "magicLink": "https://app.wecelebrate.com/access?code=ABC123"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Webhook processed successfully",
  "emailsSent": 1
}
```

---

## Scheduled Emails

Schedule an email for future delivery:

### Schedule Email

**Endpoint:** `POST /make-server-6fcaeea3/scheduled-emails`

**Body:**
```json
{
  "siteId": "site-123",
  "trigger": "anniversary_approaching",
  "context": {
    "recipientEmail": "employee@company.com",
    "variables": {
      "userName": "John Smith",
      "anniversaryDate": "March 15, 2026",
      "yearsOfService": "5"
    }
  },
  "scheduledFor": "2026-03-10T09:00:00Z"
}
```

### Process Scheduled Emails

**Endpoint:** `POST /make-server-6fcaeea3/scheduled-emails/process`

This should be called periodically (e.g., via cron every minute) to send due emails.

---

## Error Handling

All helper functions include comprehensive error handling:

```typescript
try {
  const success = await emailEventHelper.notifyEmployeeAdded(...);
  if (success) {
    console.log('Email automation triggered successfully');
  } else {
    console.log('No automation rules matched');
  }
} catch (error) {
  console.error('Failed to trigger email automation:', error);
  // Don't fail the main operation if email fails
}
```

---

## Testing

Test email automation manually:

**Endpoint:** `POST /make-server-6fcaeea3/email-events/trigger`

**Body:**
```json
{
  "siteId": "site-123",
  "trigger": "employee_added",
  "context": {
    "recipientEmail": "test@example.com",
    "variables": {
      "userName": "Test User",
      "siteName": "Test Site",
      "companyName": "Test Company"
    }
  }
}
```

---

## Monitoring

View email send history:

**Endpoint:** `GET /make-server-6fcaeea3/email-history?siteId=site-123&limit=50`

View scheduled email stats:

**Endpoint:** `GET /make-server-6fcaeea3/scheduled-emails/stats?siteId=site-123`

---

## Next Steps for Full Integration

1. ✅ Employee Import - **DONE**
2. ✅ Gift selection flow - **DONE**
3. ✅ Order creation flow - **DONE**
4. ✅ Order status update flow (shipped/delivered) - **DONE**
5. ✅ Scheduled triggers for selection_expiring and anniversary_approaching - **DONE**
6. ✅ Webhook configuration UI - **DONE**
7. ✅ Scheduled email management UI - **DONE**
8. ✅ Scheduled triggers management UI - **DONE**

**🎉 ALL INTEGRATIONS COMPLETE!**

### Production Deployment Checklist:

- ✅ All 7 trigger types implemented and tested
- ✅ Complete UI for all management features
- ✅ Non-blocking error handling throughout
- ✅ Comprehensive audit logging
- ⏳ Set up daily cron job to call `/scheduled-triggers/process`
- ⏳ Configure email service provider (Resend) API key
- ⏳ Create automation rules for each trigger type
- ⏳ Test end-to-end workflows in production environment

---

## Variables Available Per Trigger

### employee_added
- `userName` / `employeeName`
- `siteName`
- `companyName`
- `serialCode`
- `magicLink` / `accessLink`

### gift_selected
- `userName` / `employeeName`
- `giftName`
- `giftImage`

### order_placed
- `userName`
- `orderNumber` / `orderId`
- `orderTotal`
- `orderDate`

### order_shipped
- `userName`
- `orderNumber` / `orderId`
- `trackingNumber`
- `carrier`
- `trackingLink`
- `estimatedDelivery`

### order_delivered
- `userName`
- `orderNumber` / `orderId`
- `deliveryDate`

### selection_expiring
- `userName` / `employeeName`
- `siteName`
- `expiryDate`
- `daysRemaining`
- `magicLink` / `accessLink`

### anniversary_approaching
- `userName` / `employeeName`
- `anniversaryDate`
- `yearsOfService`
