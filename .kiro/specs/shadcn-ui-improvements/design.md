# Design Document: shadcn/ui Component Migration

## Overview

This design document specifies the technical approach for migrating the JALA 2 public-facing user flow from custom-built components to shadcn/ui primitives. The migration addresses consistency, accessibility, and maintainability issues while preserving the RecHUB design system.

### Scope

The migration covers the 6-step public user flow:
1. Landing page
2. Access Validation
3. Welcome screen
4. Gift Selection
5. Shipping Information
6. Confirmation

### Goals

- Replace custom components with shadcn/ui primitives built on Radix UI
- Achieve WCAG 2.1 Level AA compliance across all pages
- Implement consistent form validation using react-hook-form + Zod
- Standardize loading states with Skeleton components
- Maintain RecHUB brand identity (Magenta #D91C81, Deep Blue #1B2A5E, Cyan #00B4CC)
- Support 12 languages with proper i18n integration
- Reduce component code by 30% through reusable primitives


### State Management for Loading States

```
┌──────────────────────────────────────────────────────────┐
│                    Page Component                         │
│  (Welcome, GiftSelection, OrderHistory)                  │
└────────────────────┬─────────────────────────────────────┘
                     │
         ┌───────────┴───────────┐
         │                       │
┌────────▼────────┐    ┌────────▼────────┐
│  Loading State  │    │  Data State     │
│  (isLoading)    │    │  (data)         │
└────────┬────────┘    └────────┬────────┘
         │                      │
         │ true                 │ loaded
         ▼                      ▼
┌─────────────────┐    ┌─────────────────┐
│  Skeleton       │    │  Actual         │
│  Components     │    │  Components     │
│                 │    │                 │
│ • Card skeleton │    │ • Card          │
│ • Avatar skel.  │    │ • Avatar        │
│ • Text skeleton │    │ • Content       │
└─────────────────┘    └─────────────────┘
```

---

## Low-Level Design

### 1. Form Validation System

#### Zod Schema Structure

**File**: `src/app/schemas/shipping.schema.ts`

```typescript
import { z } from 'zod';

// Full shipping schema (home delivery)
export const shippingSchema = z.object({
  fullName: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters')
    .regex(
      /^[a-zA-Z\s'-]+$/,
      'Name can only contain letters, spaces, hyphens, and apostrophes'
    ),
  
  phone: z
    .string()
    .min(10, 'Phone number must be at least 10 digits')
    .regex(
      /^[\d\s()+-]+$/,
      'Phone number can only contain digits, spaces, parentheses, plus, and hyphen'
    ),
  
  street: z
    .string()
    .min(5, 'Street address must be at least 5 characters')
    .max(200, 'Street address must be less than 200 characters'),
  
  city: z
    .string()
    .min(2, 'City must be at least 2 characters')
    .max(100, 'City must be less than 100 characters'),
  
  state: z
    .string()
    .min(2, 'State/Province must be at least 2 characters')
    .max(100, 'State/Province must be less than 100 characters'),
  
  zipCode: z
    .string()
    .min(3, 'Postal code must be at least 3 characters')
    .max(20, 'Postal code must be less than 20 characters'),
  
  country: z
    .string()
    .length(2, 'Country code must be exactly 2 characters')
    .regex(/^[A-Z]{2}$/, 'Country code must be uppercase letters'),
});

// Company shipping schema (only name and phone)
export const companyShippingSchema = z.object({
  fullName: shippingSchema.shape.fullName,
  phone: shippingSchema.shape.phone,
});

export type ShippingFormValues = z.infer<typeof shippingSchema>;
export type CompanyShippingFormValues = z.infer<typeof companyShippingSchema>;
```


## Architecture

### Component Layer Structure

```
┌─────────────────────────────────────────────────────────────┐
│                     Page Components                          │
│  (Landing, Welcome, GiftSelection, ShippingInformation)     │
└────────────────────┬────────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────────┐
│              Feature Components                              │
│  (GiftCard, CelebrationCard, ValidationForm)                │
└────────────────────┬────────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────────┐
│              shadcn/ui Primitives                            │
│  (Button, Card, Form, Input, Dialog, Alert, Skeleton)       │
└────────────────────┬────────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────────┐
│              Radix UI Primitives                             │
│  (Unstyled, accessible component foundations)                │
└─────────────────────────────────────────────────────────────┘
```

### Migration Strategy

The migration follows a **bottom-up, page-by-page approach**:

1. **Phase 1: Form Components** - Migrate ShippingInformation and AccessValidation forms to react-hook-form + Zod + shadcn/ui Form components
2. **Phase 2: Welcome Page** - Replace custom cards, buttons, and add loading states
3. **Phase 3: Button Standardization** - Replace all custom buttons with Button component
4. **Phase 4: Card Standardization** - Replace custom cards in GiftSelection and Confirmation
5. **Phase 5: Dialog & Alert** - Add Dialog for modals and Alert for error states
6. **Phase 6: Toast Notifications** - Migrate to shadcn/ui Sonner component


#### React Hook Form Integration Pattern

**File**: `src/app/pages/ShippingInformation.tsx`

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { shippingSchema, type ShippingFormValues } from '@/schemas/shipping.schema';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export function ShippingInformation() {
  const form = useForm<ShippingFormValues>({
    resolver: zodResolver(shippingSchema),
    defaultValues: {
      fullName: '',
      phone: '',
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'US',
    },
  });

  const onSubmit = form.handleSubmit(async (data) => {
    // Handle submission
    console.log('Valid data:', data);
  });

  return (
    <Form {...form}>
      <form onSubmit={onSubmit} className="space-y-6">
        <FormField
          control={form.control}
          name="fullName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <FormControl>
                <Input placeholder="John Doe" {...field} />
              </FormControl>
              <FormDescription>
                Enter your full name as it appears on your ID
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Additional fields follow same pattern */}

        <Button 
          type="submit" 
          disabled={form.formState.isSubmitting}
          className="w-full"
        >
          {form.formState.isSubmitting && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          )}
          Continue to Confirmation
        </Button>
      </form>
    </Form>
  );
}
```

**Key Design Decisions**:
- FormControl wrapper ensures proper ARIA linkage (aria-describedby, aria-invalid)
- FormMessage automatically displays validation errors
- FormDescription provides helpful context
- Loading state on submit button prevents double submission


### Key Architectural Decisions

#### 1. Form System Architecture

**Decision**: Use react-hook-form as the form state manager with Zod for schema validation and shadcn/ui Form components for rendering.

**Rationale**:
- react-hook-form provides performant, uncontrolled form state management
- Zod enables type-safe validation schemas with automatic TypeScript inference
- shadcn/ui Form components automatically handle ARIA linkage (labels, descriptions, errors)
- This combination reduces boilerplate by ~40% compared to manual form handling

**Implementation Pattern**:
```tsx
// Define schema
const shippingSchema = z.object({
  fullName: z.string().min(2).regex(/^[a-zA-Z\s\-']+$/),
  phone: z.string().min(10).regex(/^[\d\s()+\-]+$/),
  // ... other fields
});

// Use in component
const form = useForm<z.infer<typeof shippingSchema>>({
  resolver: zodResolver(shippingSchema),
  defaultValues: { /* ... */ }
});

// Render with automatic ARIA linkage
<FormField
  control={form.control}
  name="fullName"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Full Name</FormLabel>
      <FormControl>
        <Input {...field} />
      </FormControl>
      <FormMessage />
    </FormItem>
  )}
/>
```


#### 2. Accessibility-First Component Design

**Decision**: All interactive elements must be keyboard accessible with proper ARIA attributes and focus management.

**Rationale**:
- WCAG 2.1 Level AA compliance is mandatory for JALA 2
- Radix UI primitives provide built-in accessibility features
- Keyboard navigation is essential for users with motor disabilities
- Screen reader support requires proper semantic HTML and ARIA attributes

**Implementation Requirements**:
- All buttons must be `<button>` elements (not `<div>` with onClick)
- Icon-only buttons must have `aria-label` attributes
- Form fields must have linked labels via `htmlFor` and `id`
- Error messages must be linked via `aria-describedby`
- Invalid fields must have `aria-invalid="true"`
- Dialogs must trap focus and close on Escape
- Dynamic content must use `aria-live` regions
- Focus indicators must have 3:1 contrast ratio

#### 3. Loading State Strategy

**Decision**: Use Skeleton components that match the structure of actual content during all async operations.

**Rationale**:
- Users need visual feedback that content is loading
- Skeleton components prevent layout shift when content loads
- Matching structure provides context about what's loading
- Consistent loading patterns improve perceived performance

**Implementation Pattern**:
```tsx
{isLoading ? (
  <div className="grid grid-cols-3 gap-6">
    {Array.from({ length: 6 }).map((_, i) => (
      <Card key={i}>
        <Skeleton className="h-64 w-full" />
        <CardContent>
          <Skeleton className="h-4 w-3/4 mb-2" />
          <Skeleton className="h-3 w-full" />
        </CardContent>
      </Card>
    ))}
  </div>
) : (
  <div className="grid grid-cols-3 gap-6">
    {gifts.map(gift => <GiftCard key={gift.id} gift={gift} />)}
  </div>
)}
```


### 2. Welcome Page Component Design

#### Celebration Card with Keyboard Navigation

**File**: `src/app/pages/Welcome.tsx`

```typescript
import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface CelebrationMessage {
  id: string;
  senderName: string;
  senderRole: string;
  message: string;
  eCard: ECardTemplate;
}

export function Welcome() {
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<CelebrationMessage[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<CelebrationMessage | null>(null);

  // Skeleton loader during data fetch
  if (loading) {
    return (
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-48 w-full" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-3/4 mb-4" />
              <div className="flex items-center gap-3 pt-4 border-t">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-24 mb-1" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {messages.map((msg) => (
          <Card key={msg.id} asChild>
            <button
              onClick={() => setSelectedMessage(msg)}
              className="text-left w-full hover:shadow-xl transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              aria-label={`View message from ${msg.senderName}`}
            >
              <CardHeader className="p-4">
                <ECard template={msg.eCard} />
              </CardHeader>
              <CardContent>
                <p className="italic text-gray-700 mb-4">"{msg.message}"</p>
                <div className="flex items-center gap-3 pt-4 border-t">
                  <Avatar>
                    <AvatarFallback>{msg.senderName.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">{msg.senderName}</p>
                    <p className="text-xs text-muted-foreground">{msg.senderRole}</p>
                  </div>
                </div>
              </CardContent>
            </button>
          </Card>
        ))}
      </div>

      {/* Full message dialog */}
      <Dialog open={selectedMessage !== null} onOpenChange={() => setSelectedMessage(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Message from {selectedMessage?.senderName}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <ECard
              template={selectedMessage?.eCard}
              message={selectedMessage?.message}
              senderName={selectedMessage?.senderName}
              size="large"
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
```

**Key Design Decisions**:
- Card with `asChild` prop merges with button element (keyboard accessible)
- Skeleton components mirror actual card structure (prevents layout shift)
- Dialog for full message view with focus trap
- Avatar component for consistent sender representation
- Proper ARIA labels for screen readers


#### 4. Design System Preservation

**Decision**: Extend shadcn/ui components with RecHUB brand colors while maintaining component API compatibility.

**Rationale**:
- RecHUB brand identity must be preserved (Magenta #D91C81, Deep Blue #1B2A5E, Cyan #00B4CC)
- shadcn/ui components are designed to be customized via Tailwind CSS
- CSS variables enable theme customization without modifying component code
- Custom variants can be added to Button and other components

**Implementation Approach**:
```tsx
// src/app/components/ui/button.tsx
const buttonVariants = cva("...", {
  variants: {
    variant: {
      default: "bg-primary text-primary-foreground hover:bg-primary/90",
      rechub: "bg-gradient-to-r from-[#D91C81] to-[#B71569] text-white hover:shadow-lg",
      // ... other variants
    },
  },
});

// src/app/components/ui/input.tsx
// Already customized with RecHUB focus colors
className="focus:border-[#D91C81] focus:ring-2 focus:ring-pink-100"
```

#### 5. Internationalization Integration

**Decision**: All component text must use i18n keys from the existing LanguageContext system.

**Rationale**:
- JALA 2 supports 12 languages including RTL languages (Arabic, Hebrew)
- No hardcoded strings are allowed in user-facing components
- Validation error messages must be translated
- Component labels, buttons, and descriptions must be translated

**Implementation Pattern**:
```tsx
const { t } = useLanguage();

<FormField
  control={form.control}
  name="fullName"
  render={({ field }) => (
    <FormItem>
      <FormLabel>{t('shipping.fullName')}</FormLabel>
      <FormControl>
        <Input {...field} placeholder={t('shipping.fullNamePlaceholder')} />
      </FormControl>
      <FormMessage />
    </FormItem>
  )}
/>
```


### 3. Button Component Standardization

#### Button Variants and Usage Patterns

**File**: `src/app/components/ui/button.tsx` (customization)

```typescript
import { cva, type VariantProps } from 'class-variance-authority';

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "underline-offset-4 hover:underline text-primary",
        // Custom RecHUB variant
        rechub: "bg-gradient-to-r from-[#D91C81] to-[#B71569] text-white hover:shadow-lg hover:from-[#C11973] hover:to-[#A01461]",
      },
      size: {
        default: "h-10 py-2 px-4",
        sm: "h-9 px-3 rounded-md",
        lg: "h-11 px-8 rounded-md",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);
```

#### Usage Examples

```typescript
// Primary action button
<Button variant="rechub" size="lg">
  Get Started
</Button>

// Button with Link (asChild pattern)
<Button asChild variant="default" size="lg">
  <Link to="/access">
    Get Started
    <Gift className="ml-2 w-5 h-5" />
  </Link>
</Button>

// Icon button with aria-label
<Button size="icon" variant="ghost" aria-label="Play welcome video">
  <Play className="w-5 h-5" />
</Button>

// Loading state button
<Button disabled={isSubmitting}>
  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
  Submit Order
</Button>

// Destructive action
<Button variant="destructive" size="sm" aria-label="Delete item">
  <Trash2 className="w-4 h-4" />
</Button>
```

**Key Design Decisions**:
- Custom `rechub` variant preserves brand gradient
- `asChild` pattern prevents nested buttons (accessibility)
- All icon buttons require `aria-label`
- Loading states use Loader2 icon with animation
- Focus ring uses RecHUB primary color


## Components and Interfaces

### Form Components

#### FormField Component
**Purpose**: Wraps form inputs with automatic ARIA linkage and validation feedback.

**Interface**:
```tsx
interface FormFieldProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  render: (props: { field: ControllerRenderProps<T> }) => React.ReactElement;
}
```

**Key Features**:
- Automatically links labels to inputs via `htmlFor` and `id`
- Links error messages via `aria-describedby`
- Sets `aria-invalid="true"` on fields with errors
- Provides field state (error, isDirty, isTouched) to render function

#### Input Component
**Purpose**: Styled text input with RecHUB brand focus colors.

**Interface**:
```tsx
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string;
}
```

**Customizations**:
- Focus border: `#D91C81` (RecHUB magenta)
- Focus ring: `ring-pink-100`
- Consistent padding, border radius, and typography


### 4. Card Component Standardization

#### Gift Card Implementation

**File**: `src/app/pages/GiftSelection.tsx`

```typescript
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

interface Gift {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  category: string;
  price: number;
}

export function GiftSelection() {
  const [loading, setLoading] = useState(true);
  const [gifts, setGifts] = useState<Gift[]>([]);

  // Skeleton loader
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="p-0">
              <Skeleton className="h-64 w-full rounded-t-lg" />
            </CardHeader>
            <CardContent className="p-6">
              <Skeleton className="h-6 w-3/4 mb-2" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-5/6" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {gifts.map((gift) => (
        <Card 
          key={gift.id}
          className="hover:shadow-xl transition-shadow cursor-pointer"
          onClick={() => handleSelectGift(gift.id)}
        >
          <CardHeader className="p-0">
            <div className="relative h-64 overflow-hidden rounded-t-lg">
              <img 
                src={gift.imageUrl} 
                alt={gift.name}
                className="w-full h-full object-cover"
              />
              <Badge 
                variant="secondary" 
                className="absolute top-2 right-2"
              >
                {gift.category}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <CardTitle className="mb-2">{gift.name}</CardTitle>
            <CardDescription>{gift.description}</CardDescription>
            <p className="mt-4 text-lg font-semibold text-primary">
              ${gift.price.toFixed(2)}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
```

**Key Design Decisions**:
- CardHeader with `p-0` for full-width images
- Badge component for category labels
- Skeleton components match actual card structure
- Hover effects for interactivity
- Semantic HTML structure (CardTitle, CardDescription)


### Card Components

#### Card Component
**Purpose**: Container for content with consistent styling (shadow, border, padding).

**Interface**:
```tsx
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  asChild?: boolean;
}
```

**Sub-components**:
- `CardHeader`: Top section for images or primary content
- `CardContent`: Main content area with consistent padding
- `CardTitle`: Heading with proper typography scale
- `CardDescription`: Secondary text with muted color
- `CardFooter`: Bottom section for actions

**Usage Pattern**:
```tsx
<Card>
  <CardHeader>
    <img src={gift.imageUrl} alt={gift.name} />
  </CardHeader>
  <CardContent>
    <CardTitle>{gift.name}</CardTitle>
    <CardDescription>{gift.description}</CardDescription>
  </CardContent>
</Card>
```

### Button Components

#### Button Component
**Purpose**: Consistent button styling with variants, sizes, and loading states.

**Interface**:
```tsx
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost' | 'destructive' | 'rechub';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  asChild?: boolean;
  className?: string;
}
```

**Variants**:
- `default`: Primary button with RecHUB magenta background
- `outline`: Border-only button for secondary actions
- `ghost`: Transparent button for tertiary actions
- `destructive`: Red button for dangerous actions
- `rechub`: Custom gradient button (magenta to darker magenta)

**Loading State Pattern**:
```tsx
<Button disabled={isSubmitting}>
  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
  {t('common.submit')}
</Button>
```


### 5. Dialog and Alert Components

#### Alert Component for Error States

**File**: `src/app/pages/AccessValidation.tsx`

```typescript
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, CheckCircle } from 'lucide-react';

export function AccessValidation() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Validation Failed</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert variant="default" className="border-green-500 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-800">Success</AlertTitle>
          <AlertDescription className="text-green-700">{success}</AlertDescription>
        </Alert>
      )}

      {/* Form content */}
    </div>
  );
}
```

#### Dialog Component for Confirmations

**File**: `src/app/pages/Confirmation.tsx`

```typescript
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

export function Confirmation() {
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  const handleCancelOrder = () => {
    setShowCancelDialog(true);
  };

  const confirmCancel = async () => {
    // Cancel order logic
    setShowCancelDialog(false);
  };

  return (
    <>
      {/* Order details */}
      <Button variant="destructive" onClick={handleCancelOrder}>
        Cancel Order
      </Button>

      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Order?</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this order? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowCancelDialog(false)}
            >
              Keep Order
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmCancel}
            >
              Cancel Order
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
```

**Key Design Decisions**:
- Alert component with icon for visual identification
- Custom success variant using Tailwind classes
- Dialog with proper ARIA attributes (auto-generated)
- Focus trap within dialog (handled by Radix UI)
- ESC key closes dialog (handled by Radix UI)
- DialogFooter for action buttons


### Dialog Components

#### Dialog Component
**Purpose**: Modal overlay with focus trap and keyboard management.

**Interface**:
```tsx
interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}
```

**Sub-components**:
- `DialogTrigger`: Button or element that opens the dialog
- `DialogContent`: Main content container with focus trap
- `DialogHeader`: Top section with title and description
- `DialogTitle`: Heading with proper ARIA labeling
- `DialogDescription`: Secondary text with ARIA description
- `DialogFooter`: Bottom section for action buttons

**Accessibility Features**:
- Traps focus within dialog when open
- Closes on Escape key press
- Automatically sets `aria-labelledby` and `aria-describedby`
- Prevents body scroll when open
- Returns focus to trigger element on close

**Usage Pattern**:
```tsx
<Dialog open={isOpen} onOpenChange={setIsOpen}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>{t('dialog.title')}</DialogTitle>
      <DialogDescription>{t('dialog.description')}</DialogDescription>
    </DialogHeader>
    {/* Content */}
    <DialogFooter>
      <Button variant="outline" onClick={() => setIsOpen(false)}>
        {t('common.cancel')}
      </Button>
      <Button onClick={handleConfirm}>
        {t('common.confirm')}
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```


### Alert Components

#### Alert Component
**Purpose**: Display important messages with visual hierarchy and icons.

**Interface**:
```tsx
interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'destructive';
  className?: string;
}
```

**Sub-components**:
- `AlertTitle`: Heading for the alert message
- `AlertDescription`: Detailed message content

**Accessibility Features**:
- Uses `aria-live="polite"` for non-destructive alerts
- Uses `aria-live="assertive"` for destructive alerts
- Includes icon for visual identification
- Proper color contrast for text and background

**Usage Pattern**:
```tsx
<Alert variant="destructive">
  <AlertCircle className="h-4 w-4" />
  <AlertTitle>{t('error.title')}</AlertTitle>
  <AlertDescription>{t('error.description')}</AlertDescription>
</Alert>
```

### Skeleton Components

#### Skeleton Component
**Purpose**: Loading placeholder that matches content structure.

**Interface**:
```tsx
interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}
```

**Accessibility Features**:
- Sets `aria-busy="true"` on container
- Sets `aria-label="Loading"` for screen readers
- Animated pulse effect with RecHUB brand colors

**Usage Pattern**:
```tsx
{isLoading ? (
  <Card>
    <Skeleton className="h-64 w-full" />
    <CardContent>
      <Skeleton className="h-4 w-3/4 mb-2" />
      <Skeleton className="h-3 w-full" />
    </CardContent>
  </Card>
) : (
  <GiftCard gift={gift} />
)}
```


### 6. Accessibility Implementation

#### ARIA Attributes Pattern

**Form Fields**:
```typescript
// Automatic ARIA linkage via FormControl
<FormField
  control={form.control}
  name="email"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Email</FormLabel>  {/* Generates htmlFor="email" */}
      <FormControl>
        <Input 
          {...field}
          // Auto-generated attributes:
          // id="email"
          // aria-describedby="email-description email-error"
          // aria-invalid="true" (when error exists)
        />
      </FormControl>
      <FormDescription id="email-description">
        We'll never share your email
      </FormDescription>
      <FormMessage id="email-error" />  {/* Only rendered when error */}
    </FormItem>
  )}
/>
```

**Icon Buttons**:
```typescript
// Always include aria-label for icon-only buttons
<Button size="icon" aria-label="Delete item">
  <Trash2 className="w-4 h-4" />
</Button>

<Button size="icon" aria-label="Play welcome video">
  <Play className="w-5 h-5" />
</Button>

<Button size="icon" aria-label="Close dialog">
  <X className="w-4 h-4" />
</Button>
```

**Keyboard Navigation**:
```typescript
// Card as button for keyboard accessibility
<Card asChild>
  <button
    onClick={handleClick}
    onKeyDown={(e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleClick();
      }
    }}
    className="text-left w-full focus:outline-none focus:ring-2 focus:ring-primary"
    aria-label="View celebration message"
  >
    {/* Card content */}
  </button>
</Card>
```

**Focus Management**:
```typescript
// Dialog focus trap (automatic via Radix UI)
<Dialog open={isOpen} onOpenChange={setIsOpen}>
  <DialogContent>
    {/* Focus automatically trapped within dialog */}
    {/* First focusable element receives focus on open */}
    {/* ESC key closes dialog */}
    {/* Click outside closes dialog */}
  </DialogContent>
</Dialog>
```

**Loading State Announcements**:
```typescript
// Skeleton with aria-busy
<div aria-busy="true" aria-label="Loading celebration messages">
  <Skeleton className="h-48 w-full" />
</div>

// Button loading state
<Button disabled={isSubmitting} aria-busy={isSubmitting}>
  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
  {isSubmitting ? 'Submitting...' : 'Submit'}
</Button>
```


### Avatar Components

#### Avatar Component
**Purpose**: Display user or sender representation with fallback initials.

**Interface**:
```tsx
interface AvatarProps extends React.HTMLAttributes<HTMLSpanElement> {
  className?: string;
}
```

**Sub-components**:
- `AvatarImage`: Image element with proper loading states
- `AvatarFallback`: Fallback content (typically initials) when image unavailable

**Usage Pattern**:
```tsx
<Avatar>
  <AvatarImage src={sender.avatarUrl} alt={sender.name} />
  <AvatarFallback>{sender.name.charAt(0)}</AvatarFallback>
</Avatar>
```

### Badge Components

#### Badge Component
**Purpose**: Display labels, categories, or status indicators.

**Interface**:
```tsx
interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'outline' | 'destructive';
  className?: string;
}
```

**Usage Pattern**:
```tsx
<Badge variant="secondary">{gift.category}</Badge>
```


### 7. Design System Preservation

#### RecHUB Color Integration

**CSS Variables** (`src/styles/theme.css`):
```css
:root {
  /* RecHUB Brand Colors */
  --color-rechub-magenta: #D91C81;
  --color-rechub-deep-blue: #1B2A5E;
  --color-rechub-cyan: #00B4CC;
  
  /* shadcn/ui theme mapping */
  --primary: var(--color-rechub-magenta);
  --primary-foreground: #ffffff;
  
  --secondary: var(--color-rechub-deep-blue);
  --secondary-foreground: #ffffff;
  
  --accent: var(--color-rechub-cyan);
  --accent-foreground: #ffffff;
  
  /* Focus ring color */
  --ring: var(--color-rechub-magenta);
}
```

**Input Component Customization** (`src/app/components/ui/input.tsx`):
```typescript
const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2",
          "text-sm ring-offset-background file:border-0 file:bg-transparent",
          "file:text-sm file:font-medium placeholder:text-muted-foreground",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          "focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          // RecHUB customization
          "focus-visible:border-[#D91C81] focus-visible:ring-[#D91C81]/20",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
```

**Button Gradient Variant**:
```typescript
// Custom RecHUB gradient button
<Button 
  variant="rechub"
  className="shadow-lg hover:shadow-xl transition-shadow"
>
  Get Started
</Button>

// CSS for rechub variant (in button.tsx)
rechub: "bg-gradient-to-r from-[#D91C81] to-[#B71569] text-white hover:shadow-lg"
```


## Data Models

### Form Validation Schemas

#### Shipping Information Schema
```tsx
import { z } from 'zod';

export const shippingSchema = z.object({
  fullName: z
    .string()
    .min(2, 'shipping.errors.nameMinLength')
    .regex(/^[a-zA-Z\s\-']+$/, 'shipping.errors.nameInvalidChars'),
  
  phone: z
    .string()
    .min(10, 'shipping.errors.phoneMinLength')
    .regex(/^[\d\s()+\-]+$/, 'shipping.errors.phoneInvalidChars'),
  
  street: z
    .string()
    .min(5, 'shipping.errors.streetMinLength'),
  
  city: z
    .string()
    .min(2, 'shipping.errors.cityRequired'),
  
  state: z
    .string()
    .min(2, 'shipping.errors.stateRequired'),
  
  postalCode: z
    .string()
    .min(3, 'shipping.errors.postalCodeMinLength'),
  
  country: z
    .string()
    .length(2, 'shipping.errors.countryInvalidFormat')
    .regex(/^[A-Z]{2}$/, 'shipping.errors.countryInvalidFormat'),
});

export type ShippingFormValues = z.infer<typeof shippingSchema>;
```

#### Company Shipping Mode Schema
```tsx
export const companyShippingSchema = z.object({
  fullName: z
    .string()
    .min(2, 'shipping.errors.nameMinLength')
    .regex(/^[a-zA-Z\s\-']+$/, 'shipping.errors.nameInvalidChars'),
  
  phone: z
    .string()
    .min(10, 'shipping.errors.phoneMinLength')
    .regex(/^[\d\s()+\-]+$/, 'shipping.errors.phoneInvalidChars'),
});

export type CompanyShippingFormValues = z.infer<typeof companyShippingSchema>;
```


### Component State Models

#### Loading State
```tsx
interface LoadingState {
  isLoading: boolean;
  error: string | null;
}
```

#### Dialog State
```tsx
interface DialogState {
  isOpen: boolean;
  selectedItem: T | null;
}
```

#### Form State (from react-hook-form)
```tsx
interface FormState<T> {
  isDirty: boolean;
  isValid: boolean;
  isSubmitting: boolean;
  errors: FieldErrors<T>;
  touchedFields: Partial<Record<keyof T, boolean>>;
}
```


### 8. Multi-Language Support

#### i18n Integration Pattern

**Translation Keys for Components**:
```typescript
// src/app/i18n/en.json
{
  "shipping": {
    "form": {
      "fullName": {
        "label": "Full Name",
        "placeholder": "John Doe",
        "description": "Enter your full name as it appears on your ID",
        "errors": {
          "min": "Name must be at least 2 characters",
          "max": "Name must be less than 100 characters",
          "invalid": "Name can only contain letters, spaces, hyphens, and apostrophes"
        }
      },
      "phone": {
        "label": "Phone Number",
        "placeholder": "(555) 123-4567",
        "description": "We'll use this to contact you about delivery",
        "errors": {
          "min": "Phone number must be at least 10 digits",
          "invalid": "Phone number can only contain digits, spaces, parentheses, plus, and hyphen"
        }
      },
      "submit": "Continue to Confirmation",
      "submitting": "Processing..."
    }
  },
  "welcome": {
    "celebrationMessages": {
      "title": "Celebration Messages",
      "loading": "Loading messages...",
      "empty": "No celebration messages yet",
      "viewMessage": "View message from {{senderName}}",
      "dialog": {
        "title": "Message from {{senderName}}",
        "close": "Close"
      }
    },
    "video": {
      "play": "Play welcome video",
      "title": "Welcome Video"
    },
    "continue": "Continue to Gift Selection"
  }
}
```

**Usage in Components**:
```typescript
import { useLanguage } from '@/context/LanguageContext';

export function ShippingInformation() {
  const { t } = useLanguage();
  
  return (
    <FormField
      control={form.control}
      name="fullName"
      render={({ field }) => (
        <FormItem>
          <FormLabel>{t('shipping.form.fullName.label')}</FormLabel>
          <FormControl>
            <Input 
              placeholder={t('shipping.form.fullName.placeholder')}
              {...field} 
            />
          </FormControl>
          <FormDescription>
            {t('shipping.form.fullName.description')}
          </FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
```

**RTL Layout Support**:
```typescript
// src/app/App.tsx
import { useLanguage } from '@/context/LanguageContext';

export function App() {
  const { language, isRTL } = useLanguage();
  
  return (
    <div dir={isRTL ? 'rtl' : 'ltr'} lang={language}>
      {/* App content */}
    </div>
  );
}
```

**Zod Schema with i18n**:
```typescript
import { z } from 'zod';
import { useLanguage } from '@/context/LanguageContext';

export const createShippingSchema = (t: (key: string) => string) => {
  return z.object({
    fullName: z
      .string()
      .min(2, t('shipping.form.fullName.errors.min'))
      .max(100, t('shipping.form.fullName.errors.max'))
      .regex(
        /^[a-zA-Z\s'-]+$/,
        t('shipping.form.fullName.errors.invalid')
      ),
    // ... other fields
  });
};

// Usage in component
const { t } = useLanguage();
const form = useForm<ShippingFormValues>({
  resolver: zodResolver(createShippingSchema(t)),
  defaultValues: { /* ... */ },
});
```


## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Form Field ARIA Linkage

*For any* form field with an error, the input element should have `aria-invalid="true"`, `aria-describedby` linking to the error message, and the label should be linked via `htmlFor` and `id` attributes.

**Validates: Requirements 1.4, 1.5, 1.6, 7.5, 7.6, 7.7**

### Property 2: Validation Error Display

*For any* invalid form data submitted, the Form component should display error messages using FormMessage components for each invalid field.

**Validates: Requirements 1.3**

### Property 3: Zod Schema Validation

*For any* form input that violates the Zod schema constraints (name length, phone format, postal code format, country code format, street address length), the validation should reject the input with an appropriate error message.

**Validates: Requirements 1.7, 1.8, 1.9, 1.10, 1.11**

### Property 4: Sender Initials Extraction

*For any* sender name, the Avatar component should display the first character as the fallback initial.

**Validates: Requirements 2.3**


### 9. Testing Strategy

#### Unit Tests for Components

**Button Component Tests**:
```typescript
// src/app/components/ui/__tests__/button.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Button } from '../button';
import { Trash2 } from 'lucide-react';

describe('Button Component', () => {
  it('renders with default variant', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-primary');
  });

  it('renders with rechub variant', () => {
    render(<Button variant="rechub">Get Started</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-gradient-to-r');
  });

  it('has aria-label when icon-only', () => {
    render(
      <Button size="icon" aria-label="Delete item">
        <Trash2 />
      </Button>
    );
    expect(screen.getByLabelText('Delete item')).toBeInTheDocument();
  });

  it('shows loading state', () => {
    render(
      <Button disabled>
        <span className="animate-spin">Loading</span>
        Submit
      </Button>
    );
    expect(screen.getByRole('button')).toBeDisabled();
  });
});
```

**Form Component Tests**:
```typescript
// src/app/pages/__tests__/ShippingInformation.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ShippingInformation } from '../ShippingInformation';

describe('ShippingInformation Form', () => {
  it('validates required fields', async () => {
    render(<ShippingInformation />);
    
    const submitButton = screen.getByRole('button', { name: /continue/i });
    await userEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/name must be at least 2 characters/i)).toBeInTheDocument();
    });
  });

  it('validates phone number format', async () => {
    render(<ShippingInformation />);
    
    const phoneInput = screen.getByLabelText(/phone/i);
    await userEvent.type(phoneInput, 'abc');
    
    const submitButton = screen.getByRole('button', { name: /continue/i });
    await userEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/phone number can only contain digits/i)).toBeInTheDocument();
    });
  });

  it('submits valid form data', async () => {
    const onSubmit = vi.fn();
    render(<ShippingInformation onSubmit={onSubmit} />);
    
    await userEvent.type(screen.getByLabelText(/full name/i), 'John Doe');
    await userEvent.type(screen.getByLabelText(/phone/i), '5551234567');
    await userEvent.type(screen.getByLabelText(/street/i), '123 Main St');
    await userEvent.type(screen.getByLabelText(/city/i), 'Springfield');
    await userEvent.type(screen.getByLabelText(/state/i), 'IL');
    await userEvent.type(screen.getByLabelText(/zip/i), '62701');
    
    await userEvent.click(screen.getByRole('button', { name: /continue/i }));
    
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        fullName: 'John Doe',
        phone: '5551234567',
        street: '123 Main St',
        city: 'Springfield',
        state: 'IL',
        zipCode: '62701',
        country: 'US',
      });
    });
  });
});
```


### Property 5: Icon Button Accessibility

*For any* icon-only button in the application, the button should have an `aria-label` attribute describing its action.

**Validates: Requirements 3.3, 7.4**

### Property 6: Keyboard Button Activation

*For any* button element, pressing Enter or Space key should trigger the button's onClick handler.

**Validates: Requirements 3.7**

### Property 7: Dialog Focus Management

*For any* open Dialog, focus should be trapped within the Dialog, and pressing Escape should close the Dialog.

**Validates: Requirements 5.4, 5.5, 7.9**

### Property 8: Dialog ARIA Attributes

*For any* Dialog component, it should have `aria-labelledby` pointing to the DialogTitle and `aria-describedby` pointing to the DialogDescription.

**Validates: Requirements 5.7, 7.10**

### Property 9: Dynamic Content Announcements

*For any* Alert component or dynamic content change, the container should have an `aria-live` attribute to announce changes to screen readers.

**Validates: Requirements 5.10, 7.8**


**Welcome Page Tests**:
```typescript
// src/app/pages/__tests__/Welcome.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Welcome } from '../Welcome';

describe('Welcome Page', () => {
  it('shows skeleton loaders while loading', () => {
    render(<Welcome />);
    
    const skeletons = screen.getAllByTestId('celebration-skeleton');
    expect(skeletons).toHaveLength(6);
  });

  it('renders celebration messages after loading', async () => {
    const mockMessages = [
      {
        id: '1',
        senderName: 'John Doe',
        senderRole: 'Manager',
        message: 'Congratulations!',
        eCard: { /* ... */ },
      },
    ];
    
    render(<Welcome messages={mockMessages} />);
    
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Congratulations!')).toBeInTheDocument();
    });
  });

  it('opens dialog when celebration card is clicked', async () => {
    const mockMessages = [
      {
        id: '1',
        senderName: 'John Doe',
        message: 'Congratulations!',
        eCard: { /* ... */ },
      },
    ];
    
    render(<Welcome messages={mockMessages} />);
    
    const messageCard = await screen.findByRole('button', {
      name: /view message from john doe/i,
    });
    await userEvent.click(messageCard);
    
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText('Message from John Doe')).toBeInTheDocument();
    });
  });

  it('supports keyboard navigation for celebration cards', async () => {
    const mockMessages = [
      {
        id: '1',
        senderName: 'John Doe',
        message: 'Congratulations!',
        eCard: { /* ... */ },
      },
    ];
    
    render(<Welcome messages={mockMessages} />);
    
    const messageCard = await screen.findByRole('button', {
      name: /view message from john doe/i,
    });
    
    messageCard.focus();
    await userEvent.keyboard('{Enter}');
    
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
  });

  it('video play button is accessible', async () => {
    render(<Welcome />);
    
    const playButton = screen.getByRole('button', {
      name: /play welcome video/i,
    });
    
    expect(playButton).toBeInTheDocument();
    expect(playButton).toHaveAttribute('aria-label');
  });
});
```


### Property 10: Loading State Skeleton Structure

*For any* page with loading state, the Skeleton components should match the structure of the actual content (same number of elements, similar dimensions).

**Validates: Requirements 6.1**

### Property 11: Skeleton Replacement

*For any* loading state that completes, the Skeleton components should be replaced with actual content components.

**Validates: Requirements 6.8**

### Property 12: Skeleton Accessibility

*For any* Skeleton component, it should have `aria-busy="true"` and `aria-label="Loading"` attributes.

**Validates: Requirements 6.10**

### Property 13: Keyboard Navigation Support

*For any* interactive element (buttons, links, form fields, cards), it should be keyboard accessible via Tab, Enter, Space, and Escape keys as appropriate.

**Validates: Requirements 7.3**

### Property 14: Focus Indicators

*For any* interactive element, when focused, it should display a visible focus indicator with at least 3:1 contrast ratio.

**Validates: Requirements 7.2**


### Property 15: Interactive Element Roles

*For any* interactive element in the application, it should have a proper `role` attribute (button, link, dialog, alert, etc.) that matches its semantic purpose.

**Validates: Requirements 2.13, 7.10**

### Property 16: Color Contrast Compliance

*For any* text element in the application, the color contrast ratio between text and background should meet WCAG AA standards (4.5:1 for normal text, 3:1 for large text).

**Validates: Requirements 7.11**

### Property 17: Text Alternatives

*For any* non-text content (images, icons, videos), the element should have appropriate text alternatives (alt text, aria-label, or title attributes).

**Validates: Requirements 7.12**

### Property 18: Touch Target Size

*For any* interactive element, the touch target should be at least 44x44 pixels to meet accessibility standards.

**Validates: Requirements 7.13**

### Property 19: Heading Hierarchy

*For any* page in the application, heading levels (h1, h2, h3, etc.) should be sequential without skipping levels.

**Validates: Requirements 7.14**


#### Property-Based Tests for Form Validation

**Validates: Requirements 1.7, 1.8, 1.9, 1.10, 1.11, 10.10**

```typescript
// src/app/schemas/__tests__/shipping.schema.property.test.ts
import { describe, it, expect } from 'vitest';
import { fc } from '@fast-check/vitest';
import { shippingSchema } from '../shipping.schema';

describe('Shipping Schema Property-Based Tests', () => {
  it('accepts valid full names', () => {
    fc.assert(
      fc.property(
        fc.stringMatching(/^[a-zA-Z\s'-]{2,100}$/),
        (fullName) => {
          const result = shippingSchema.shape.fullName.safeParse(fullName);
          expect(result.success).toBe(true);
        }
      )
    );
  });

  it('rejects invalid full names', () => {
    fc.assert(
      fc.property(
        fc.oneof(
          fc.string().filter((s) => s.length < 2),
          fc.string().filter((s) => s.length > 100),
          fc.stringMatching(/[^a-zA-Z\s'-]+/)
        ),
        (fullName) => {
          const result = shippingSchema.shape.fullName.safeParse(fullName);
          expect(result.success).toBe(false);
        }
      )
    );
  });

  it('accepts valid phone numbers', () => {
    fc.assert(
      fc.property(
        fc.stringMatching(/^[\d\s()+-]{10,}$/),
        (phone) => {
          const result = shippingSchema.shape.phone.safeParse(phone);
          expect(result.success).toBe(true);
        }
      )
    );
  });

  it('accepts valid postal codes', () => {
    fc.assert(
      fc.property(
        fc.stringMatching(/^[A-Z0-9\s-]{3,20}$/),
        (zipCode) => {
          const result = shippingSchema.shape.zipCode.safeParse(zipCode);
          expect(result.success).toBe(true);
        }
      )
    );
  });

  it('accepts valid country codes', () => {
    fc.assert(
      fc.property(
        fc.stringMatching(/^[A-Z]{2}$/),
        (country) => {
          const result = shippingSchema.shape.country.safeParse(country);
          expect(result.success).toBe(true);
        }
      )
    );
  });

  it('round-trip property: parse → format → parse produces equivalent data', () => {
    fc.assert(
      fc.property(
        fc.record({
          fullName: fc.stringMatching(/^[a-zA-Z\s'-]{2,100}$/),
          phone: fc.stringMatching(/^[\d\s()+-]{10,}$/),
          street: fc.stringMatching(/^.{5,200}$/),
          city: fc.stringMatching(/^.{2,100}$/),
          state: fc.stringMatching(/^.{2,100}$/),
          zipCode: fc.stringMatching(/^[A-Z0-9\s-]{3,20}$/),
          country: fc.stringMatching(/^[A-Z]{2}$/),
        }),
        (data) => {
          const parsed1 = shippingSchema.parse(data);
          const formatted = JSON.stringify(parsed1);
          const parsed2 = shippingSchema.parse(JSON.parse(formatted));
          
          expect(parsed2).toEqual(parsed1);
        }
      )
    );
  });
});
```


### Property 20: Internationalization Coverage

*For any* user-facing text in migrated components, the text should use i18n keys from the translation system (no hardcoded strings).

**Validates: Requirements 9.1, 9.10**

### Property 21: Locale-Based Formatting

*For any* date or number displayed in the application, the formatting should match the selected locale's conventions.

**Validates: Requirements 9.4**

### Property 22: Validation Error Translation

*For any* validation error message from Zod schemas, the error message should be translated according to the selected language.

**Validates: Requirements 9.5, 9.6**

### Property 23: Translation Fallback

*For any* missing translation key, the application should display fallback text instead of breaking or showing the key itself.

**Validates: Requirements 9.9**

### Property 24: Form Validation Round Trip

*For any* valid shipping data, parsing with Zod schema, then formatting for display, then parsing again should produce equivalent data.

**Validates: Requirements 10.10**


#### Integration Tests

```typescript
// src/app/__tests__/integration/gift-selection-flow.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { App } from '@/App';

describe('Gift Selection Flow Integration', () => {
  it('completes full user flow from landing to confirmation', async () => {
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );

    // Landing page
    const getStartedButton = screen.getByRole('button', { name: /get started/i });
    await userEvent.click(getStartedButton);

    // Access validation
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /access/i })).toBeInTheDocument();
    });

    // Fill validation form
    await userEvent.type(screen.getByLabelText(/email/i), 'test@example.com');
    await userEvent.click(screen.getByRole('button', { name: /continue/i }));

    // Welcome page
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /welcome/i })).toBeInTheDocument();
    });

    await userEvent.click(screen.getByRole('button', { name: /continue/i }));

    // Gift selection
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /select.*gift/i })).toBeInTheDocument();
    });

    const giftCard = await screen.findByRole('button', { name: /gift card/i });
    await userEvent.click(giftCard);

    // Shipping information
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /shipping/i })).toBeInTheDocument();
    });

    await userEvent.type(screen.getByLabelText(/full name/i), 'John Doe');
    await userEvent.type(screen.getByLabelText(/phone/i), '5551234567');
    await userEvent.type(screen.getByLabelText(/street/i), '123 Main St');
    await userEvent.type(screen.getByLabelText(/city/i), 'Springfield');
    await userEvent.type(screen.getByLabelText(/state/i), 'IL');
    await userEvent.type(screen.getByLabelText(/zip/i), '62701');

    await userEvent.click(screen.getByRole('button', { name: /continue/i }));

    // Confirmation
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /confirmed/i })).toBeInTheDocument();
    });
  });
});
```


## Error Handling

### Form Validation Errors

**Strategy**: Use Zod schema validation with react-hook-form to catch validation errors before submission.

**Error Display**:
- Field-level errors appear immediately below the input using FormMessage component
- Error messages are linked to inputs via `aria-describedby`
- Invalid fields are marked with `aria-invalid="true"`
- Error messages use i18n keys for translation

**Example**:
```tsx
const form = useForm<ShippingFormValues>({
  resolver: zodResolver(shippingSchema),
  mode: 'onBlur', // Validate on blur for better UX
});

// Error automatically displayed by FormMessage
<FormField
  control={form.control}
  name="fullName"
  render={({ field }) => (
    <FormItem>
      <FormLabel>{t('shipping.fullName')}</FormLabel>
      <FormControl>
        <Input {...field} />
      </FormControl>
      <FormMessage /> {/* Automatically shows translated error */}
    </FormItem>
  )}
/>
```

### API Errors

**Strategy**: Display API errors using Alert component with destructive variant.

**Error Display**:
- Alert appears at the top of the form or page
- Includes AlertCircle icon for visual identification
- Uses AlertTitle and AlertDescription for structured content
- Announced to screen readers via `aria-live="assertive"`

**Example**:
```tsx
{apiError && (
  <Alert variant="destructive">
    <AlertCircle className="h-4 w-4" />
    <AlertTitle>{t('error.apiError')}</AlertTitle>
    <AlertDescription>{apiError}</AlertDescription>
  </Alert>
)}
```


---

## Migration Strategy

### Phase-Based Rollout

**Phase 1: Form Components (Week 1)**
- Priority: Critical (accessibility issues)
- Target: ShippingInformation.tsx, AccessValidation.tsx
- Components: Form, FormField, FormControl, FormLabel, FormMessage, Input
- Deliverables:
  - Zod schemas for all forms
  - react-hook-form integration
  - Unit tests for form validation
  - Property-based tests for schemas

**Phase 2: Welcome Page (Week 2)**
- Priority: High (keyboard navigation issues)
- Target: Welcome.tsx
- Components: Card, Avatar, Skeleton, Dialog, Button
- Deliverables:
  - Keyboard-accessible celebration cards
  - Skeleton loaders for loading states
  - Dialog for full message view
  - Unit tests for keyboard navigation

**Phase 3: Button Standardization (Week 2)**
- Priority: High (consistency and accessibility)
- Target: All pages
- Components: Button
- Deliverables:
  - Replace all custom buttons with Button component
  - Add aria-labels to icon buttons
  - Add loading states to async buttons
  - Unit tests for button variants

**Phase 4: Card Components (Week 3)**
- Priority: Medium
- Target: GiftSelection.tsx, Confirmation.tsx
- Components: Card, Badge, Skeleton
- Deliverables:
  - Replace custom cards with Card component
  - Add Badge components for categories
  - Add Skeleton loaders
  - Unit tests for card interactions

**Phase 5: Dialog & Alert (Week 3)**
- Priority: Medium
- Target: Error states, confirmations
- Components: Dialog, Alert
- Deliverables:
  - Replace custom alerts with Alert component
  - Add Dialog for confirmations
  - Unit tests for dialog interactions

**Phase 6: Toast Notifications (Week 4)**
- Priority: Low
- Target: All pages using toast
- Components: Sonner (shadcn/ui wrapper)
- Deliverables:
  - Migrate to shadcn/ui Sonner
  - Consistent toast styling
  - Unit tests for toast notifications

### Rollback Plan

Each phase is independent and can be rolled back without affecting other phases:

1. **Git Branch Strategy**: Each phase in separate feature branch
2. **Feature Flags**: Use environment variables to toggle new components
3. **A/B Testing**: Deploy to subset of users first
4. **Monitoring**: Track accessibility metrics and user feedback
5. **Rollback Trigger**: If accessibility violations increase or user complaints spike


### Loading State Errors

**Strategy**: Handle loading failures gracefully with error boundaries and fallback UI.

**Error Display**:
- Replace Skeleton components with Alert component showing error
- Provide retry button for transient failures
- Log errors to monitoring service (if configured)

**Example**:
```tsx
{isLoading ? (
  <Skeleton className="h-64 w-full" />
) : error ? (
  <Alert variant="destructive">
    <AlertCircle className="h-4 w-4" />
    <AlertTitle>{t('error.loadingFailed')}</AlertTitle>
    <AlertDescription>
      {error}
      <Button variant="outline" size="sm" onClick={retry} className="mt-2">
        {t('common.retry')}
      </Button>
    </AlertDescription>
  </Alert>
) : (
  <GiftCard gift={gift} />
)}
```

### Component Rendering Errors

**Strategy**: Use React Error Boundaries to catch rendering errors and display fallback UI.

**Error Display**:
- Error boundary catches errors in component tree
- Displays user-friendly error message
- Logs error details for debugging
- Provides option to reload page or return to safe state

**Implementation**:
```tsx
class ComponentErrorBoundary extends React.Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Component error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>{t('error.componentError')}</AlertTitle>
          <AlertDescription>
            {t('error.componentErrorDescription')}
            <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
              {t('common.reload')}
            </Button>
          </AlertDescription>
        </Alert>
      );
    }

    return this.props.children;
  }
}
```


## Testing Strategy

### Dual Testing Approach

The migration requires both unit tests and property-based tests for comprehensive coverage:

- **Unit tests**: Verify specific examples, edge cases, and component rendering
- **Property-based tests**: Verify universal properties across randomized inputs

Both approaches are complementary and necessary. Unit tests catch concrete bugs in specific scenarios, while property tests verify general correctness across all inputs.

### Unit Testing

**Framework**: Vitest with @testing-library/react

**Test Categories**:
1. **Component Rendering Tests** - Verify components render with correct structure
2. **Accessibility Tests** - Verify ARIA attributes, keyboard navigation, focus management
3. **Form Validation Tests** - Verify validation errors display correctly
4. **Loading State Tests** - Verify Skeleton components appear during loading
5. **Interaction Tests** - Verify button clicks, form submissions, dialog interactions

**Example Unit Tests**:
```tsx
// src/app/components/ui/__tests__/button.test.tsx
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { Button } from '../button';

describe('Button Component', () => {
  it('renders with correct variant', () => {
    render(<Button variant="rechub">Click me</Button>);
    const button = screen.getByRole('button', { name: /click me/i });
    expect(button).toHaveClass('bg-gradient-to-r');
  });

  it('has aria-label when icon-only', () => {
    render(
      <Button size="icon" aria-label="Delete item">
        <TrashIcon />
      </Button>
    );
    expect(screen.getByLabelText('Delete item')).toBeInTheDocument();
  });

  it('shows loading state during async operation', async () => {
    const handleClick = vi.fn(() => new Promise(resolve => setTimeout(resolve, 100)));
    render(
      <Button onClick={handleClick}>
        Submit
      </Button>
    );
    
    const button = screen.getByRole('button', { name: /submit/i });
    await userEvent.click(button);
    
    expect(button).toBeDisabled();
    expect(screen.getByRole('status')).toBeInTheDocument(); // Loader2 icon
  });

  it('supports keyboard activation with Enter key', async () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    const button = screen.getByRole('button', { name: /click me/i });
    button.focus();
    await userEvent.keyboard('{Enter}');
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('supports keyboard activation with Space key', async () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    const button = screen.getByRole('button', { name: /click me/i });
    button.focus();
    await userEvent.keyboard(' ');
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```


---

## Performance Considerations

### Code Splitting

All shadcn/ui components are already tree-shakeable. No additional code splitting needed.

### Bundle Size Impact

**Before Migration**:
- Custom components with inline Tailwind: ~15KB (gzipped)
- Manual form handling: ~5KB (gzipped)
- Total: ~20KB

**After Migration**:
- shadcn/ui components: ~25KB (gzipped)
- react-hook-form: ~8KB (gzipped)
- Zod: ~12KB (gzipped)
- Total: ~45KB

**Net Impact**: +25KB (acceptable for improved accessibility and maintainability)

### Runtime Performance

- Radix UI primitives are highly optimized
- No performance regressions expected
- Improved form validation performance with Zod (compiled schemas)
- Skeleton loaders improve perceived performance

### Lazy Loading Strategy

```typescript
// Lazy load heavy components
const Dialog = lazy(() => import('@/components/ui/dialog'));
const Avatar = lazy(() => import('@/components/ui/avatar'));

// Use Suspense for loading states
<Suspense fallback={<Skeleton className="h-10 w-10 rounded-full" />}>
  <Avatar>
    <AvatarFallback>{name.charAt(0)}</AvatarFallback>
  </Avatar>
</Suspense>
```

---

## Security Considerations

### Form Validation

- Client-side validation with Zod (user experience)
- Server-side validation required (security)
- Never trust client-side validation alone

### XSS Prevention

- All user input sanitized before rendering
- React's built-in XSS protection
- No `dangerouslySetInnerHTML` usage

### CSRF Protection

- Forms include CSRF tokens
- Supabase handles authentication tokens securely

---

## Monitoring and Metrics

### Accessibility Metrics

Track via automated tools (axe-core):
- Number of WCAG violations (target: 0)
- Keyboard navigation coverage (target: 100%)
- ARIA attribute correctness (target: 100%)

### User Experience Metrics

Track via analytics:
- Form completion rate (target: >80%)
- Form validation error rate (target: <20%)
- Time to complete shipping form (target: <2 minutes)
- Dialog interaction rate (target: >50% of users view full messages)

### Performance Metrics

Track via Web Vitals:
- Largest Contentful Paint (LCP) - target: <2.5s
- First Input Delay (FID) - target: <100ms
- Cumulative Layout Shift (CLS) - target: <0.1

### Error Tracking

Monitor via error tracking service:
- Form validation errors
- Component rendering errors
- Accessibility violations in production

---

## Documentation Updates

### Component Usage Guide

Update `.kiro/skills/shadcn-ui/SKILL.md` with:
- RecHUB-specific customizations
- Form validation patterns
- Keyboard navigation examples
- i18n integration patterns

### Developer Onboarding

Create new documentation:
- `docs/components/forms.md` - Form component usage
- `docs/components/cards.md` - Card component patterns
- `docs/accessibility/keyboard-navigation.md` - Keyboard navigation guide
- `docs/testing/property-based-tests.md` - Property-based testing guide

---

## Success Criteria

### Technical Success

- ✅ All 10 requirements met with 118 acceptance criteria
- ✅ Zero accessibility violations (axe-core)
- ✅ 80%+ test coverage for migrated components
- ✅ All tests passing (unit, integration, property-based, E2E)
- ✅ No TypeScript errors
- ✅ Lint validation passes

### User Success

- ✅ Form completion rate >80%
- ✅ User complaints about accessibility <5% of baseline
- ✅ Keyboard navigation works for all interactive elements
- ✅ Screen reader compatibility verified

### Business Success

- ✅ Reduced maintenance overhead (30% less component code)
- ✅ Faster feature development (reusable primitives)
- ✅ Improved brand consistency (RecHUB design system)
- ✅ WCAG 2.1 Level AA compliance maintained


```tsx
// src/app/pages/__tests__/ShippingInformation.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { ShippingInformation } from '../ShippingInformation';

describe('ShippingInformation Form', () => {
  it('displays validation errors for invalid inputs', async () => {
    render(<ShippingInformation />);
    
    const submitButton = screen.getByRole('button', { name: /continue/i });
    await userEvent.click(submitButton);
    
    // Should show validation errors
    expect(await screen.findByText(/name must be at least 2 characters/i)).toBeInTheDocument();
    expect(await screen.findByText(/street address is required/i)).toBeInTheDocument();
  });

  it('links labels to inputs via htmlFor', () => {
    render(<ShippingInformation />);
    
    const nameLabel = screen.getByText(/full name/i);
    const nameInput = screen.getByLabelText(/full name/i);
    
    expect(nameLabel).toHaveAttribute('for', nameInput.id);
  });

  it('links error messages to inputs via aria-describedby', async () => {
    render(<ShippingInformation />);
    
    const nameInput = screen.getByLabelText(/full name/i);
    await userEvent.type(nameInput, 'A'); // Too short
    await userEvent.tab(); // Trigger validation
    
    await waitFor(() => {
      const errorMessage = screen.getByText(/name must be at least 2 characters/i);
      expect(nameInput).toHaveAttribute('aria-describedby', errorMessage.id);
      expect(nameInput).toHaveAttribute('aria-invalid', 'true');
    });
  });

  it('only requires name and phone in company shipping mode', async () => {
    render(<ShippingInformation companyShippingMode={true} />);
    
    // Fill only required fields
    await userEvent.type(screen.getByLabelText(/full name/i), 'John Doe');
    await userEvent.type(screen.getByLabelText(/phone/i), '1234567890');
    
    const submitButton = screen.getByRole('button', { name: /continue/i });
    await userEvent.click(submitButton);
    
    // Should not show validation errors for optional fields
    expect(screen.queryByText(/street address is required/i)).not.toBeInTheDocument();
  });
});
```


```tsx
// src/app/pages/__tests__/Welcome.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { Welcome } from '../Welcome';

describe('Welcome Page', () => {
  it('renders celebration messages with Card components', async () => {
    const mockMessages = [
      { id: '1', senderName: 'John Doe', message: 'Congrats!', eCard: ECARD_TEMPLATES[0] }
    ];
    
    render(<Welcome messages={mockMessages} />);
    
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });
    
    // Verify Card structure
    const card = screen.getByRole('button', { name: /message from john doe/i });
    expect(card).toBeInTheDocument();
  });

  it('shows skeleton loaders while loading', () => {
    render(<Welcome isLoading={true} />);
    
    // Should show 6 skeleton cards
    const skeletons = screen.getAllByRole('status', { name: /loading/i });
    expect(skeletons).toHaveLength(6);
  });

  it('makes celebration cards keyboard navigable', async () => {
    const mockMessages = [
      { id: '1', senderName: 'John Doe', message: 'Congrats!', eCard: ECARD_TEMPLATES[0] }
    ];
    
    render(<Welcome messages={mockMessages} />);
    
    await waitFor(() => {
      const card = screen.getByRole('button', { name: /message from john doe/i });
      expect(card).toBeInTheDocument();
    });
    
    // Test Tab navigation
    const card = screen.getByRole('button', { name: /message from john doe/i });
    await userEvent.tab();
    expect(card).toHaveFocus();
  });

  it('opens dialog when Enter is pressed on celebration card', async () => {
    const mockMessages = [
      { id: '1', senderName: 'John Doe', message: 'Congrats!', eCard: ECARD_TEMPLATES[0] }
    ];
    
    render(<Welcome messages={mockMessages} />);
    
    await waitFor(() => {
      const card = screen.getByRole('button', { name: /message from john doe/i });
      expect(card).toBeInTheDocument();
    });
    
    const card = screen.getByRole('button', { name: /message from john doe/i });
    card.focus();
    await userEvent.keyboard('{Enter}');
    
    // Dialog should open
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText(/message from john doe/i)).toBeInTheDocument();
  });

  it('closes dialog when Escape is pressed', async () => {
    const mockMessages = [
      { id: '1', senderName: 'John Doe', message: 'Congrats!', eCard: ECARD_TEMPLATES[0] }
    ];
    
    render(<Welcome messages={mockMessages} />);
    
    // Open dialog
    await waitFor(() => {
      const card = screen.getByRole('button', { name: /message from john doe/i });
      expect(card).toBeInTheDocument();
    });
    
    const card = screen.getByRole('button', { name: /message from john doe/i });
    await userEvent.click(card);
    
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    
    // Press Escape
    await userEvent.keyboard('{Escape}');
    
    // Dialog should close
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  it('video play button has aria-label', () => {
    render(<Welcome />);
    
    const playButton = screen.getByRole('button', { name: /play welcome video/i });
    expect(playButton).toHaveAttribute('aria-label', 'Play welcome video');
  });

  it('displays sender initials in Avatar fallback', async () => {
    const mockMessages = [
      { id: '1', senderName: 'John Doe', message: 'Congrats!', eCard: ECARD_TEMPLATES[0] }
    ];
    
    render(<Welcome messages={mockMessages} />);
    
    await waitFor(() => {
      expect(screen.getByText('J')).toBeInTheDocument(); // First initial
    });
  });
});
```


### Property-Based Testing

**Framework**: @fast-check/vitest

**Configuration**: Minimum 100 iterations per property test (due to randomization)

**Test Annotation**: Each property test must reference its design document property using the format:
```tsx
/**
 * Feature: shadcn-ui-improvements, Property 3: Zod Schema Validation
 */
```

**Example Property Tests**:
```tsx
// src/app/schemas/__tests__/shipping.property.test.ts
import { describe, it, expect } from 'vitest';
import { fc, test } from '@fast-check/vitest';
import { shippingSchema } from '../shipping.schema';

/**
 * Feature: shadcn-ui-improvements, Property 3: Zod Schema Validation
 */
describe('Shipping Schema Validation Properties', () => {
  test.prop([
    fc.string({ minLength: 2 }).filter(s => /^[a-zA-Z\s\-']+$/.test(s))
  ])('accepts valid full names', (name) => {
    const result = shippingSchema.shape.fullName.safeParse(name);
    expect(result.success).toBe(true);
  }, { numRuns: 100 });

  test.prop([
    fc.oneof(
      fc.constant(''),
      fc.constant('A'),
      fc.string().filter(s => /[^a-zA-Z\s\-']/.test(s))
    )
  ])('rejects invalid full names', (name) => {
    const result = shippingSchema.shape.fullName.safeParse(name);
    expect(result.success).toBe(false);
  }, { numRuns: 100 });

  test.prop([
    fc.string({ minLength: 10 }).filter(s => /^[\d\s()+\-]+$/.test(s))
  ])('accepts valid phone numbers', (phone) => {
    const result = shippingSchema.shape.phone.safeParse(phone);
    expect(result.success).toBe(true);
  }, { numRuns: 100 });

  test.prop([
    fc.string({ minLength: 5 })
  ])('accepts valid street addresses', (street) => {
    const result = shippingSchema.shape.street.safeParse(street);
    expect(result.success).toBe(true);
  }, { numRuns: 100 });

  test.prop([
    fc.constantFrom('US', 'CA', 'GB', 'FR', 'DE', 'ES', 'IT', 'JP', 'AU', 'NZ')
  ])('accepts valid country codes', (country) => {
    const result = shippingSchema.shape.country.safeParse(country);
    expect(result.success).toBe(true);
  }, { numRuns: 100 });

  test.prop([
    fc.oneof(
      fc.string({ minLength: 1, maxLength: 1 }),
      fc.string({ minLength: 3 }).filter(s => !/^[A-Z]{2}$/.test(s))
    )
  ])('rejects invalid country codes', (country) => {
    const result = shippingSchema.shape.country.safeParse(country);
    expect(result.success).toBe(false);
  }, { numRuns: 100 });
});
```


```tsx
/**
 * Feature: shadcn-ui-improvements, Property 24: Form Validation Round Trip
 */
describe('Form Validation Round Trip Property', () => {
  test.prop([
    fc.record({
      fullName: fc.string({ minLength: 2 }).filter(s => /^[a-zA-Z\s\-']+$/.test(s)),
      phone: fc.string({ minLength: 10 }).filter(s => /^[\d\s()+\-]+$/.test(s)),
      street: fc.string({ minLength: 5 }),
      city: fc.string({ minLength: 2 }),
      state: fc.string({ minLength: 2 }),
      postalCode: fc.string({ minLength: 3 }),
      country: fc.constantFrom('US', 'CA', 'GB', 'FR', 'DE'),
    })
  ])('parsing then formatting then parsing produces equivalent data', (data) => {
    // Parse with Zod
    const parsed1 = shippingSchema.parse(data);
    
    // Format for display (simulate form display)
    const formatted = {
      ...parsed1,
      phone: parsed1.phone.replace(/\s/g, ''), // Normalize phone
    };
    
    // Parse again
    const parsed2 = shippingSchema.parse(formatted);
    
    // Should be equivalent
    expect(parsed2).toEqual(parsed1);
  }, { numRuns: 100 });
});
```

```tsx
/**
 * Feature: shadcn-ui-improvements, Property 4: Sender Initials Extraction
 */
describe('Avatar Initials Property', () => {
  test.prop([
    fc.string({ minLength: 1 })
  ])('extracts first character as initial', (name) => {
    const initial = name.charAt(0);
    expect(initial).toBe(name[0]);
    expect(initial.length).toBe(1);
  }, { numRuns: 100 });
});
```

```tsx
/**
 * Feature: shadcn-ui-improvements, Property 20: Internationalization Coverage
 */
describe('Internationalization Property', () => {
  test.prop([
    fc.constantFrom(
      'Button', 'Card', 'Dialog', 'Alert', 'Form', 'Input', 'Label'
    )
  ])('component text uses i18n keys', (componentName) => {
    const componentFile = readFileSync(`src/app/components/ui/${componentName.toLowerCase()}.tsx`, 'utf-8');
    
    // Should not contain hardcoded user-facing strings
    const hardcodedStrings = componentFile.match(/"[A-Z][a-z]+\s[a-z]+"/g) || [];
    const userFacingStrings = hardcodedStrings.filter(s => 
      !s.includes('className') && 
      !s.includes('data-') &&
      !s.includes('aria-')
    );
    
    expect(userFacingStrings.length).toBe(0);
  }, { numRuns: 100 });
});
```


### Integration Testing

**Purpose**: Test complete user flows across multiple components.

**Example Integration Tests**:
```tsx
// src/app/__tests__/integration/gift-selection-flow.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { App } from '@/App';

describe('Gift Selection Flow Integration', () => {
  it('completes full flow from landing to confirmation', async () => {
    render(<App />);
    
    // Landing page
    const getStartedButton = screen.getByRole('button', { name: /get started/i });
    await userEvent.click(getStartedButton);
    
    // Access validation
    await userEvent.type(screen.getByLabelText(/email/i), 'test@example.com');
    await userEvent.click(screen.getByRole('button', { name: /continue/i }));
    
    // Welcome page
    await waitFor(() => {
      expect(screen.getByText(/welcome/i)).toBeInTheDocument();
    });
    await userEvent.click(screen.getByRole('button', { name: /continue/i }));
    
    // Gift selection
    await waitFor(() => {
      expect(screen.getByText(/select your gift/i)).toBeInTheDocument();
    });
    const giftCard = screen.getAllByRole('button', { name: /select gift/i })[0];
    await userEvent.click(giftCard);
    
    // Shipping information
    await waitFor(() => {
      expect(screen.getByText(/shipping information/i)).toBeInTheDocument();
    });
    
    await userEvent.type(screen.getByLabelText(/full name/i), 'John Doe');
    await userEvent.type(screen.getByLabelText(/phone/i), '1234567890');
    await userEvent.type(screen.getByLabelText(/street/i), '123 Main St');
    await userEvent.type(screen.getByLabelText(/city/i), 'New York');
    await userEvent.type(screen.getByLabelText(/state/i), 'NY');
    await userEvent.type(screen.getByLabelText(/postal code/i), '10001');
    await userEvent.type(screen.getByLabelText(/country/i), 'US');
    
    await userEvent.click(screen.getByRole('button', { name: /continue/i }));
    
    // Confirmation
    await waitFor(() => {
      expect(screen.getByText(/order confirmed/i)).toBeInTheDocument();
    });
  });
});
```


### E2E Testing

**Framework**: Playwright

**Purpose**: Test critical user paths in real browser environments.

**Test Location**: `e2e/` directory (separate from Vitest tests)

**Example E2E Tests**:
```tsx
// e2e/gift-selection-accessibility.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Gift Selection Accessibility', () => {
  test('keyboard navigation works throughout flow', async ({ page }) => {
    await page.goto('/');
    
    // Tab to Get Started button
    await page.keyboard.press('Tab');
    await page.keyboard.press('Enter');
    
    // Should navigate to access validation
    await expect(page).toHaveURL(/access/);
    
    // Tab through form fields
    await page.keyboard.press('Tab'); // Email field
    await page.keyboard.type('test@example.com');
    await page.keyboard.press('Tab'); // Continue button
    await page.keyboard.press('Enter');
    
    // Should navigate to welcome
    await expect(page).toHaveURL(/welcome/);
  });

  test('screen reader announces form errors', async ({ page }) => {
    await page.goto('/shipping');
    
    // Submit empty form
    await page.click('button:has-text("Continue")');
    
    // Check for aria-live region with errors
    const errorRegion = page.locator('[aria-live="polite"]');
    await expect(errorRegion).toBeVisible();
    
    // Check for aria-invalid on fields
    const nameInput = page.locator('input[name="fullName"]');
    await expect(nameInput).toHaveAttribute('aria-invalid', 'true');
  });

  test('focus indicators are visible', async ({ page }) => {
    await page.goto('/gift-selection');
    
    // Tab to first gift card
    await page.keyboard.press('Tab');
    
    // Check for visible focus indicator
    const focusedElement = page.locator(':focus');
    const outline = await focusedElement.evaluate(el => 
      window.getComputedStyle(el).outline
    );
    
    expect(outline).not.toBe('none');
  });

  test('dialog traps focus', async ({ page }) => {
    await page.goto('/welcome');
    
    // Open celebration message dialog
    await page.click('button:has-text("View Message")');
    
    // Dialog should be visible
    await expect(page.locator('[role="dialog"]')).toBeVisible();
    
    // Tab through dialog elements
    await page.keyboard.press('Tab');
    const focusedElement1 = await page.evaluate(() => document.activeElement?.tagName);
    
    await page.keyboard.press('Tab');
    const focusedElement2 = await page.evaluate(() => document.activeElement?.tagName);
    
    // Focus should stay within dialog
    const dialogElement = page.locator('[role="dialog"]');
    const isFocusInDialog = await dialogElement.evaluate((dialog) => {
      return dialog.contains(document.activeElement);
    });
    
    expect(isFocusInDialog).toBe(true);
  });
});
```


```tsx
// e2e/component-migration.spec.ts
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Component Migration Accessibility', () => {
  test('shipping form has no accessibility violations', async ({ page }) => {
    await page.goto('/shipping');
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();
    
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('welcome page has no accessibility violations', async ({ page }) => {
    await page.goto('/welcome');
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();
    
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('gift selection has no accessibility violations', async ({ page }) => {
    await page.goto('/gift-selection');
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();
    
    expect(accessibilityScanResults.violations).toEqual([]);
  });
});
```

### Test Execution Commands

**Local Development**:
```bash
# Run unit tests (safe mode with limited concurrency)
npm run test:safe

# Run specific test category
npm run test:ui-components
npm run test:pages-user

# Run tests in watch mode
npm run test:watch

# Run E2E tests
npm run test:e2e

# Run E2E tests in UI mode (for debugging)
npm run test:e2e:ui
```

**CI Environment**:
```bash
# Run all tests with higher concurrency
npm run test:full

# Run all test categories sequentially
npm run test:all

# Generate coverage report
npm run test:coverage
```

### Test Coverage Goals

- **Overall Coverage**: Minimum 80% for migrated components
- **Unit Tests**: Cover all component rendering, props, and interactions
- **Property Tests**: Cover all validation schemas and universal properties
- **Integration Tests**: Cover complete user flows
- **E2E Tests**: Cover critical accessibility paths


## Implementation Phases

### Phase 1: Form Components (Week 1)

**Priority**: Critical

**Pages**: ShippingInformation.tsx, AccessValidation.tsx

**Tasks**:
1. Create Zod validation schemas in `src/app/schemas/`
2. Migrate forms to react-hook-form + zodResolver
3. Replace raw inputs with FormField + FormControl + Input components
4. Add FormMessage components for validation errors
5. Test ARIA linkage (labels, descriptions, invalid states)
6. Add loading states to submit buttons
7. Write unit tests for form validation
8. Write property tests for Zod schemas

**Success Criteria**:
- All form fields have proper ARIA linkage
- Validation errors display inline with FormMessage
- Form submission shows loading state
- All tests pass with 80%+ coverage

### Phase 2: Welcome Page Components (Week 1-2)

**Priority**: Critical

**Pages**: Welcome.tsx

**Tasks**:
1. Replace custom celebration cards with Card components
2. Replace custom buttons with Button components
3. Add Avatar components for sender information
4. Add Skeleton loaders for celebration messages (6 cards)
5. Make celebration cards keyboard accessible (button elements)
6. Add Dialog component for viewing full messages
7. Add proper aria-labels to video play button
8. Test keyboard navigation (Tab, Enter, Space, Escape)
9. Write unit tests for card rendering and interactions
10. Write E2E tests for keyboard accessibility

**Success Criteria**:
- Celebration cards are keyboard navigable
- Skeleton loaders appear during loading
- Dialog opens/closes with keyboard
- All interactive elements have proper ARIA attributes
- All tests pass with 80%+ coverage


### Phase 3: Button Standardization (Week 2)

**Priority**: High

**Pages**: All pages with buttons/links

**Tasks**:
1. Replace custom button classes with Button component
2. Use Button with asChild pattern for Link components
3. Add aria-labels to all icon-only buttons
4. Add loading states to async buttons (Loader2 icon)
5. Ensure consistent focus indicators
6. Test keyboard activation (Enter and Space keys)
7. Write unit tests for button variants and states
8. Write property tests for keyboard activation

**Success Criteria**:
- All buttons use Button component
- All icon buttons have aria-labels
- Loading states work correctly
- Keyboard activation works for all buttons
- All tests pass with 80%+ coverage

### Phase 4: Card Standardization (Week 2-3)

**Priority**: Medium

**Pages**: GiftSelection.tsx, Confirmation.tsx

**Tasks**:
1. Replace custom card divs with Card components
2. Add Badge components for gift categories
3. Add Skeleton loaders for gift cards (6 cards)
4. Make gift cards keyboard navigable
5. Test keyboard selection (Enter and Space keys)
6. Write unit tests for card rendering
7. Write integration tests for gift selection flow

**Success Criteria**:
- All cards use Card component
- Skeleton loaders match card structure
- Gift cards are keyboard accessible
- All tests pass with 80%+ coverage


### Phase 5: Dialog & Alert Components (Week 3)

**Priority**: Medium

**Pages**: Confirmation.tsx, error states across all pages

**Tasks**:
1. Replace custom success banner with Alert component
2. Add Dialog components for confirmation prompts
3. Test focus trap in dialogs
4. Test Escape key handling
5. Test aria-live announcements for alerts
6. Write unit tests for dialog and alert components
7. Write E2E tests for dialog accessibility

**Success Criteria**:
- All alerts use Alert component
- All modals use Dialog component
- Focus trap works correctly
- Escape key closes dialogs
- All tests pass with 80%+ coverage

### Phase 6: Toast Notifications (Week 3-4)

**Priority**: Low

**Pages**: All pages using toast notifications

**Tasks**:
1. Install shadcn/ui Sonner component
2. Add Toaster to App.tsx
3. Update toast calls to use shadcn/ui styled component
4. Test toast positioning and styling
5. Write unit tests for toast notifications

**Success Criteria**:
- All toasts use shadcn/ui Sonner
- Toast styling matches RecHUB design
- All tests pass with 80%+ coverage


## Migration Checklist

### Pre-Migration
- [x] Audit all public pages for component usage (completed in PLAN.md)
- [ ] Document current styling patterns
- [ ] Create Zod schemas for all forms
- [ ] Set up property-based testing infrastructure

### Phase 1: Forms
- [ ] Create shipping.schema.ts with Zod validation
- [ ] Migrate ShippingInformation.tsx to react-hook-form
- [ ] Migrate AccessValidation.tsx to react-hook-form
- [ ] Add FormField, FormControl, FormMessage components
- [ ] Test ARIA linkage and validation
- [ ] Write unit tests for forms
- [ ] Write property tests for Zod schemas
- [ ] Run accessibility audit with axe-core

### Phase 2: Welcome Page
- [ ] Replace celebration cards with Card components
- [ ] Replace buttons with Button components
- [ ] Add Avatar components for senders
- [ ] Add Skeleton loaders (6 cards)
- [ ] Make cards keyboard accessible (button elements)
- [ ] Add Dialog for full message view
- [ ] Add aria-label to video play button
- [ ] Write unit tests for Welcome page
- [ ] Write E2E tests for keyboard navigation
- [ ] Run accessibility audit with axe-core

### Phase 3: Buttons
- [ ] Replace all custom buttons with Button component
- [ ] Use Button with asChild for Link components
- [ ] Add aria-labels to icon-only buttons
- [ ] Add loading states to async buttons
- [ ] Test keyboard activation
- [ ] Write unit tests for buttons
- [ ] Write property tests for keyboard activation
- [ ] Run accessibility audit with axe-core

### Phase 4: Cards
- [ ] Replace gift cards with Card components
- [ ] Add Badge components for categories
- [ ] Add Skeleton loaders for gifts (6 cards)
- [ ] Make gift cards keyboard accessible
- [ ] Test keyboard selection
- [ ] Write unit tests for cards
- [ ] Write integration tests for gift selection
- [ ] Run accessibility audit with axe-core

### Phase 5: Dialogs & Alerts
- [ ] Replace success banner with Alert component
- [ ] Add Dialog for confirmation prompts
- [ ] Test focus trap in dialogs
- [ ] Test Escape key handling
- [ ] Test aria-live announcements
- [ ] Write unit tests for dialogs and alerts
- [ ] Write E2E tests for dialog accessibility
- [ ] Run accessibility audit with axe-core

### Phase 6: Toasts
- [ ] Install shadcn/ui Sonner component
- [ ] Add Toaster to App.tsx
- [ ] Update toast calls
- [ ] Test toast styling
- [ ] Write unit tests for toasts
- [ ] Run accessibility audit with axe-core

### Post-Migration
- [ ] Run full E2E test suite with Playwright
- [ ] Perform manual accessibility testing with screen reader
- [ ] Update component documentation
- [ ] Remove unused custom components
- [ ] Run `npm run type-check` to verify no TypeScript errors
- [ ] Run `npm run lint:validate` to ensure no lint regressions
- [ ] Verify 80%+ test coverage
- [ ] Deploy to development environment for testing
- [ ] Get stakeholder approval
- [ ] Deploy to production


## Success Metrics

### Code Quality Metrics

**Reduction in Boilerplate**:
- Target: 30% reduction in component code
- Measure: Lines of code before vs. after migration
- Benefit: Faster development, easier maintenance

**Test Coverage**:
- Target: 80%+ coverage for migrated components
- Measure: Coverage reports from Vitest
- Benefit: Confidence in code correctness

**TypeScript Errors**:
- Target: Zero new TypeScript errors
- Measure: `npm run type-check` output
- Benefit: Type safety and IDE support

**Lint Warnings**:
- Target: No increase in lint warnings
- Measure: `npm run lint:validate` output
- Benefit: Code quality consistency

### Accessibility Metrics

**WCAG Compliance**:
- Target: Zero accessibility violations (axe-core)
- Measure: Automated accessibility audits
- Benefit: Legal compliance, inclusive design

**Keyboard Navigation**:
- Target: 100% of interactive elements keyboard accessible
- Measure: Manual testing and E2E tests
- Benefit: Accessibility for motor-impaired users

**Screen Reader Support**:
- Target: All content announced correctly
- Measure: Manual testing with NVDA/JAWS
- Benefit: Accessibility for visually-impaired users

**Focus Indicators**:
- Target: 3:1 contrast ratio on all focus indicators
- Measure: Automated contrast checks
- Benefit: Visibility for keyboard users


### User Experience Metrics

**Loading State Feedback**:
- Target: 100% of async operations show loading state
- Measure: Manual testing and unit tests
- Benefit: User confidence, perceived performance

**Form Validation UX**:
- Target: Inline validation errors on all form fields
- Measure: Unit tests and E2E tests
- Benefit: Clear feedback, reduced errors

**Consistent Styling**:
- Target: All components use RecHUB design system
- Measure: Visual regression testing
- Benefit: Brand consistency, professional appearance

**Multi-Language Support**:
- Target: 100% of component text translated
- Measure: i18n coverage analysis
- Benefit: Global accessibility

### Developer Experience Metrics

**Component Reusability**:
- Target: 50+ reusable shadcn/ui components available
- Measure: Component library inventory
- Benefit: Faster feature development

**Development Speed**:
- Target: 40% faster component development
- Measure: Time to implement new features
- Benefit: Increased productivity

**Documentation Quality**:
- Target: All components documented with examples
- Measure: Documentation coverage
- Benefit: Easier onboarding, fewer questions

**Build Performance**:
- Target: No increase in build time
- Measure: `npm run build` execution time
- Benefit: Fast iteration cycles


## Risk Mitigation

### Technical Risks

**Risk**: Breaking existing functionality during migration
- **Mitigation**: Migrate one page at a time, comprehensive testing after each phase
- **Rollback Plan**: Git branches for each phase, easy revert if issues found

**Risk**: Performance degradation from additional component layers
- **Mitigation**: Monitor bundle size, use code splitting, lazy load components
- **Measurement**: Lighthouse performance scores before/after

**Risk**: TypeScript errors from component prop changes
- **Mitigation**: Run `npm run type-check` after each change, fix errors immediately
- **Prevention**: Use TypeScript strict mode, proper type definitions

**Risk**: Accessibility regressions during migration
- **Mitigation**: Run axe-core audits after each phase, manual screen reader testing
- **Prevention**: Follow WCAG 2.1 AA guidelines, use semantic HTML

### User Experience Risks

**Risk**: Visual inconsistencies during partial migration
- **Mitigation**: Complete migration page-by-page, not component-by-component
- **Prevention**: Use feature flags to hide incomplete pages

**Risk**: Broken user flows during migration
- **Mitigation**: Run E2E tests after each phase, manual testing of critical paths
- **Prevention**: Integration tests for complete flows

**Risk**: Translation gaps in new components
- **Mitigation**: Verify all i18n keys exist before deployment
- **Prevention**: Automated checks for hardcoded strings

### Project Risks

**Risk**: Timeline delays due to unexpected complexity
- **Mitigation**: Buffer time in schedule, prioritize critical phases
- **Prevention**: Detailed planning, early identification of blockers

**Risk**: Stakeholder dissatisfaction with design changes
- **Mitigation**: Regular demos, early feedback, design mockups
- **Prevention**: Preserve RecHUB design system, minimal visual changes

**Risk**: Team knowledge gaps with new libraries
- **Mitigation**: Documentation, pair programming, code reviews
- **Prevention**: Training sessions, example implementations


## Appendix

### Technology Stack

- **React**: 18.x
- **TypeScript**: 5.7.3
- **Vite**: 6.4.1
- **React Router**: 7 (data mode with lazy loading)
- **Tailwind CSS**: v4 (via @tailwindcss/vite)
- **shadcn/ui**: Latest (Radix UI primitives)
- **react-hook-form**: Latest
- **Zod**: Latest
- **Vitest**: 3.2.4
- **@testing-library/react**: Latest
- **@fast-check/vitest**: Latest (property-based testing)
- **Playwright**: Latest (E2E testing)

### Key Dependencies

```json
{
  "dependencies": {
    "react": "^18.0.0",
    "react-hook-form": "^7.0.0",
    "zod": "^3.0.0",
    "@radix-ui/react-dialog": "^1.0.0",
    "@radix-ui/react-alert-dialog": "^1.0.0",
    "@radix-ui/react-avatar": "^1.0.0",
    "lucide-react": "^0.0.0",
    "sonner": "^1.0.0"
  },
  "devDependencies": {
    "vitest": "^3.2.4",
    "@testing-library/react": "^14.0.0",
    "@testing-library/user-event": "^14.0.0",
    "@fast-check/vitest": "^0.0.0",
    "@playwright/test": "^1.0.0",
    "@axe-core/playwright": "^4.0.0"
  }
}
```

### File Structure

```
src/app/
├── components/
│   ├── ui/                          # shadcn/ui primitives
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── form.tsx
│   │   ├── input.tsx
│   │   ├── dialog.tsx
│   │   ├── alert.tsx
│   │   ├── skeleton.tsx
│   │   ├── avatar.tsx
│   │   ├── badge.tsx
│   │   └── __tests__/              # Component unit tests
│   └── [feature]/                   # Feature-specific components
├── pages/
│   ├── Landing.tsx
│   ├── AccessValidation.tsx
│   ├── Welcome.tsx
│   ├── GiftSelection.tsx
│   ├── ShippingInformation.tsx
│   ├── Confirmation.tsx
│   └── __tests__/                   # Page unit tests
├── schemas/
│   ├── shipping.schema.ts
│   ├── validation.schema.ts
│   └── __tests__/                   # Schema property tests
├── __tests__/
│   └── integration/                 # Integration tests
└── App.tsx

e2e/
├── gift-selection-flow.spec.ts
├── accessibility.spec.ts
└── component-migration.spec.ts
```


### References

**Documentation**:
- [shadcn/ui Documentation](https://ui.shadcn.com)
- [Radix UI Primitives](https://www.radix-ui.com)
- [React Hook Form](https://react-hook-form.com)
- [Zod Validation](https://zod.dev)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Vitest Documentation](https://vitest.dev)
- [fast-check Documentation](https://fast-check.dev)
- [Playwright Documentation](https://playwright.dev)

**Internal Resources**:
- RecHUB Design System Guidelines
- JALA 2 Component Library
- Accessibility Testing Procedures
- i18n Translation Guidelines

### Glossary

- **shadcn/ui**: Collection of reusable UI components built on Radix UI primitives
- **Radix UI**: Unstyled, accessible component primitives
- **react-hook-form**: Performant form state management library
- **Zod**: TypeScript-first schema validation library
- **ARIA**: Accessible Rich Internet Applications (accessibility attributes)
- **WCAG**: Web Content Accessibility Guidelines
- **Property-Based Testing**: Testing approach that verifies properties across randomized inputs
- **Focus Trap**: Technique to keep keyboard focus within a modal dialog
- **Skeleton Component**: Loading placeholder that matches content structure
- **RecHUB**: JALA 2 design system with brand colors

