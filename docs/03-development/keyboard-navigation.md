# Keyboard Navigation Guide

## Overview

This guide covers keyboard navigation patterns for accessible user interfaces using shadcn/ui components.

## Core Principles

1. All interactive elements must be keyboard accessible
2. Focus indicators must be visible (3:1 contrast ratio minimum)
3. Tab order must be logical
4. Enter and Space keys should activate buttons/links
5. Escape key should close dialogs/modals

## Button Navigation

```tsx
// Buttons are keyboard accessible by default
<Button onClick={handleClick}>
  Click Me
</Button>

// Icon buttons need aria-label
<Button size="icon" aria-label="Delete item">
  <TrashIcon />
</Button>
```

## Card Navigation

Make cards keyboard accessible:

```tsx
<Card
  tabIndex={0}
  role="button"
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleSelect();
    }
  }}
  className="focus:ring-2 focus:ring-[#D91C81] focus:outline-none"
>
  {/* Card content */}
</Card>
```

## Dialog Navigation

Dialogs automatically trap focus:

```tsx
<Dialog open={isOpen} onOpenChange={setIsOpen}>
  <DialogTrigger asChild>
    <Button>Open Dialog</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Dialog Title</DialogTitle>
    </DialogHeader>
    {/* Focus is trapped here */}
    <DialogFooter>
      <Button onClick={() => setIsOpen(false)}>Close</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

**Keyboard shortcuts:**
- `Escape` - Close dialog
- `Tab` - Navigate between focusable elements (trapped within dialog)
- Focus returns to trigger button when closed

## Form Navigation

```tsx
<Form {...form}>
  <form onSubmit={onSubmit}>
    {/* Tab through fields in order */}
    <FormField name="email" />
    <FormField name="name" />
    <FormField name="phone" />
    
    {/* Enter submits form */}
    <Button type="submit">Submit</Button>
  </form>
</Form>
```

## Focus Management

### Custom Focus Indicators

```tsx
// RecHUB focus ring
<Input className="focus-visible:ring-[#D91C81]/20 focus-visible:border-[#D91C81]" />

// Card focus ring
<Card className="focus:ring-2 focus:ring-[#D91C81] focus:outline-none" />
```

### Skip to Content

```tsx
<a
  href="#main-content"
  className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-white focus:text-black"
>
  Skip to main content
</a>
```

## Testing Keyboard Navigation

### Manual Testing Checklist

1. **Tab through all interactive elements**
   - Verify logical tab order
   - Check focus indicators are visible
   - Ensure no keyboard traps (except dialogs)

2. **Test Enter/Space on buttons**
   - Buttons should activate on Enter or Space
   - Links should activate on Enter only

3. **Test Escape key**
   - Dialogs should close
   - Dropdowns should close
   - Focus should return to trigger

4. **Test form submission**
   - Enter key should submit forms
   - Validation errors should be announced

### Automated Testing

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

it('should be keyboard navigable', async () => {
  const user = userEvent.setup();
  render(<MyComponent />);
  
  // Tab to button
  await user.tab();
  expect(screen.getByRole('button')).toHaveFocus();
  
  // Activate with Enter
  await user.keyboard('{Enter}');
  expect(handleClick).toHaveBeenCalled();
});
```

## Common Patterns

### Dropdown Menu

```tsx
<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button>Menu</Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent>
    {/* Arrow keys navigate items */}
    <DropdownMenuItem>Item 1</DropdownMenuItem>
    <DropdownMenuItem>Item 2</DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
```

**Keyboard shortcuts:**
- `Enter/Space` - Open menu
- `Arrow Up/Down` - Navigate items
- `Enter` - Select item
- `Escape` - Close menu

### Tabs

```tsx
<Tabs defaultValue="tab1">
  <TabsList>
    {/* Arrow keys navigate tabs */}
    <TabsTrigger value="tab1">Tab 1</TabsTrigger>
    <TabsTrigger value="tab2">Tab 2</TabsTrigger>
  </TabsList>
  <TabsContent value="tab1">Content 1</TabsContent>
  <TabsContent value="tab2">Content 2</TabsContent>
</Tabs>
```

**Keyboard shortcuts:**
- `Arrow Left/Right` - Navigate tabs
- `Home` - First tab
- `End` - Last tab

## Best Practices

1. Never remove focus indicators (use `:focus-visible` instead of `:focus`)
2. Ensure 3:1 contrast ratio for focus indicators
3. Test with keyboard only (no mouse)
4. Provide skip links for long navigation
5. Use semantic HTML (`<button>`, `<a>`, `<input>`)
6. Add `aria-label` to icon-only buttons
7. Trap focus in modals/dialogs
8. Return focus to trigger after closing dialogs
9. Use logical tab order (avoid `tabIndex` > 0)
10. Test with screen readers (NVDA, JAWS, VoiceOver)
