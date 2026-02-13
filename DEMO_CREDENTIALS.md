# Demo Site Test Credentials

This file contains test credentials for authenticating on demo sites. These are automatically created when you run the seed script at `/initial-seed`.

## 🎯 Demo Sites & Test Credentials

### 1. Holiday Celebration 2026 (Ship to Home)
- **URL:** `/site/demo-event-gifting-ship-home`
- **Validation Method:** Serial Card
- **Test Credentials:**
  - `GIFT-2026-001` (John Smith)
  - `GIFT-2026-002` (Sarah Johnson)
  - `GIFT-2026-003` (Michael Chen)

### 2. Regional Office Appreciation (Store Pickup)
- **URL:** `/site/demo-event-gifting-store-pickup`
- **Validation Method:** Employee ID
- **Test Credentials:**
  - `EMP1001` (Emily Davis)
  - `EMP1002` (David Wilson)

### 3. 5 Year Service Award
- **URL:** `/site/demo-service-award`
- **Validation Method:** Magic Link (Email)
- **Test Credentials:**
  - `jennifer.martinez@company.com`
  - `robert.taylor@company.com`

### 4. 10 Year Anniversary Celebration
- **URL:** `/site/demo-service-award-celebration`
- **Validation Method:** Magic Link (Email)
- **Test Credentials:**
  - (Uses same employee pool as Service Award)

### 5. New Hire Welcome (Manager Portal)
- **URL:** `/site/demo-employee-onboarding`
- **Validation Method:** Employee ID
- **Test Credentials:**
  - `MGR001` (Thomas Anderson - Manager)

## 📝 How to Use

1. **Navigate to a demo site** using one of the URLs above
2. **Click "Get Started"** or navigate to the access validation page
3. **Enter the test credential** for the validation method shown
4. **Complete the flow** - select a gift, enter shipping info, etc.

## 🔧 Developer Notes

- Test credentials are displayed in a **yellow banner** at the top of demo sites (dev mode only)
- All test employees have `status: 'active'` in the database
- Employees are stored with key pattern: `employee:{siteId}:{employeeId}`
- The seed script creates these automatically and skips existing ones

## 🌱 Reseeding Data

To recreate all demo sites and test employees:

1. Go to `/initial-seed`
2. Click **"Create Demo Sites Now"** under the Demo Sites section
3. Wait for the success message
4. All sites and employees will be created (existing ones are skipped)

## 🚀 Backend Validation

The validation endpoint is at:
```
POST /make-server-6fcaeea3/public/validate/employee
```

Request body:
```json
{
  "siteId": "demo-event-gifting-ship-home",
  "method": "serialCard",
  "value": "GIFT-2026-001"
}
```

Response (success):
```json
{
  "valid": true,
  "sessionToken": "...",
  "employee": {
    "id": "emp-001",
    "name": "John Smith",
    "email": "john.smith@company.com",
    "department": "Engineering"
  }
}
```

## 🎨 Custom Landing Pages

Each demo site has custom landing page sections defined:
- **Hero section** with custom title, subtitle, background image
- **Text sections** with explanatory content
- **CTA buttons** that link to the access validation page

These are rendered dynamically from the `landingPage.sections` data in the site configuration.
