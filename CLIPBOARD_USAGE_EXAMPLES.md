# Clipboard Utility - Usage Examples

## Quick Start

### Basic Copy Function

```typescript
import { copyToClipboard } from '@/app/utils/clipboard';

// Simple usage
const result = await copyToClipboard('Hello, World!');

if (result.success) {
  console.log('Copied successfully using:', result.method);
} else {
  console.error('Copy failed:', result.error);
}
```

### Using CopyButton Component

```tsx
import { CopyButton } from '@/app/components/CopyButton';

// Icon-only button (default)
<CopyButton text="npm install -g supabase" />

// Button with text
<CopyButton 
  text="git clone https://github.com/..." 
  iconOnly={false}
  size="md"
  variant="outline"
/>

// With callbacks
<CopyButton
  text="Secret API Key: sk_test_..."
  onCopySuccess={() => console.log('Copied!')}
  onCopyFail={(error) => console.error('Failed:', error)}
/>
```

### Using CopyCodeBlock Component

```tsx
import { CopyCodeBlock } from '@/app/components/CopyButton';

const deployScript = `#!/bin/bash
npm install -g supabase
supabase login
supabase functions deploy make-server-6fcaeea3`;

// Basic code block with copy
<CopyCodeBlock code={deployScript} />

// With line numbers
<CopyCodeBlock 
  code={deployScript} 
  showLineNumbers={true}
  language="bash"
/>
```

## Advanced Usage

### Custom Copy Handler with State

```tsx
import { useState } from 'react';
import { copyToClipboard, selectTextInElement } from '@/app/utils/clipboard';

function MyComponent() {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showManualHint, setShowManualHint] = useState(false);

  const handleCopy = async (text: string, id: string) => {
    const result = await copyToClipboard(text);
    
    if (result.success) {
      setCopiedId(id);
      setShowManualHint(false);
      setTimeout(() => setCopiedId(null), 2000);
    } else {
      // Fallback: Select text for manual copy
      setShowManualHint(true);
      selectTextInElement(`code-block-${id}`);
    }
  };

  return (
    <div>
      {showManualHint && (
        <div className="bg-yellow-50 p-2 text-xs">
          Text selected - Press Ctrl+C to copy
        </div>
      )}
      
      <pre id="code-block-123">npm install package</pre>
      <button onClick={() => handleCopy('npm install package', '123')}>
        {copiedId === '123' ? '✓ Copied' : 'Copy'}
      </button>
    </div>
  );
}
```

### Checking Clipboard Permissions

```typescript
// Check if Clipboard API is available
async function checkClipboardAccess() {
  if (!navigator.clipboard) {
    console.warn('Clipboard API not available');
    return false;
  }

  try {
    const permission = await navigator.permissions.query({ 
      name: 'clipboard-write' as PermissionName 
    });
    return permission.state === 'granted';
  } catch (error) {
    // Permissions API might not support clipboard-write
    return false;
  }
}
```

### Text Selection Utility

```typescript
import { selectTextInElement } from '@/app/utils/clipboard';

// Select text in a specific element
const selected = selectTextInElement('my-element-id');

if (selected) {
  console.log('Text selected - user can now press Ctrl+C');
} else {
  console.error('Element not found or selection failed');
}

// Use with dynamic IDs
const elementId = `command-${index}`;
selectTextInElement(elementId);
```

## Component Variants

### CopyButton Sizes

```tsx
<CopyButton text="..." size="sm" />  // Small (12px icon)
<CopyButton text="..." size="md" />  // Medium (16px icon) - default
<CopyButton text="..." size="lg" />  // Large (20px icon)
```

### CopyButton Variants

```tsx
// Ghost - No background, subtle hover
<CopyButton text="..." variant="ghost" />

// Outline - Border with subtle background
<CopyButton text="..." variant="outline" />

// Solid - Blue background, white icon
<CopyButton text="..." variant="solid" />
```

### CopyButton States

The button automatically shows visual feedback:
- **Idle**: Copy icon
- **Success** (2s): Green checkmark + "Copied!"
- **Error** (2s): Red alert icon + "Failed"

## Integration Examples

### In Admin Forms

```tsx
import { CopyButton } from '@/app/components/CopyButton';

function AdminPanel() {
  const apiKey = 'sk_live_abc123def456...';
  
  return (
    <div className="flex items-center gap-2">
      <input 
        type="text" 
        value={apiKey} 
        readOnly 
        className="flex-1 font-mono text-sm"
      />
      <CopyButton 
        text={apiKey} 
        variant="outline"
        successMessage="API Key Copied!"
      />
    </div>
  );
}
```

### In Documentation

```tsx
import { CopyCodeBlock } from '@/app/components/CopyButton';

function DocsPage() {
  return (
    <div>
      <h2>Installation</h2>
      <CopyCodeBlock 
        code="npm install @jala/event-platform"
        language="bash"
      />
      
      <h2>Configuration</h2>
      <CopyCodeBlock 
        code={`{
  "clientId": "abc123",
  "siteId": "def456",
  "validation": "email"
}`}
        language="json"
        showLineNumbers={true}
      />
    </div>
  );
}
```

### In Deployment Guides

```tsx
function DeploymentStep({ command, description }: Props) {
  const [copied, setCopied] = useState(false);
  
  return (
    <div className="bg-white rounded-lg p-4 border">
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-semibold">{description}</h4>
        <CopyButton
          text={command}
          onCopySuccess={() => setCopied(true)}
          variant="ghost"
        />
      </div>
      
      <pre 
        className="bg-gray-900 text-gray-100 p-3 rounded text-sm select-all"
        onClick={() => navigator.clipboard?.writeText(command)}
      >
        {command}
      </pre>
      
      {copied && (
        <p className="text-xs text-green-600 mt-1">
          ✓ Ready to paste in terminal
        </p>
      )}
    </div>
  );
}
```

## Styling Tips

### Make Text Selectable

```tsx
<pre className="select-all cursor-text">
  {code}
</pre>
```

### Add Visual Feedback on Hover

```tsx
<pre className="hover:ring-2 hover:ring-blue-400 transition-all">
  {code}
</pre>
```

### Keyboard Shortcut Hints

```tsx
<div className="text-xs text-gray-600">
  Press <kbd className="px-1.5 py-0.5 bg-gray-100 border rounded font-mono">
    Ctrl+C
  </kbd> to copy
</div>
```

## Error Handling Best Practices

1. **Never throw errors** - Always return success/failure status
2. **Log warnings, not errors** - Clipboard blocking is expected in some environments
3. **Provide fallbacks** - Auto-select text when clipboard fails
4. **Show user guidance** - Display helpful messages about manual copying
5. **Test all methods** - Ensure fallback chain works in your environment

## Browser Compatibility Notes

- **Clipboard API**: Chrome 63+, Firefox 53+, Safari 13.1+
- **execCommand**: Deprecated but widely supported (IE11+)
- **Text Selection**: Universal support across all browsers
- **Figma Make**: Clipboard API blocked, execCommand works

## Accessibility

- Use semantic `<button>` elements
- Provide descriptive `title` attributes
- Show visual feedback for 2 seconds minimum
- Ensure keyboard shortcut hints are readable
- Support high contrast mode with appropriate colors
