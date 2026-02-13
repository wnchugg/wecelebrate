# Visual Email Composer - Integration Example

This document shows how to integrate the Visual Email Composer into the existing Email Templates page.

## Quick Integration

### Step 1: Import the Component

Add to `/src/app/pages/admin/EmailTemplates.tsx`:

```typescript
import { VisualEmailComposer } from './VisualEmailComposer';
import { Wand2 } from 'lucide-react';
```

### Step 2: Add State

```typescript
const [showVisualComposer, setShowVisualComposer] = useState(false);
const [editingTemplate, setEditingTemplate] = useState<Partial<EmailTemplate> | null>(null);
```

### Step 3: Add Button to UI

**Option A: In the "New Template" button area**

```typescript
<div className="flex gap-3">
  <button
    onClick={() => {
      setEditingTemplate({
        type: 'custom',
        category: 'transactional',
        defaultSubject: '',
        defaultHtmlContent: '',
        defaultTextContent: '',
      });
      setShowVisualComposer(true);
    }}
    className="inline-flex items-center gap-2 px-4 py-2 bg-[#D91C81] text-white rounded-lg hover:bg-[#B91669] transition-colors"
  >
    <Wand2 className="w-4 h-4" />
    Visual Composer
  </button>
  
  <button
    onClick={() => setShowCreateModal(true)}
    className="inline-flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
  >
    <Plus className="w-4 h-4" />
    New Template (HTML)
  </button>
</div>
```

**Option B: In template card actions**

```typescript
<div className="flex gap-2">
  <button
    onClick={() => {
      setEditingTemplate(template);
      setShowVisualComposer(true);
    }}
    className="p-2 text-[#D91C81] hover:bg-pink-50 rounded transition-colors"
    title="Edit with Visual Composer"
  >
    <Wand2 className="w-4 h-4" />
  </button>
  
  <button
    onClick={() => handleEdit(template)}
    className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
    title="Edit HTML"
  >
    <Edit className="w-4 h-4" />
  </button>
  
  {/* ... other buttons */}
</div>
```

### Step 4: Add Composer Modal

At the end of your component:

```typescript
{/* Visual Email Composer Modal */}
{showVisualComposer && editingTemplate && (
  <VisualEmailComposer
    template={editingTemplate}
    availableVariables={getVariablesForTrigger(editingTemplate.type || '')}
    onSave={async (template) => {
      try {
        if (editingTemplate.id) {
          // Update existing
          await updateTemplate(editingTemplate.id, template);
        } else {
          // Create new
          await createTemplate(template);
        }
        toast.success('Template saved successfully');
        setShowVisualComposer(false);
        setEditingTemplate(null);
        loadTemplates(); // Refresh list
      } catch (error: any) {
        toast.error(error.message);
      }
    }}
    onCancel={() => {
      setShowVisualComposer(false);
      setEditingTemplate(null);
    }}
  />
)}
```

### Step 5: Variable Helper Function

```typescript
const getVariablesForTrigger = (triggerType: string): string[] => {
  const variableMap: Record<string, string[]> = {
    employee_added: [
      'userName',
      'employeeName',
      'companyName',
      'siteName',
      'magicLink',
      'supportEmail',
    ],
    gift_selected: ['userName', 'giftName', 'companyName'],
    order_placed: ['userName', 'orderNumber', 'giftName', 'siteName'],
    order_shipped: [
      'userName',
      'orderNumber',
      'trackingNumber',
      'carrier',
      'estimatedDelivery',
    ],
    order_delivered: ['userName', 'orderNumber', 'deliveryDate'],
    selection_expiring: [
      'userName',
      'siteName',
      'expiryDate',
      'daysRemaining',
      'magicLink',
    ],
    anniversary_approaching: [
      'userName',
      'anniversaryDate',
      'yearsOfService',
      'companyName',
    ],
  };

  return variableMap[triggerType] || ['userName', 'companyName', 'siteName'];
};
```

---

## Complete Example Component

Here's a minimal example showing the full integration:

```typescript
import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Wand2, Eye } from 'lucide-react';
import { VisualEmailComposer } from './VisualEmailComposer';
import { toast } from 'sonner';

export function EmailTemplates() {
  const [templates, setTemplates] = useState([]);
  const [showVisualComposer, setShowVisualComposer] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);

  // Helper: Get variables for trigger type
  const getVariablesForTrigger = (triggerType) => {
    const variableMap = {
      employee_added: ['userName', 'companyName', 'siteName', 'magicLink'],
      gift_selected: ['userName', 'giftName', 'companyName'],
      order_placed: ['userName', 'orderNumber', 'giftName'],
      order_shipped: ['userName', 'orderNumber', 'trackingNumber', 'carrier'],
      order_delivered: ['userName', 'orderNumber', 'deliveryDate'],
      selection_expiring: ['userName', 'siteName', 'expiryDate', 'daysRemaining'],
      anniversary_approaching: ['userName', 'anniversaryDate', 'yearsOfService'],
    };
    return variableMap[triggerType] || ['userName', 'companyName'];
  };

  // Create new template with visual composer
  const handleCreateVisual = () => {
    setEditingTemplate({
      type: 'custom',
      category: 'transactional',
      defaultSubject: '',
      defaultHtmlContent: '',
      defaultTextContent: '',
    });
    setShowVisualComposer(true);
  };

  // Edit existing template with visual composer
  const handleEditVisual = (template) => {
    setEditingTemplate(template);
    setShowVisualComposer(true);
  };

  // Save template (create or update)
  const handleSaveTemplate = async (template) => {
    try {
      if (editingTemplate?.id) {
        // Update existing template
        const response = await fetch(`/api/templates/${editingTemplate.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(template),
        });
        if (!response.ok) throw new Error('Failed to update');
      } else {
        // Create new template
        const response = await fetch('/api/templates', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(template),
        });
        if (!response.ok) throw new Error('Failed to create');
      }

      toast.success('Template saved successfully');
      setShowVisualComposer(false);
      setEditingTemplate(null);
      loadTemplates();
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Email Templates</h1>
            <p className="text-gray-600 mt-1">Manage your email template library</p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleCreateVisual}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#D91C81] text-white rounded-lg hover:bg-[#B91669] transition-colors"
            >
              <Wand2 className="w-4 h-4" />
              Visual Composer
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              New Template
            </button>
          </div>
        </div>

        {/* Template List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((template) => (
            <div key={template.id} className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {template.name}
              </h3>
              <p className="text-sm text-gray-600 mb-4">{template.description}</p>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => handleEditVisual(template)}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 bg-[#D91C81] text-white rounded-lg hover:bg-[#B91669] transition-colors text-sm"
                >
                  <Wand2 className="w-4 h-4" />
                  Edit Visually
                </button>
                <button
                  onClick={() => handleEdit(template)}
                  className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Edit HTML"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handlePreview(template)}
                  className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Preview"
                >
                  <Eye className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Visual Composer Modal */}
        {showVisualComposer && editingTemplate && (
          <VisualEmailComposer
            template={editingTemplate}
            availableVariables={getVariablesForTrigger(editingTemplate.type)}
            onSave={handleSaveTemplate}
            onCancel={() => {
              setShowVisualComposer(false);
              setEditingTemplate(null);
            }}
          />
        )}
      </div>
    </div>
  );
}
```

---

## User Flow

### Creating New Template:

1. User clicks **"Visual Composer"** button
2. Modal opens with blank editor
3. User enters template name and subject
4. User composes email visually with toolbar
5. User clicks variables dropdown to insert personalization
6. User clicks **"Show Preview"** to see result
7. User clicks **"Save Template"**
8. Template added to library

### Editing Existing Template:

1. User finds template in list
2. User clicks **"Edit Visually"** button (magic wand icon)
3. Modal opens with template content loaded
4. User makes changes in visual editor
5. User previews changes
6. User saves updates
7. Template updated in library

---

## Best Practices

### When to Use Visual Composer:
✅ Creating new templates from scratch
✅ Making content/copy changes
✅ Adjusting formatting and styling
✅ Inserting variables
✅ Quick edits by non-technical users

### When to Use HTML Editor:
✅ Complex custom layouts
✅ Advanced CSS styling
✅ Importing external templates
✅ Fine-tuning generated HTML
✅ Technical debugging

### Recommended Workflow:
1. **Start with Visual Composer** for 90% of templates
2. **Switch to HTML mode** if needed for advanced customization
3. **Preview frequently** to verify rendering
4. **Test variables** with sample data
5. **Save often** to avoid losing work

---

## Tips for Users

### Creating Effective Templates:

1. **Start Simple**
   - Write content in plain text first
   - Then add formatting and variables
   - Build complexity gradually

2. **Use Hierarchy**
   - H1 for main title
   - H2 for sections
   - Paragraphs for body text

3. **Add Personalization**
   - Use {{userName}} frequently
   - Include company/site name
   - Add relevant variables

4. **Include CTAs**
   - Bold important actions
   - Use links for buttons
   - Center align for emphasis

5. **Preview Before Saving**
   - Check variable substitution
   - Verify formatting
   - Test on different screen sizes

---

## Troubleshooting

### Issue: "Visual Composer" button not showing
**Fix**: Import VisualEmailComposer component and add state variables

### Issue: Variables not populating
**Fix**: Check getVariablesForTrigger function returns correct array for trigger type

### Issue: Save not working
**Fix**: Verify API endpoint and handle async properly in onSave callback

### Issue: Template not loading in editor
**Fix**: Ensure defaultHtmlContent is passed to VisualEmailComposer component

---

## Additional Resources

- **Full User Guide**: `/docs/visual-email-composer-guide.md`
- **Feature Documentation**: `/docs/visual-email-composer-complete.md`
- **Component Code**: `/src/app/pages/admin/VisualEmailComposer.tsx`
- **Editor Component**: `/src/app/components/RichTextEditor.tsx`

---

**Ready to Use**: The visual composer is fully functional and can be integrated into the EmailTemplates page with the code above!
