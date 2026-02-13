# 🚀 JALA 2 MVP Implementation Plan

**Goal:** Deploy production-ready platform in 3 weeks  
**Focus:** Fix 5 critical blockers for customer deployment

---

## 📅 WEEK 1: Employee Management System

### Day 1-2: Backend - Employee Data Model & API

#### Create Employee Endpoints
**File:** `/supabase/functions/server/index.tsx`

```typescript
// ==================== EMPLOYEE MANAGEMENT ROUTES ====================

// Import employee CSV
app.post("/make-server-6fcaeea3/employees/import", verifyAdmin, async (c) => {
  const environmentId = c.get('environmentId') || 'development';
  const { siteId, employees } = await c.req.json();
  
  // employees = [{ email, employeeId, name, department }]
  
  const imported = [];
  for (const emp of employees) {
    const employee = {
      id: crypto.randomUUID(),
      siteId,
      email: emp.email.toLowerCase(),
      employeeId: emp.employeeId,
      name: emp.name,
      department: emp.department || '',
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    await kv.set(`employee:${siteId}:${employee.id}`, employee, environmentId);
    imported.push(employee);
  }
  
  return c.json({ success: true, imported: imported.length, employees: imported });
});

// Get all employees for a site
app.get("/make-server-6fcaeea3/sites/:siteId/employees", verifyAdmin, async (c) => {
  const environmentId = c.get('environmentId') || 'development';
  const siteId = c.req.param('siteId');
  
  const employees = await kv.getByPrefix(`employee:${siteId}:`, environmentId);
  
  return c.json({ employees });
});

// Validate employee access (PUBLIC - no auth)
app.post("/make-server-6fcaeea3/public/validate/employee", async (c) => {
  const environmentId = c.req.header('X-Environment-ID') || 'development';
  const { siteId, method, value } = await c.req.json();
  // method = 'email' | 'employeeId' | 'serialCard'
  
  const employees = await kv.getByPrefix(`employee:${siteId}:`, environmentId);
  
  let validEmployee = null;
  
  if (method === 'email') {
    validEmployee = employees.find(emp => 
      emp.email === value.toLowerCase() && emp.status === 'active'
    );
  } else if (method === 'employeeId') {
    validEmployee = employees.find(emp => 
      emp.employeeId === value && emp.status === 'active'
    );
  } else if (method === 'serialCard') {
    validEmployee = employees.find(emp => 
      emp.serialCard === value && emp.status === 'active'
    );
  }
  
  if (validEmployee) {
    // Generate a temporary session token
    const sessionToken = crypto.randomUUID();
    const session = {
      token: sessionToken,
      employeeId: validEmployee.id,
      siteId,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
    };
    
    await kv.set(`session:${sessionToken}`, session, environmentId);
    
    return c.json({ 
      valid: true, 
      sessionToken,
      employee: {
        name: validEmployee.name,
        email: validEmployee.email
      }
    });
  }
  
  return c.json({ valid: false, error: 'Employee not found or inactive' }, 403);
});

// Verify session token (PUBLIC)
app.get("/make-server-6fcaeea3/public/session/:token", async (c) => {
  const environmentId = c.req.header('X-Environment-ID') || 'development';
  const token = c.req.param('token');
  
  const session = await kv.get(`session:${token}`, environmentId);
  
  if (!session) {
    return c.json({ valid: false }, 401);
  }
  
  // Check expiration
  if (new Date(session.expiresAt) < new Date()) {
    await kv.del(`session:${token}`, environmentId);
    return c.json({ valid: false, error: 'Session expired' }, 401);
  }
  
  return c.json({ valid: true, session });
});

// Update employee
app.put("/make-server-6fcaeea3/employees/:id", verifyAdmin, async (c) => {
  const environmentId = c.get('environmentId') || 'development';
  const id = c.req.param('id');
  const updates = await c.req.json();
  
  // Find employee by searching all sites (or pass siteId in request)
  const { siteId } = updates;
  const key = `employee:${siteId}:${id}`;
  
  const employee = await kv.get(key, environmentId);
  if (!employee) {
    return c.json({ error: 'Employee not found' }, 404);
  }
  
  const updated = {
    ...employee,
    ...updates,
    updatedAt: new Date().toISOString()
  };
  
  await kv.set(key, updated, environmentId);
  
  return c.json({ employee: updated });
});

// Deactivate employee
app.delete("/make-server-6fcaeea3/employees/:id", verifyAdmin, async (c) => {
  const environmentId = c.get('environmentId') || 'development';
  const id = c.req.param('id');
  const { siteId } = await c.req.json();
  
  const key = `employee:${siteId}:${id}`;
  const employee = await kv.get(key, environmentId);
  
  if (!employee) {
    return c.json({ error: 'Employee not found' }, 404);
  }
  
  employee.status = 'inactive';
  employee.updatedAt = new Date().toISOString();
  
  await kv.set(key, employee, environmentId);
  
  return c.json({ success: true, employee });
});
```

**Estimated Time:** 8 hours

---

### Day 3: Frontend - Employee Import UI

#### Create Employee Management Page
**File:** `/src/app/pages/admin/EmployeeManagement.tsx`

```typescript
import { useState, useEffect } from 'react';
import { Button } from '@/app/components/ui/button';
import { Card } from '@/app/components/ui/card';
import { Input } from '@/app/components/ui/input';
import { Upload, Download, Users, Search } from 'lucide-react';
import { apiRequest } from '@/app/utils/api';

export function EmployeeManagement() {
  const [sites, setSites] = useState([]);
  const [selectedSite, setSelectedSite] = useState('');
  const [employees, setEmployees] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Load sites
  useEffect(() => {
    loadSites();
  }, []);

  // Load employees when site changes
  useEffect(() => {
    if (selectedSite) {
      loadEmployees(selectedSite);
    }
  }, [selectedSite]);

  const loadSites = async () => {
    const { sites } = await apiRequest('/sites');
    setSites(sites);
  };

  const loadEmployees = async (siteId) => {
    const { employees } = await apiRequest(`/sites/${siteId}/employees`);
    setEmployees(employees);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    
    // Parse CSV
    const text = await file.text();
    const lines = text.split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    
    const employees = [];
    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue;
      
      const values = lines[i].split(',').map(v => v.trim());
      const employee = {};
      
      headers.forEach((header, index) => {
        employee[header.toLowerCase()] = values[index];
      });
      
      employees.push(employee);
    }
    
    // Upload to backend
    try {
      await apiRequest('/employees/import', {
        method: 'POST',
        body: JSON.stringify({
          siteId: selectedSite,
          employees
        })
      });
      
      // Reload employees
      loadEmployees(selectedSite);
      
      alert(`Successfully imported ${employees.length} employees`);
    } catch (error) {
      alert(`Error: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const downloadTemplate = () => {
    const csv = 'email,employeeId,name,department\nj.doe@company.com,EMP001,John Doe,Engineering\n';
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'employee_import_template.csv';
    a.click();
  };

  const filteredEmployees = employees.filter(emp =>
    emp.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.employeeId?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className=\"p-8\">
      <h1 className=\"text-3xl font-bold mb-8\">Employee Management</h1>
      
      {/* Site Selector */}
      <Card className=\"p-6 mb-6\">
        <h2 className=\"text-xl font-semibold mb-4\">Select Site</h2>
        <select
          value={selectedSite}
          onChange={(e) => setSelectedSite(e.target.value)}
          className=\"w-full p-2 border rounded\"
        >
          <option value=\"\">-- Select Site --</option>
          {sites.map(site => (
            <option key={site.id} value={site.id}>{site.name}</option>
          ))}
        </select>
      </Card>

      {selectedSite && (
        <>
          {/* Import Section */}
          <Card className=\"p-6 mb-6\">
            <h2 className=\"text-xl font-semibold mb-4\">Import Employees</h2>
            
            <div className=\"flex gap-4 mb-4\">
              <Button onClick={downloadTemplate} variant=\"outline\">
                <Download className=\"w-4 h-4 mr-2\" />
                Download CSV Template
              </Button>
              
              <label className=\"cursor-pointer\">
                <Button disabled={isUploading} asChild>
                  <span>
                    <Upload className=\"w-4 h-4 mr-2\" />
                    {isUploading ? 'Uploading...' : 'Upload CSV'}
                  </span>
                </Button>
                <input
                  type=\"file\"
                  accept=\".csv\"
                  onChange={handleFileUpload}
                  className=\"hidden\"
                  disabled={isUploading}
                />
              </label>
            </div>
            
            <p className=\"text-sm text-gray-600\">
              CSV must include columns: email, employeeId, name, department (optional)
            </p>
          </Card>

          {/* Employee List */}
          <Card className=\"p-6\">
            <div className=\"flex items-center justify-between mb-4\">
              <h2 className=\"text-xl font-semibold\">
                <Users className=\"w-5 h-5 inline mr-2\" />
                Employees ({filteredEmployees.length})
              </h2>
              
              <div className=\"relative\">
                <Search className=\"w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400\" />
                <Input
                  placeholder=\"Search employees...\"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className=\"pl-10\"
                />
              </div>
            </div>

            <div className=\"overflow-x-auto\">
              <table className=\"w-full\">
                <thead>
                  <tr className=\"border-b\">
                    <th className=\"text-left p-3\">Name</th>
                    <th className=\"text-left p-3\">Email</th>
                    <th className=\"text-left p-3\">Employee ID</th>
                    <th className=\"text-left p-3\">Department</th>
                    <th className=\"text-left p-3\">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEmployees.map(emp => (
                    <tr key={emp.id} className=\"border-b hover:bg-gray-50\">
                      <td className=\"p-3\">{emp.name}</td>
                      <td className=\"p-3\">{emp.email}</td>
                      <td className=\"p-3\">{emp.employeeId}</td>
                      <td className=\"p-3\">{emp.department || '-'}</td>
                      <td className=\"p-3\">
                        <span className={`px-2 py-1 rounded text-xs ${
                          emp.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {emp.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
```

**Estimated Time:** 6 hours

---

### Day 4: Frontend - Connect Access Validation

#### Update Access Validation to Use API
**File:** `/src/app/pages/AccessValidation.tsx`

```typescript
// Replace the mock validation with API call
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError('');
  setIsValidating(true);

  try {
    // Get site ID from URL or context
    const siteId = getSiteIdFromDomain(); // Implement this
    
    const response = await fetch(
      `${getApiBaseUrl()}/public/validate/employee`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Environment-ID': 'production' // or from context
        },
        body: JSON.stringify({
          siteId,
          method: validationMethod, // 'email' | 'employeeId' | 'serialCard'
          value: sanitizedInput
        })
      }
    );
    
    const data = await response.json();
    
    if (data.valid) {
      // Store session token
      sessionStorage.setItem('employee_session', data.sessionToken);
      sessionStorage.setItem('employee_name', data.employee.name);
      
      authenticate(data.sessionToken);
      navigate('/gift-selection');
    } else {
      setError(data.error || 'Access denied');
    }
  } catch (error) {
    setError('Validation failed. Please try again.');
  } finally {
    setIsValidating(false);
  }
};
```

**Estimated Time:** 4 hours

---

### Day 5: Testing & Polish

- Test CSV import with various formats
- Test employee validation flow
- Test session management
- Fix any bugs
- Add loading states
- Add error handling

**Estimated Time:** 8 hours

**Week 1 Total:** 26 hours

---

## 📅 WEEK 2: Order Fulfillment & Email System

### Day 1-2: Email Service Integration

#### Choose Email Provider
**Recommended:** SendGrid (reliable, good free tier, great docs)

#### Add Email Sending to Backend
**File:** `/supabase/functions/server/email.tsx` (new file)

```typescript
// Email sending utility
const SENDGRID_API_KEY = Deno.env.get('SENDGRID_API_KEY');
const FROM_EMAIL = Deno.env.get('FROM_EMAIL') || 'noreply@jala2.com';

export async function sendEmail({
  to,
  subject,
  html,
  text
}: {
  to: string;
  subject: string;
  html: string;
  text?: string;
}) {
  const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SENDGRID_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      personalizations: [{
        to: [{ email: to }]
      }],
      from: { email: FROM_EMAIL },
      subject,
      content: [
        { type: 'text/plain', value: text || stripHtml(html) },
        { type: 'text/html', value: html }
      ]
    })
  });
  
  if (!response.ok) {
    throw new Error(`Email send failed: ${await response.text()}`);
  }
  
  return { success: true };
}

// Email templates
export function orderConfirmationEmail(order: any, employee: any, gift: any) {
  return {
    subject: `Order Confirmation #${order.orderNumber}`,
    html: `
      <h1>Thank you for your order!</h1>
      <p>Hi ${employee.name},</p>
      <p>Your gift selection has been confirmed.</p>
      
      <h2>Order Details:</h2>
      <p><strong>Order Number:</strong> ${order.orderNumber}</p>
      <p><strong>Gift:</strong> ${gift.name}</p>
      <p><strong>Shipping Address:</strong><br>
        ${order.shippingAddress.street}<br>
        ${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.zip}
      </p>
      
      <p>You will receive another email with tracking information once your gift ships.</p>
      
      <p>Best regards,<br>The JALA Team</p>
    `,
    text: `Thank you for your order!...` // Plain text version
  };
}

export function orderShippedEmail(order: any, employee: any, tracking: string) {
  return {
    subject: `Your Gift Has Shipped! - Order #${order.orderNumber}`,
    html: `
      <h1>Your gift is on the way!</h1>
      <p>Hi ${employee.name},</p>
      <p>Good news! Your gift has been shipped.</p>
      
      <p><strong>Tracking Number:</strong> ${tracking}</p>
      <p><a href=\"${getTrackingUrl(tracking)}\">Track Your Package</a></p>
      
      <p>Expected delivery: 3-5 business days</p>
      
      <p>Best regards,<br>The JALA Team</p>
    `
  };
}
```

#### Add Email Endpoints to Backend
**File:** `/supabase/functions/server/index.tsx`

```typescript
import * as email from './email.tsx';

// Send order confirmation (internal - called after order creation)
async function sendOrderConfirmation(orderId: string, environmentId: string) {
  const order = await kv.get(`order:${orderId}`, environmentId);
  const employee = await kv.get(`employee:${order.siteId}:${order.employeeId}`, environmentId);
  const gift = await kv.get(`gift:${order.giftId}`, environmentId);
  
  const emailContent = email.orderConfirmationEmail(order, employee, gift);
  
  await email.sendEmail({
    to: employee.email,
    ...emailContent
  });
  
  // Log email sent
  await auditLog({
    action: 'email_sent',
    userId: order.employeeId,
    status: 'success',
    details: { type: 'order_confirmation', orderId }
  });
}

// Update order status with email notification
app.put("/make-server-6fcaeea3/orders/:id/ship", verifyAdmin, async (c) => {
  const environmentId = c.get('environmentId') || 'development';
  const orderId = c.req.param('id');
  const { trackingNumber } = await c.req.json();
  
  const order = await kv.get(`order:${orderId}`, environmentId);
  if (!order) {
    return c.json({ error: 'Order not found' }, 404);
  }
  
  order.status = 'shipped';
  order.trackingNumber = trackingNumber;
  order.shippedAt = new Date().toISOString();
  order.updatedAt = new Date().toISOString();
  
  await kv.set(`order:${orderId}`, order, environmentId);
  
  // Send shipping email
  const employee = await kv.get(`employee:${order.siteId}:${order.employeeId}`, environmentId);
  const emailContent = email.orderShippedEmail(order, employee, trackingNumber);
  
  await email.sendEmail({
    to: employee.email,
    ...emailContent
  });
  
  return c.json({ order });
});
```

**Estimated Time:** 10 hours

---

### Day 3: Order Workflow UI

#### Update Order Management Page
**File:** `/src/app/pages/admin/OrderManagement.tsx`

Add:
- Order status filters (pending, processing, shipped, delivered)
- "Mark as Shipped" button with tracking input
- "View Details" modal with full order info
- Status history timeline

**Estimated Time:** 8 hours

---

### Day 4-5: Testing & Integration

- Test order creation flow end-to-end
- Test email delivery
- Test order status updates
- Test employee notifications
- Fix email formatting
- Add email preview in admin

**Estimated Time:** 16 hours

**Week 2 Total:** 34 hours

---

## 📅 WEEK 3: Product Images & Polish

### Day 1-2: Image Upload System

#### Set up Supabase Storage
**File:** `/supabase/functions/server/index.tsx`

```typescript
// Upload image endpoint
app.post("/make-server-6fcaeea3/upload/image", verifyAdmin, async (c) => {
  const environmentId = c.get('environmentId') || 'development';
  const formData = await c.req.formData();
  const file = formData.get('file');
  
  if (!file) {
    return c.json({ error: 'No file provided' }, 400);
  }
  
  // Validate file type
  if (!file.type.startsWith('image/')) {
    return c.json({ error: 'File must be an image' }, 400);
  }
  
  // Validate file size (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    return c.json({ error: 'File too large (max 5MB)' }, 400);
  }
  
  const supabaseClient = getSupabaseClient(environmentId);
  const bucketName = `jala-images-${environmentId}`;
  
  // Create bucket if doesn't exist
  const { data: buckets } = await supabaseClient.storage.listBuckets();
  const bucketExists = buckets?.some(b => b.name === bucketName);
  
  if (!bucketExists) {
    await supabaseClient.storage.createBucket(bucketName, {
      public: true
    });
  }
  
  // Upload file
  const fileName = `${Date.now()}-${file.name}`;
  const { data, error } = await supabaseClient.storage
    .from(bucketName)
    .upload(fileName, file);
  
  if (error) {
    return c.json({ error: error.message }, 500);
  }
  
  // Get public URL
  const { data: { publicUrl } } = supabaseClient.storage
    .from(bucketName)
    .getPublicUrl(fileName);
  
  return c.json({ url: publicUrl, fileName });
});
```

#### Add Image Upload to Gift Management
**File:** `/src/app/pages/admin/GiftManagement.tsx`

Add image upload button to gift create/edit modal

**Estimated Time:** 10 hours

---

### Day 3: Replace Placeholder Data

- Upload real product images
- Update gift catalog with real data
- Remove fallback to static data
- Test gift selection with real images

**Estimated Time:** 6 hours

---

### Day 4-5: Final Testing & Polish

- Full end-to-end testing
- Cross-browser testing
- Mobile responsiveness
- Performance optimization
- Bug fixes
- Documentation updates

**Estimated Time:** 16 hours

**Week 3 Total:** 32 hours

---

## 📊 TOTAL EFFORT ESTIMATE

| Phase | Hours |
|-------|-------|
| Week 1: Employee System | 26 |
| Week 2: Orders & Email | 34 |
| Week 3: Images & Polish | 32 |
| **TOTAL** | **92 hours** |

**Timeline:** 3 weeks (30 hours/week pace)

---

## ✅ SUCCESS CRITERIA

After 3 weeks, the platform will:

1. ✅ **Employee Management**
   - Admin can import employee CSVs per site
   - Employees validate via email/ID/serial
   - Real employee database (not hardcoded)

2. ✅ **Order Fulfillment**
   - Orders created when employee selects gift
   - Admin marks orders as shipped with tracking
   - Order status tracked (pending → shipped → delivered)

3. ✅ **Email Notifications**
   - Employee receives order confirmation
   - Employee receives shipping notification with tracking
   - Admin receives order notifications

4. ✅ **Product Management**
   - Real product images (not placeholders)
   - Admin can upload images
   - Gift catalog managed in database

5. ✅ **Ready for Pilot**
   - Can onboard first customer
   - Can import their employees
   - Can process real orders
   - Meets all security/compliance requirements

---

## 🚀 AFTER MVP: Phase 2 Features (Weeks 4-5)

1. **Analytics Dashboard**
   - Real-time order statistics
   - Popular gifts report
   - Employee participation tracking
   - Budget utilization

2. **Magic Link Authentication** (if needed)
   - Token generation
   - Email sending
   - One-time use enforcement

3. **Advanced Order Management**
   - Bulk order export
   - Order cancellation
   - Refund handling

4. **Inventory Management**
   - Low stock alerts
   - Auto-deactivate out-of-stock items
   - ERP inventory sync

---

## 💡 DEVELOPMENT TIPS

### For Week 1:
- Start with backend employee endpoints
- Test with Postman/curl before building UI
- Use sample CSV with 5-10 employees for testing

### For Week 2:
- Get SendGrid API key early
- Test email delivery to different providers (Gmail, Outlook, Yahoo)
- Use email preview tools (Litmus/Email on Acid)

### For Week 3:
- Collect real product images from customer before starting
- Optimize images (compress, resize) before upload
- Test on slow 3G connection for mobile users

---

## 🎯 READY TO START?

**I can begin implementing Week 1 now. Should I:**

1. ✅ Create the employee management backend endpoints
2. ✅ Build the employee import UI
3. ✅ Connect access validation to real API
4. ✅ Test the complete employee flow

**Or would you like me to:**
- Adjust the plan?
- Focus on a different feature first?
- Create more detailed specs for any component?

Let me know and I'll start coding! 🚀
