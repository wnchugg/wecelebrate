# Visual Email Composer - Feature Documentation

## Overview

The Visual Email Composer is a rich text editor that enables admins to create professional, branded emails without writing HTML code. It provides a WYSIWYG (What You See Is What You Get) editing experience with support for dynamic variables, formatting, and real-time preview.

---

## Features

### ✅ Rich Text Editing
- **Text Formatting**: Bold, italic, underline
- **Headings**: H1, H2, H3, and paragraphs
- **Lists**: Bulleted and numbered lists
- **Alignment**: Left, center, right text alignment
- **Colors**: 14 preset colors + custom color picker
- **Links**: Add clickable links to any text
- **Code**: Inline code formatting
- **Quotes**: Block quotes for emphasis
- **Undo/Redo**: Full edit history

### ✅ Variable System
- **Dynamic Insertion**: Click to insert template variables
- **Visual Distinction**: Variables appear styled in editor
- **Auto-completion**: Dropdown menu of available variables
- **Validation**: Only allowed variables can be inserted

### ✅ Dual Editing Modes
1. **Visual Editor** - WYSIWYG interface with toolbar
2. **HTML Code** - Direct HTML editing for advanced users
3. **Seamless Switching** - Move between modes without losing content

### ✅ Live Preview
- **Real-time Preview**: See exactly how email will look
- **Variable Substitution**: Preview with sample data
- **Email Client Simulation**: Preview includes email-friendly styling
- **Subject Line Preview**: See complete email context

### ✅ Auto-generation
- **Plain Text Version**: Automatically generated from HTML
- **Email-safe HTML**: Generates compatible markup
- **Responsive Design**: Works on mobile and desktop email clients

---

## Usage Guide

### Opening the Composer

From the Email Templates page:
1. Click **"New Template"** or **"Edit"** on existing template
2. In the template editor, click **"Visual Composer"** button
3. The full-screen composer opens

### Creating an Email

**Step 1: Template Information**
```
- Template Name: Give it a descriptive name
- Category: Choose transactional, marketing, or notification
- Subject Line: Add dynamic subject with variables
```

**Step 2: Compose Content**

**Using Visual Editor:**
1. Click in the editor area to start typing
2. Select text and use toolbar buttons to format
3. Click **"Insert Variable"** button (⚡) to add dynamic content
4. Format text with colors, alignment, lists, etc.

**Using HTML Code:**
1. Switch to "HTML Code" mode
2. Write or paste your HTML
3. Use variables like `{{userName}}`
4. Switch back to visual mode to see rendered result

**Step 3: Preview**
1. Click **"Show Preview"** button
2. See email with sample data
3. Verify formatting and variable placement
4. Check subject line rendering

**Step 4: Save**
1. Click **"Save Template"**
2. Template is added to library
3. Ready to use in automation rules

---

## Toolbar Reference

### Text Formatting
| Button | Shortcut | Function |
|--------|----------|----------|
| **B** | Ctrl+B | Bold text |
| _I_ | Ctrl+I | Italic text |
| <u>U</u> | Ctrl+U | Underline text |

### Headings
- **Dropdown menu** with options:
  - Paragraph (normal text)
  - Heading 1 (large)
  - Heading 2 (medium)
  - Heading 3 (small)

### Lists
| Icon | Function |
|------|----------|
| • | Bulleted list |
| 1. | Numbered list |

### Alignment
| Icon | Function |
|------|----------|
| ⇤ | Align left |
| ⇥ | Center align |
| ⇤ | Align right |

### Links
| Button | Function |
|--------|----------|
| 🔗 | Add link |
| 🔗⃠ | Remove link |

### Colors
- Click palette icon to open color picker
- 14 preset brand-safe colors
- Reset button to remove color

### Special Formatting
| Icon | Function |
|------|----------|
| `<>` | Inline code |
| " " | Block quote |

### Variables
| Icon | Function |
|------|----------|
| ⚡ | Insert template variable |

### History
| Icon | Function |
|------|----------|
| ↶ | Undo |
| ↷ | Redo |

---

## Available Variables by Trigger Type

### employee_added
```
{{userName}} / {{employeeName}}
{{companyName}}
{{siteName}}
{{magicLink}}
{{supportEmail}}
```

### gift_selected
```
{{userName}}
{{giftName}}
{{companyName}}
```

### order_placed
```
{{userName}}
{{orderNumber}}
{{giftName}}
{{siteName}}
```

### order_shipped
```
{{userName}}
{{orderNumber}}
{{trackingNumber}}
{{carrier}}
{{estimatedDelivery}}
```

### order_delivered
```
{{userName}}
{{orderNumber}}
{{deliveryDate}}
```

### selection_expiring
```
{{userName}}
{{siteName}}
{{expiryDate}}
{{daysRemaining}}
{{magicLink}}
```

### anniversary_approaching
```
{{userName}}
{{anniversaryDate}}
{{yearsOfService}}
{{companyName}}
```

---

## Best Practices

### ✅ DO:
- **Use headings** to create visual hierarchy
- **Keep it concise** - shorter emails perform better
- **Add clear CTAs** - use bold or links for actions
- **Test variables** - preview with sample data
- **Use brand colors** - stick to RecHUB magenta (#D91C81)
- **Add personalization** - use {{userName}} frequently
- **Include unsubscribe** - for marketing emails (legally required)
- **Mobile-first** - keep content width reasonable

### ❌ DON'T:
- Don't use too many colors - stick to 2-3
- Don't make emails too long - under 500 words ideal
- Don't forget alt text for images
- Don't use tiny fonts - 14px minimum
- Don't overuse bold/italic - loses impact
- Don't forget plain text version
- Don't use tables for layout (editor handles this)

---

## Email Design Tips

### Structure
```
1. Compelling subject line (40-50 characters)
2. Friendly greeting with {{userName}}
3. Clear main message (1-2 paragraphs)
4. Call-to-action button/link
5. Supporting details
6. Footer with contact info
```

### Call-to-Action Buttons
To create a button-like link:
1. Type your button text (e.g., "Select Your Gift")
2. Select the text
3. Make it bold
4. Change color to magenta
5. Add a link
6. Center align

### Adding Lists
Perfect for:
- Benefits
- Features
- Instructions
- Options

### Block Quotes
Use for:
- Customer testimonials
- Important notices
- Policy reminders
- Inspirational messages

---

## Technical Details

### Generated HTML
The visual editor generates email-safe HTML:
- Inline styles (not CSS classes)
- Compatible with all major email clients
- Gmail, Outlook, Apple Mail tested
- Mobile-responsive design
- Web font fallbacks

### Plain Text Auto-Generation
- HTML tags removed
- Links converted to [text](url) format
- Lists converted to bullets/numbers
- Preserves paragraph breaks
- Maintains readability

### Variable Syntax
- Format: `{{variableName}}`
- Case-sensitive
- No spaces allowed
- Validated before sending
- Graceful fallback if missing

---

## Keyboard Shortcuts

| Action | Windows/Linux | Mac |
|--------|--------------|-----|
| Bold | Ctrl+B | ⌘+B |
| Italic | Ctrl+I | ⌘+I |
| Underline | Ctrl+U | ⌘+U |
| Undo | Ctrl+Z | ⌘+Z |
| Redo | Ctrl+Shift+Z | ⌘+⇧+Z |
| Select All | Ctrl+A | ⌘+A |

---

## Troubleshooting

### Issue: Formatting not appearing in preview
**Solution**: Click "Show Preview" again to refresh

### Issue: Variable not substituting
**Solution**: Check variable name spelling - must match exactly

### Issue: Lost formatting when switching modes
**Solution**: HTML mode may have invalid markup - fix and switch back

### Issue: Email looks different in Gmail vs Outlook
**Solution**: This is normal - email clients render differently. Preview approximates most common rendering.

### Issue: Can't insert link
**Solution**: Select text first, then click link button

### Issue: Undo not working
**Solution**: Undo only works within current editing session

---

## Examples

### Welcome Email Template
```html
<h1>Welcome to {{companyName}}, {{userName}}! 🎉</h1>

<p>We're thrilled to have you as part of our team. Your contributions make our company stronger every day.</p>

<p><strong>Get started with your employee portal:</strong></p>

<p style="text-align: center;">
  <a href="{{magicLink}}" style="background-color: #D91C81; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600;">
    Access Your Portal
  </a>
</p>

<p>If you have any questions, our team is here to help at <a href="mailto:{{supportEmail}}">{{supportEmail}}</a>.</p>

<p>Best regards,<br>The {{companyName}} Team</p>
```

### Gift Selection Reminder
```html
<h2>Don't forget to select your gift! ⏰</h2>

<p>Hi {{userName}},</p>

<p>You have <strong>{{daysRemaining}} days remaining</strong> to choose your gift from {{siteName}}.</p>

<p><strong>Why you'll love our selection:</strong></p>
<ul>
  <li>Premium brands</li>
  <li>Free shipping</li>
  <li>Easy returns</li>
</ul>

<p style="text-align: center;">
  <a href="{{magicLink}}" style="color: #D91C81; font-weight: 600; font-size: 18px;">
    Browse Gifts Now →
  </a>
</p>

<p><em>Selection deadline: {{expiryDate}}</em></p>
```

### Order Shipped Notification
```html
<h2>Your gift is on the way! 📦</h2>

<p>Great news, {{userName}}!</p>

<p>Order <strong>{{orderNumber}}</strong> has been shipped and is heading your way.</p>

<p><strong>Tracking Information:</strong></p>
<ul>
  <li>Carrier: {{carrier}}</li>
  <li>Tracking #: <code>{{trackingNumber}}</code></li>
  <li>Estimated Delivery: {{estimatedDelivery}}</li>
</ul>

<p style="text-align: center;">
  <a href="https://track.carrier.com/{{trackingNumber}}">
    Track Your Package →
  </a>
</p>
```

---

## API Integration

The visual composer integrates seamlessly with the email automation system:

### Saving Templates
```typescript
// Composer automatically generates:
{
  name: "Welcome Email",
  type: "employee_added",
  category: "transactional",
  defaultSubject: "Welcome to {{companyName}}!",
  defaultHtmlContent: "<h1>Welcome...</h1>",
  defaultTextContent: "Welcome...", // auto-generated
  defaultSmsContent: "Welcome {{userName}}!",
}
```

### Using in Automation Rules
Once saved, templates appear in:
- Global template library
- Site-specific template config
- Automation rule template selector

---

## Future Enhancements

Planned features:
- [ ] Image upload and embedding
- [ ] Pre-built template gallery
- [ ] A/B testing variants
- [ ] Dynamic blocks (conditionals)
- [ ] Emoji picker
- [ ] Table support
- [ ] Custom fonts
- [ ] Template import/export

---

## Support

For help with the Visual Email Composer:
- Check this documentation
- View example templates in library
- Preview before saving
- Test with sample automation rules

**Pro Tip**: Start with a pre-built template and customize it to your needs!
