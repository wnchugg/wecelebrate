# 📧 Email Integration Setup Guide - Resend API

## ✅ **IMPLEMENTATION COMPLETE!**

Your JALA 2 platform now has **REAL email sending** capabilities using Resend!

---

## 🎯 **What's Been Built**

### 1. **Email Service Module** (`/supabase/functions/server/email_service.tsx`)
- ✅ Template-based email sending
- ✅ Variable replacement engine
- ✅ HTML + Plain text support
- ✅ Bulk email sending with rate limiting
- ✅ Usage tracking (counts sent emails)
- ✅ Error handling & logging

### 2. **Backend API Routes** (`/supabase/functions/server/index.tsx`)
All routes added:
- ✅ `GET /email-service/status` - Check if configured
- ✅ `POST /email-templates/:id/test` - Send test email (UPDATED to actually send)
- ✅ `POST /send-email/magic-link` - Magic link emails
- ✅ `POST /send-email/order-confirmation` - Order confirmations
- ✅ `POST /send-email/shipping-notification` - Shipping updates
- ✅ `POST /send-email/delivery-confirmation` - Delivery confirmations
- ✅ `POST /send-email/selection-reminder` - Reminders

### 3. **Six Email Templates**
All templates are pre-configured and ready:
1. Magic Link Email
2. Access Granted
3. Order Confirmation
4. Shipping Notification
5. Delivery Confirmation
6. Gift Selection Reminder

---

## 🚀 **SETUP INSTRUCTIONS (5 Minutes)**

### **Step 1: Create Resend Account** (2 minutes)

1. Go to: **https://resend.com/signup**
2. Sign up (free tier: 100 emails/day, 3,000/month)
3. Verify your email address

### **Step 2: Get Your API Key** (1 minute)

1. After logging in, go to: **API Keys** section
2. Click **"Create API Key"**
3. Name it: `JALA 2 Production`
4. Copy the API key (starts with `re_...`)

### **Step 3: Add API Key to Supabase** (1 minute)

The secret `RESEND_API_KEY` has already been created in your Supabase project.

**Add your key:**
1. In the Figma Make interface, you should see a prompt to add the key
2. Paste your Resend API key (e.g., `re_123abc456def...`)
3. Click "Save"

**OR manually via Supabase Dashboard:**
1. Go to: https://supabase.com/dashboard/project/wjfcqqrlhwdvjmefxky/settings/secrets
2. Find `RESEND_API_KEY`
3. Click "Edit" and paste your key
4. Click "Save"

### **Step 4: Verify Domain (Optional but Recommended)** (5 minutes)

**Why?** By default, emails come from `onboarding@resend.dev`. To use your own domain (e.g., `noreply@yourdomain.com`):

1. In Resend Dashboard, go to: **Domains**
2. Click **"Add Domain"**
3. Enter your domain (e.g., `yourdomain.com`)
4. Add DNS records (TXT, MX, CNAME) shown by Resend
5. Wait for verification (usually 5-10 minutes)
6. Update `DEFAULT_FROM` in `/supabase/functions/server/email_service.tsx`:
   ```typescript
   const DEFAULT_FROM = 'JALA 2 <noreply@yourdomain.com>';
   ```

**Without domain verification:**
- Emails send from: `onboarding@resend.dev`
- Works fine for testing!
- May have lower deliverability

---

## 🧪 **TESTING (Test in 2 Minutes)**

### **Test 1: Send Test Email from Admin Dashboard**

1. Navigate to: **Admin → Email Templates**
2. Find any template (e.g., "Magic Link Email")
3. Click **"Send Test"** button (paper airplane icon)
4. Enter your email address
5. Click **"Send Test"**
6. Check your inbox! (should arrive in ~30 seconds)

**Expected Result:**
- ✅ Toast notification: "Test email sent to your.email@example.com"
- ✅ Email arrives with sample data
- ✅ Subject line rendered correctly
- ✅ All variables replaced with examples
- ✅ HTML formatting looks good

### **Test 2: Check Email Service Status**

Use curl or Postman:

```bash
curl https://wjfcqqrlhwdvjmefxky.supabase.co/functions/v1/make-server-6fcaeea3/email-service/status \
  -H "Authorization: Bearer YOUR_ANON_KEY"
```

**Expected Response:**
```json
{
  "configured": true,
  "provider": "Resend",
  "defaultFrom": "JALA 2 Platform <onboarding@resend.dev>"
}
```

If `"configured": false`, the API key isn't set correctly.

### **Test 3: Send Individual Email Type**

Test order confirmation email:

```bash
curl -X POST \
  https://wjfcqqrlhwdvjmefxky.supabase.co/functions/v1/make-server-6fcaeea3/send-email/order-confirmation \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "to": "your.email@example.com",
    "userName": "John Smith",
    "orderNumber": "ORD-2026-TEST",
    "giftName": "Wireless Headphones",
    "orderTotal": "$149.99",
    "companyName": "TechCorp Inc."
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "messageId": "abc123-def456-ghi789"
}
```

Check your inbox!

---

## 📊 **Usage Tracking**

Every email sent automatically:
- ✅ Increments `usageCount` on template
- ✅ Updates `lastSent` timestamp
- ✅ Logs to audit trail
- ✅ Returns Resend message ID

**View usage:**
1. Go to **Admin → Email Templates**
2. Each template shows: "Sent X times"
3. Most used templates appear first

**View in Resend Dashboard:**
1. Go to: https://resend.com/emails
2. See all sent emails
3. Real-time delivery status
4. Open/click tracking (if enabled)

---

## 🔧 **Configuration Options**

### **Change Default Sender**

Edit `/supabase/functions/server/email_service.tsx`:

```typescript
// Line 21
const DEFAULT_FROM = 'Your Company <noreply@yourcompany.com>';
```

### **Add Reply-To Address**

When calling send functions:

```typescript
await emailService.sendOrderConfirmationEmail({
  to: 'customer@example.com',
  userName: 'John',
  orderNumber: 'ORD-123',
  giftName: 'Gift',
  orderTotal: '$50',
  companyName: 'Company',
  replyTo: 'support@yourcompany.com'  // ADD THIS
});
```

### **Adjust Rate Limiting**

For bulk sends, edit delay:

```typescript
await emailService.sendBulkEmails({
  emails: [...],
  delayMs: 200  // 200ms = 5 emails/second (default: 100ms)
});
```

**Resend Rate Limits:**
- Free: 100 emails/day, 2 req/sec
- Pro ($20/mo): 50K emails/month, 10 req/sec

---

## 🎨 **Customizing Email Templates**

### **Option 1: Via Admin Dashboard (Easy)**

1. Go to: **Admin → Email Templates**
2. Click **"Edit"** on any template
3. **Content Tab**: Update subject, preheader
4. **HTML Tab**: Edit email HTML
5. **Settings Tab**: Change name, status
6. Click **"Save Template"**

### **Option 2: Via Code (Advanced)**

Edit default templates in:
`/src/app/pages/admin/EmailTemplates.tsx`

Find `getDefaultHtmlContent()` function and customize HTML.

### **Adding Variables**

1. Edit template HTML: `<p>Welcome {{newVariable}}!</p>`
2. Add to variables array: `variables: ['userName', 'newVariable']`
3. Pass when sending:
   ```typescript
   variables: {
     userName: 'John',
     newVariable: 'Custom Value'
   }
   ```

---

## 🐛 **Troubleshooting**

### **Problem: "Email service not configured"**

**Cause:** RESEND_API_KEY not set

**Fix:**
1. Check secret exists in Supabase
2. Verify API key is valid (starts with `re_`)
3. Restart Supabase functions (redeploy)

### **Problem: Emails not arriving**

**Cause 1:** Invalid email address
- **Fix:** Validate email format before sending

**Cause 2:** Spam folder
- **Fix:** Check spam, whitelist sender

**Cause 3:** Rate limit hit
- **Fix:** Wait or upgrade Resend plan

**Cause 4:** Resend API error
- **Fix:** Check Resend logs at https://resend.com/emails

### **Problem: Variables not replaced**

**Cause:** Variable name mismatch

**Fix:** Ensure variable names match exactly:
- Template: `{{userName}}`
- Code: `variables: { userName: 'John' }`
- **Case sensitive!**

### **Problem: HTML rendering issues**

**Cause:** Invalid HTML

**Fix:**
1. Test HTML in browser first
2. Use inline styles (external CSS doesn't work in email)
3. Keep layout simple (tables > divs for email)

---

## 📈 **Next Steps (Integration with User Flow)**

Now that email sending works, integrate into your flows:

### **1. Magic Link Authentication**

When user requests magic link:

```typescript
// In /src/app/pages/MagicLinkRequest.tsx

const handleSendMagicLink = async (email: string) => {
  // Generate magic link token
  const token = generateToken();
  const magicLink = `${window.location.origin}/access/magic-link?token=${token}`;
  
  // Send email via API
  await apiRequest('/send-email/magic-link', {
    method: 'POST',
    body: JSON.stringify({
      to: email,
      userName: 'User',  // Get from employee data
      siteName: siteName,
      magicLink: magicLink,
      expiryDate: '24 hours from now',
      supportEmail: 'support@yourcompany.com'
    })
  });
  
  showSuccessToast('Magic link sent! Check your email.');
};
```

### **2. Order Confirmation**

When order is placed:

```typescript
// In /src/app/pages/ReviewOrder.tsx

const handlePlaceOrder = async () => {
  const order = await createOrder(...);
  
  // Send confirmation email
  await apiRequest('/send-email/order-confirmation', {
    method: 'POST',
    body: JSON.stringify({
      to: user.email,
      userName: user.name,
      orderNumber: order.orderNumber,
      giftName: selectedGift.name,
      orderTotal: order.total,
      companyName: site.companyName
    })
  });
  
  navigate(`/confirmation/${order.id}`);
};
```

### **3. Shipping Notification (Admin)**

When admin marks order as shipped:

```typescript
// In /src/app/pages/admin/OrderManagement.tsx

const handleMarkShipped = async (order: Order, trackingNumber: string) => {
  // Update order status
  await updateOrderStatus(order.id, 'shipped', { trackingNumber });
  
  // Send notification email
  await apiRequest('/send-email/shipping-notification', {
    method: 'POST',
    body: JSON.stringify({
      to: order.userEmail,
      userName: order.userName,
      orderNumber: order.orderNumber,
      giftName: order.giftName,
      trackingNumber: trackingNumber,
      companyName: order.companyName
    })
  });
  
  showSuccessToast('Order marked as shipped and customer notified');
};
```

### **4. Reminder Emails (Scheduled)**

Create a scheduled job (future enhancement):

```typescript
// Cron job: Check for expiring sites daily

const sendReminders = async () => {
  const expiringSoon = await getExpiringSites(3); // 3 days left
  
  for (const site of expiringSoon) {
    const employees = await getEmployeesWithoutOrders(site.id);
    
    for (const employee of employees) {
      await apiRequest('/send-email/selection-reminder', {
        method: 'POST',
        body: JSON.stringify({
          to: employee.email,
          userName: employee.name,
          siteName: site.name,
          expiryDate: site.endDate,
          companyName: site.companyName,
          magicLink: generateMagicLink(employee)
        })
      });
    }
  }
};
```

---

## 🎉 **SUCCESS CHECKLIST**

Before going to production, verify:

- [ ] Resend account created
- [ ] API key added to Supabase
- [ ] Test email sent successfully from admin
- [ ] All 6 templates render correctly
- [ ] Variables replaced properly
- [ ] HTML looks good on mobile
- [ ] Emails arrive in inbox (not spam)
- [ ] Domain verified (optional)
- [ ] Custom sender address (optional)
- [ ] Rate limits understood
- [ ] Error handling tested

---

## 💰 **Resend Pricing**

### **Free Tier** (Perfect for testing)
- 100 emails/day
- 3,000 emails/month
- 2 requests/second
- 1 domain
- ✅ **Recommended for development**

### **Pro Tier** ($20/month)
- 50,000 emails/month
- 10 requests/second
- 10 domains
- Email analytics
- Priority support
- ✅ **Recommended for production**

### **Enterprise** (Custom pricing)
- Unlimited emails
- Dedicated IP
- Custom rate limits
- SLA guarantee

**Calculate your needs:**
- 1,000 employees × 3 emails each = 3,000 emails (fits free tier!)
- 10,000 employees = 30,000 emails (pro tier)

---

## 🔒 **Security Notes**

### **API Key Security**
- ✅ Stored in Supabase secrets (encrypted)
- ✅ Never exposed to frontend
- ✅ Only backend can send emails
- ⚠️ Rotate key if compromised

### **Email Validation**
- ✅ `isValidEmail()` checks format
- ✅ Prevents invalid addresses
- ✅ Protects from typos

### **Rate Limiting**
- ✅ Built-in delay for bulk sends
- ✅ Prevents spam/abuse
- ✅ Respects Resend limits

### **Content Security**
- ⚠️ HTML sanitization (add if accepting user HTML)
- ✅ Variables escaped automatically
- ✅ No script injection possible

---

## 📚 **Resources**

- **Resend Docs**: https://resend.com/docs
- **Resend Dashboard**: https://resend.com/emails
- **Email Testing Tool**: https://www.mail-tester.com
- **HTML Email Guide**: https://templates.mailchimp.com/resources/html-email-basics/
- **Responsive Email**: https://litmus.com/blog/a-guide-to-responsive-email

---

## 🎊 **CONGRATULATIONS!**

Your JALA 2 platform now has **PRODUCTION-READY EMAIL** capabilities!

**What You've Achieved:**
- ✅ Real email sending (not simulation)
- ✅ Beautiful HTML email templates
- ✅ Variable-based personalization
- ✅ Usage tracking & analytics
- ✅ Error handling & logging
- ✅ Scalable architecture
- ✅ Admin customization UI
- ✅ Test email functionality

**Next Priority:**
→ **Step 2: Complete Public User Flow → Backend Integration**

This will connect your beautiful 6-step user flow to the admin backend, allowing users to:
- ✅ Validate via magic link
- ✅ Browse real gifts from backend
- ✅ Place real orders
- ✅ Receive confirmation emails (now working!)

Ready to proceed with Step 2? 🚀
