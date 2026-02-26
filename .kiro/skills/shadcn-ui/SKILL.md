---
name: shadcn-ui
description: shadcn/ui component patterns for React applications. Use when adding UI components, customizing component styles, composing primitives, or integrating forms with react-hook-form. Covers installation, customization, composition patterns, and project-specific conventions using Tailwind CSS v4.
---

# shadcn/ui Component Usage

## Purpose

Provide comprehensive patterns for implementing shadcn/ui components in React applications with project-specific conventions. Focus on composition over props, accessibility-first design, and type-safe integration with react-hook-form.

## When To Use This Skill

**Component Implementation:**
- Adding new shadcn/ui components to the project
- Customizing component variants and styles
- Building composite components from primitives (Dialog, Form, Table)
- Implementing responsive mobile/desktop patterns

**Form Integration:**
- Integrating react-hook-form with shadcn Form components
- Validating forms with Zod schemas
- Handling form state and errors

**Data Display:**
- Creating data tables with sorting and filtering
- Building card layouts and list views
- Implementing skeleton loading states

**Interactive Patterns:**
- Building modal dialogs and drawers (sheets)
- Implementing toast notifications
- Creating dropdown menus and popovers
- Adding tooltips and hover states

**Accessibility:**
- Ensuring keyboard navigation works correctly
- Adding proper ARIA labels (especially icon buttons)
- Implementing focus management
- Meeting WCAG 2.1 AAA standards (44px minimum touch targets)

## Core Principles

### 1. Copy-Not-Import Philosophy

shadcn/ui components are copied into the project, not imported as dependencies. Customize directly in `src/components/ui/` or `src/app/components/ui/`.

```tsx
// ✅ Customize directly
// src/components/ui/button.tsx
const buttonVariants = cva("...", {
  variants: {
    variant: {
      default: "bg-primary text-primary-foreground",
      // Add your custom variant
      custom: "bg-blue-600 text-white hover:bg-blue-700",
    },
  },
});
```

### 2. Composition Over Props

Build complex components by composing primitives rather than adding props:

```tsx
// ❌ Avoid: Too many props
<Dialog
  title="Delete Item"
  description="Are you sure?"
  showCloseButton={true}
  size="lg"
/>

// ✅ Prefer: Composition
<Dialog>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Delete Item</DialogTitle>
      <DialogDescription>Are you sure?</DialogDescription>
    </DialogHeader>
  </DialogContent>
</Dialog>
```

### 3. className Customization

Extend styles via `className` prop using Tailwind utilities:

```tsx
<Button variant="default" className="w-full sm:w-auto shadow-lg">
  Submit
</Button>
```

### 4. Accessibility First

All components are accessible by default (built on Radix UI):

- Keyboard navigation
- Screen reader support
- ARIA attributes
- Focus management

**Icon buttons require labels for accessibility**:

```tsx
// ❌ Inaccessible
<Button size="icon">
  <TrashIcon />
</Button>

// ✅ Accessible
<Button size="icon" aria-label="Delete item">
  <TrashIcon />
</Button>
```

## Quick Reference

### Common Components

| Component       | Use Case           | Key Features                   |
| --------------- | ------------------ | ------------------------------ |
| `Button`        | Actions, triggers  | Variants, sizes, loading state |
| `Input`         | Text entry         | Types, validation states       |
| `Form`          | Form validation    | react-hook-form integration    |
| `Dialog`        | Modals             | Portal, overlay, animations    |
| `Sheet`         | Side panels        | Mobile-friendly drawers        |
| `Table`         | Data display       | Semantic HTML, responsive      |
| `Select`        | Dropdowns          | Searchable, keyboard nav       |
| `Checkbox`      | Boolean input      | Indeterminate state            |
| `Label`         | Form labels        | Auto-linked to inputs          |
| `Textarea`      | Multi-line input   | Auto-resize support            |
| `Tabs`          | Navigation         | Keyboard accessible            |
| `Card`          | Content containers | Header, content, footer        |
| `Badge`         | Status labels      | Variants for states            |
| `Skeleton`      | Loading states     | Placeholder UI                 |
| `Separator`     | Visual dividers    | Horizontal/vertical            |
| `Dropdown Menu` | Actions menu       | Nested menus, shortcuts        |
| `Alert`         | Notifications      | Info, warning, error           |
| `Progress`      | Loading indicators | Determinate/indeterminate      |
| `Tooltip`       | Hover hints        | Delay, positioning             |

### Button Variants & Sizes

```tsx
<Button variant="default">Primary Action</Button>
<Button variant="secondary">Secondary Action</Button>
<Button variant="outline">Outlined</Button>
<Button variant="ghost">Subtle</Button>
<Button variant="destructive">Delete</Button>
<Button variant="link">Link Style</Button>
<Button variant="rechub">RecHUB Gradient</Button> {/* Custom RecHUB variant */}

<Button size="sm">Small</Button>
<Button size="default">Default</Button>
<Button size="lg">Large</Button>
<Button size="icon" aria-label="Add">
  <PlusIcon />
</Button>
```

### RecHUB Custom Variant

The `rechub` variant provides the branded gradient styling:

```tsx
// src/app/components/ui/button.tsx
const buttonVariants = cva("...", {
  variants: {
    variant: {
      // ... other variants
      rechub: "bg-gradient-to-r from-[#D91C81] to-[#B71569] text-white hover:from-[#C11973] hover:to-[#A01461] hover:shadow-lg transition-all",
    },
  },
});
```

**Usage:**
```tsx
<Button variant="rechub" size="lg">
  Continue
  <ArrowRight className="ml-2 h-4 w-4" />
</Button>
```

## Form Integration

### Basic Form Pattern

```tsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const schema = z.object({
  email: z.string().email(),
  name: z.string().min(2),
});

type FormValues = z.infer<typeof schema>;

export function MyForm() {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", name: "" },
  });

  const onSubmit = form.handleSubmit(async (data) => {
    // Handle submission
  });

  return (
    <Form {...form}>
      <form onSubmit={onSubmit} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="you@example.com" {...field} />
              </FormControl>
              <FormDescription>We'll never share your email.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={form.formState.isSubmitting}>
          Submit
        </Button>
      </form>
    </Form>
  );
}
```

### RecHUB Form Patterns

**Loading States with Loader2:**
```tsx
import { Loader2 } from "lucide-react";

<Button type="submit" disabled={form.formState.isSubmitting}>
  {form.formState.isSubmitting ? (
    <>
      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      Submitting...
    </>
  ) : (
    "Submit"
  )}
</Button>
```

**Dynamic Schema Selection:**
```tsx
// For forms with multiple validation modes (e.g., company vs. individual shipping)
const form = useForm({
  resolver: zodResolver(shippingMode === 'company' ? companyShippingSchema : shippingSchema),
  defaultValues: { fullName: "", phone: "" },
});
```

**Input with RecHUB Focus Colors:**
```tsx
// src/app/components/ui/input.tsx already includes:
// focus-visible:border-[#D91C81] focus-visible:ring-[#D91C81]/20
<Input type="text" placeholder="Enter your name" {...field} />
```

## Common Mistakes

### ❌ Missing aria-label on icon buttons

```tsx
// Bad
<Button size="icon"><TrashIcon /></Button>

// Good
<Button size="icon" aria-label="Delete item"><TrashIcon /></Button>
```

### ❌ Not using FormControl

```tsx
// Bad - missing ARIA attributes
<FormField
  control={form.control}
  name="email"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Email</FormLabel>
      <Input {...field} />
      <FormMessage />
    </FormItem>
  )}
/>

// Good - proper ARIA linkage
<FormField
  control={form.control}
  name="email"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Email</FormLabel>
      <FormControl>
        <Input {...field} />
      </FormControl>
      <FormMessage />
    </FormItem>
  )}
/>
```

### ❌ Forgetting DialogTrigger asChild

```tsx
// Bad - creates nested button
<DialogTrigger><Button>Open</Button></DialogTrigger>

// Good - merges props into Button
<DialogTrigger asChild><Button>Open</Button></DialogTrigger>
```

## Installation

```bash
# Install shadcn CLI
npx shadcn@latest init

# Add components
npx shadcn@latest add button input form dialog table select checkbox textarea label
```

## Resources

- **Official docs**: https://ui.shadcn.com
- **Radix UI**: https://www.radix-ui.com

## Summary

Key practices:

1. **Copy, don't import** - customize in `src/components/ui/`
2. **Compose, don't prop** - build from primitives
3. **className over props** - extend with Tailwind
4. **Accessibility first** - labels on icon buttons
5. **Forms with react-hook-form** - use Form components
6. **Mobile-first** - 44px minimum touch targets
7. **Type-safe** - derive types from Zod schemas

## RecHUB-Specific Patterns

### Brand Colors
- **Primary (Magenta)**: `#D91C81` - CTAs, primary actions
- **Secondary (Deep Blue)**: `#1B2A5E` - Headers, navigation
- **Accent (Cyan)**: `#00B4CC` - Highlights, links

### Custom Components
- **Button variant="rechub"** - Gradient button for primary CTAs
- **Input focus colors** - Magenta focus ring (`#D91C81`)
- **Toaster** - Configured with RecHUB action button colors

### Form Validation Patterns
- **Zod schemas** - Store in `src/app/schemas/`
- **Dynamic schemas** - Switch based on mode (company vs. individual)
- **Property-based tests** - Use `@fast-check/vitest` with 100 runs

### Loading States
- **Loader2 icon** - Use with `animate-spin` for async operations
- **Skeleton components** - Match actual component structure
- **Button disabled state** - Disable during `isSubmitting`

### Keyboard Navigation
- **Dialog focus trap** - Automatic with Radix UI
- **Enter/Space on cards** - Make cards keyboard accessible
- **Tab order** - Ensure logical flow through forms

### i18n Integration
- **All user-facing text** - Use translation keys
- **ARIA labels** - Translate for screen readers
- **Form errors** - Provide translated validation messages
