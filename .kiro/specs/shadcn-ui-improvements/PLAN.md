# shadcn/ui Improvement Plan for Public-Facing Application

**Date**: February 24, 2026  
**Scope**: Public user flow (Landing → Access → Welcome → Gift Selection → Shipping → Confirmation)  
**Goal**: Migrate from custom components to shadcn/ui primitives for consistency, accessibility, and maintainability

---

## Executive Summary

The public-facing application currently uses **custom-built components** with Tailwind CSS classes directly in JSX. While functional, this approach creates:
- Inconsistent styling patterns across pages
- Accessibility gaps (missing ARIA labels, focus management)
- Maintenance overhead (repeated class strings)
- Limited reusability

**Recommendation**: Systematically migrate to shadcn/ui components while preserving the existing RecHUB design system (magenta #D91C81, deep blue #1B2A5E, cyan #00B4CC).

---

## Current State Analysis

### ✅ Strengths
1. **shadcn/ui Already Installed**: 50+ components available in `src/app/components/ui/`
2. **Good Component Coverage**: Button, Input, Form, Dialog, Card, Badge, Skeleton, etc.
3. **Accessibility Foundation**: Components built on Radix UI primitives
4. **Custom Styling**: Input component already customized with brand colors (#D91C81 focus rings)

### ❌ Issues Found

#### 1. **Inconsistent Component Usage**
- **Landing.tsx**: Uses raw `<Link>` with inline Tailwind classes instead of `<Button asChild>`
- **Welcome.tsx**: Custom card grid for celebration messages instead of `<Card>` components
- **Welcome.tsx**: Raw button with inline styles instead of `<Button>` with custom variant
- **Welcome.tsx**: Missing loading skeleton for celebration messages
- **GiftSelection.tsx**: Custom card implementation instead of `<Card>` component
- **ShippingInformation.tsx**: Raw `<input>` elements instead of `<Form>` + `<Input>` components
- **Confirmation.tsx**: Custom success banner instead of `<Alert>` component

#### 2. **Accessibility Gaps**
- **Missing ARIA labels** on icon-only buttons (dev mode floating buttons, Welcome video play button)
- **No FormControl wrapper** in ShippingInformation.tsx (breaks ARIA linkage)
- **Inconsistent focus indicators** (some use custom focus rings, some don't)
- **No loading states** on buttons during async operations
- **Welcome.tsx**: Video iframe missing title attribute
- **Welcome.tsx**: Celebration cards not keyboard navigable (div with onClick instead of button)

#### 3. **Form Validation Issues**
- **No react-hook-form integration** in ShippingInformation.tsx
- **No Zod schemas** for validation
- **Manual error handling** instead of FormMessage components
- **No field-level validation feedback**

#### 4. **Missing Components**
- **No Toast notifications** (using sonner but not shadcn/ui Sonner component)
- **No Skeleton loaders** during data fetching (Welcome, GiftSelection)
- **No Progress indicators** for multi-step flow
- **No Badge components** for status indicators
- **No Avatar components** for user/sender representations (Welcome page)
- **No Dialog component** for viewing full celebration messages (Welcome page)

---

## Welcome Page Specific Issues

### Critical Issues
1. **Celebration Cards Not Keyboard Accessible**
   - Using `<div>` with `onClick` instead of `<button>`
   - Cannot be navigated with Tab key
   - Cannot be activated with Enter/Space keys
   - Violates WCAG 2.1.1 (Keyboard)

2. **Video Play Button Missing Proper Structure**
   - Custom div-based button instead of semantic `<button>`
   - Inline styles instead of Button component
   - Inconsistent with other buttons in the app

3. **No Loading States**
   - Celebration messages load without skeleton
   - Users see empty space during fetch
   - No indication that content is loading

### Medium Issues
1. **Inconsistent Avatar Implementation**
   - Custom div with initials instead of Avatar component
   - Inline styles for background color
   - Not reusable across the app

2. **No Modal for Full Message View**
   - Users can't expand celebration messages
   - Limited interaction with eCards
   - Missing opportunity for better UX

3. **Continue Button Uses Inline Styles**
   - `style={{ backgroundColor: primaryColor }}` instead of CSS variables
   - Not using Button component variants
   - Harder to maintain and theme

### Low Issues
1. **Missing Empty State Component**
   - No visual feedback when no celebration messages exist
   - Could use Alert or Card component for better UX

2. **Video Iframe Missing Title**
   - Accessibility issue for screen readers
   - Should have descriptive title attribute

---

## Improvement Plan

### Phase 1: Form Components (High Priority)

**Target**: ShippingInformation.tsx, AccessValidation.tsx

#### Tasks:
1. **Migrate to react-hook-form + Zod**
   ```tsx
   // Before (manual state)
   const [formData, setFormData] = useState({...});
   
   // After (react-hook-form)
   const form = useForm<ShippingFormValues>({
     resolver: zodResolver(shippingSchema),
     defaultValues: {...}
   });
   ```

2. **Replace raw inputs with Form components**
   ```tsx
   // Before
   <input
     type="text"
     name="fullName"
     value={formData.fullName}
     onChange={handleChange}
     className="w-full px-4 py-3 border-2..."
   />
   
   // After
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

3. **Add Zod validation schemas**
   ```tsx
   // src/app/schemas/shipping.schema.ts
   export const shippingSchema = z.object({
     fullName: z.string().min(2, 'Name must be at least 2 characters'),
     street: z.string().min(5, 'Street address is required'),
     city: z.string().min(2, 'City is required'),
     state: z.string().min(2, 'State is required'),
     zipCode: z.string().regex(/^\d{5}(-\d{4})?$/, 'Invalid ZIP code'),
     country: z.string().length(2, 'Invalid country code'),
     phone: z.string().regex(/^\(\d{3}\) \d{3}-\d{4}$/, 'Invalid phone format'),
   });
   ```

**Benefits**:
- Automatic ARIA linkage (labels, descriptions, errors)
- Consistent validation UX
- Type-safe form data
- Reduced boilerplate

---

### Phase 2: Welcome Page Components (High Priority)

**Target**: Welcome.tsx

#### Tasks:
1. **Replace celebration message cards with Card component**
   ```tsx
   // Before
   <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all...">
     <div className="p-4">
       <ECard template={msg.eCard} />
     </div>
     <div className="px-6 pb-4">
       <p className="text-gray-700...">{msg.message}</p>
     </div>
   </div>
   
   // After
   <Card className="hover:shadow-xl transition-all">
     <CardHeader className="p-4">
       <ECard template={msg.eCard} />
     </CardHeader>
     <CardContent>
       <CardDescription className="italic mb-4">
         "{msg.message}"
       </CardDescription>
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
   </Card>
   ```

2. **Replace custom buttons with Button component**
   ```tsx
   // Before (video play button)
   <button
     onClick={() => setVideoPlaying(true)}
     className="absolute inset-0 flex items-center justify-center..."
     aria-label="Play video"
   >
     <div className="w-20 h-20 rounded-full..." style={{ backgroundColor: primaryColor }}>
       <Play className="w-10 h-10 text-white ml-1" fill="white" />
     </div>
   </button>
   
   // After
   <Button
     size="icon"
     variant="ghost"
     className="absolute inset-0 w-20 h-20 rounded-full mx-auto"
     onClick={() => setVideoPlaying(true)}
     aria-label="Play welcome video"
   >
     <Play className="w-10 h-10" fill="currentColor" />
   </Button>
   
   // Before (continue button)
   <button
     onClick={handleContinue}
     className="inline-flex items-center gap-3 px-8 py-4..."
     style={{ backgroundColor: primaryColor }}
   >
     <span className="text-white">{buttonText}</span>
     <ArrowRight className="w-5 h-5 text-white" />
   </button>
   
   // After
   <Button
     size="lg"
     onClick={handleContinue}
     className="gap-3"
   >
     {buttonText}
     <ArrowRight className="w-5 h-5" />
   </Button>
   ```

3. **Add Skeleton loaders for celebration messages**
   ```tsx
   {loading && (
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
   )}
   ```

4. **Replace celebration card divs with proper button elements**
   ```tsx
   // Before (not keyboard accessible)
   <div
     className="bg-white rounded-2xl... cursor-pointer"
     onClick={() => handleViewMessage(msg.id)}
   >
     {/* content */}
   </div>
   
   // After (keyboard accessible)
   <Card asChild>
     <button
       onClick={() => handleViewMessage(msg.id)}
       className="text-left w-full hover:shadow-xl transition-all"
     >
       {/* content */}
     </button>
   </Card>
   ```

5. **Add Avatar component for sender info**
   ```tsx
   // Before
   <div 
     className="w-10 h-10 rounded-full flex items-center justify-center..."
     style={{ backgroundColor: primaryColor }}
   >
     {msg.senderName.charAt(0)}
   </div>
   
   // After
   <Avatar>
     <AvatarFallback>{msg.senderName.charAt(0)}</AvatarFallback>
   </Avatar>
   ```

6. **Add proper Dialog for viewing full celebration messages**
   ```tsx
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
           recipientName="You"
           size="large"
         />
       </div>
       <DialogFooter>
         <Button variant="outline" onClick={() => setSelectedMessage(null)}>
           Close
         </Button>
       </DialogFooter>
     </DialogContent>
   </Dialog>
   ```

**Benefits**:
- Consistent card styling across celebration messages
- Proper keyboard navigation for message cards
- Better loading states with skeletons
- Accessible avatar components
- Modal view for full message details

---

### Phase 3: Button Components (Medium Priority)

**Target**: All pages with buttons/links

#### Tasks:
1. **Replace custom button classes with Button component**
   ```tsx
   // Before
   <Link
     to="access"
     className="inline-flex items-center gap-2 bg-white text-[#D91C81] px-6 py-3..."
   >
     Get Started
   </Link>
   
   // After
   <Button asChild variant="default" size="lg">
     <Link to="access">
       Get Started
       <Gift className="w-5 h-5" />
     </Link>
   </Button>
   ```

2. **Add loading states**
   ```tsx
   <Button disabled={isSubmitting}>
     {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
     Submit
   </Button>
   ```

3. **Add aria-labels to icon buttons**
   ```tsx
   // Before
   <button className="...">
     <TrashIcon />
   </button>
   
   // After
   <Button size="icon" aria-label="Delete item">
     <TrashIcon />
   </Button>
   ```

**Benefits**:
- Consistent button styling
- Built-in focus management
- Loading state support
- Proper accessibility

---

### Phase 4: Card Components (Medium Priority)

**Target**: GiftSelection.tsx, Confirmation.tsx

#### Tasks:
1. **Replace custom card divs with Card component**
   ```tsx
   // Before
   <div className="bg-white rounded-2xl overflow-hidden shadow-lg...">
     <div className="relative overflow-hidden bg-gray-100...">
       <img src={gift.imageUrl} alt={gift.name} />
     </div>
     <div className="p-6">
       <h2>{gift.name}</h2>
       <p>{gift.description}</p>
     </div>
   </div>
   
   // After
   <Card>
     <CardHeader className="p-0">
       <div className="relative h-64 overflow-hidden">
         <img src={gift.imageUrl} alt={gift.name} className="w-full h-full object-cover" />
       </div>
     </CardHeader>
     <CardContent>
       <CardTitle>{gift.name}</CardTitle>
       <CardDescription>{gift.description}</CardDescription>
     </CardContent>
   </Card>
   ```

2. **Add Badge components for categories**
   ```tsx
   <Badge variant="secondary">{gift.category}</Badge>
   ```

3. **Add Skeleton loaders**
   ```tsx
   {isLoading && (
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
   )}
   ```

**Benefits**:
- Consistent card styling
- Semantic HTML structure
- Better loading states
- Easier maintenance

---

### Phase 5: Dialog & Alert Components (Low Priority)

**Target**: Confirmation.tsx, error states

#### Tasks:
1. **Replace custom success banner with Alert**
   ```tsx
   // Before
   <div className="text-center mb-8 relative">
     <CheckCircle className="w-14 h-14 text-white" />
     <h1>Order Confirmed!</h1>
   </div>
   
   // After
   <Alert variant="success" className="mb-8">
     <CheckCircle className="h-4 w-4" />
     <AlertTitle>Order Confirmed!</AlertTitle>
     <AlertDescription>
       Your gift has been successfully ordered.
     </AlertDescription>
   </Alert>
   ```

2. **Add Dialog for confirmations**
   ```tsx
   <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
     <DialogContent>
       <DialogHeader>
         <DialogTitle>Confirm Order</DialogTitle>
         <DialogDescription>
           Are you sure you want to place this order?
         </DialogDescription>
       </DialogHeader>
       <DialogFooter>
         <Button variant="outline" onClick={() => setShowConfirm(false)}>
           Cancel
         </Button>
         <Button onClick={handleConfirm}>
           Confirm
         </Button>
       </DialogFooter>
     </DialogContent>
   </Dialog>
   ```

**Benefits**:
- Consistent alert styling
- Proper modal accessibility
- Focus trap management
- ESC key handling

---

### Phase 6: Toast Notifications (Low Priority)

**Target**: All pages using toast

#### Tasks:
1. **Replace sonner with shadcn/ui Sonner**
   ```tsx
   // src/app/App.tsx
   import { Toaster } from '@/components/ui/sonner';
   
   function App() {
     return (
       <>
         {/* ... */}
         <Toaster />
       </>
     );
   }
   ```

2. **Update toast calls**
   ```tsx
   // Before
   import { toast } from 'sonner';
   toast.error('Failed to load gifts');
   
   // After (same API, but using shadcn/ui styled component)
   import { toast } from 'sonner';
   toast.error('Failed to load gifts');
   ```

**Benefits**:
- Consistent toast styling
- Better positioning
- Theme integration

---

## Implementation Priority

### 🔴 Critical (Week 1)
1. **ShippingInformation.tsx** - Form migration (accessibility critical)
2. **Welcome.tsx** - Make celebration cards keyboard accessible
3. **Button components** - Add aria-labels to icon buttons (Landing, Welcome)
4. **Input focus states** - Ensure consistent focus indicators

### 🟡 High (Week 2)
1. **Welcome.tsx** - Card components + Skeleton loaders for celebrations
2. **GiftSelection.tsx** - Card components + Skeleton loaders
3. **Form validation** - Add Zod schemas
4. **Loading states** - Add to all async buttons

### 🟢 Medium (Week 3)
1. **Welcome.tsx** - Avatar components for sender info
2. **Welcome.tsx** - Dialog for full message view
3. **Confirmation.tsx** - Alert components
4. **Toast notifications** - Migrate to shadcn/ui Sonner
5. **Badge components** - Add to gift categories

### 🔵 Low (Week 4)
1. **Dialog components** - Add confirmation modals
2. **Progress indicators** - Add to multi-step flow
3. **Documentation** - Update component usage guide

---

## Design System Preservation

### Brand Colors (RecHUB)
- **Primary (Magenta)**: #D91C81 - CTAs, primary actions
- **Secondary (Deep Blue)**: #1B2A5E - Headers, navigation
- **Accent (Cyan)**: #00B4CC - Highlights, links

### Custom Button Variants
```tsx
// src/app/components/ui/button.tsx
const buttonVariants = cva("...", {
  variants: {
    variant: {
      default: "bg-primary text-primary-foreground hover:bg-primary/90",
      // Add custom RecHUB variant
      rechub: "bg-gradient-to-r from-[#D91C81] to-[#B71569] text-white hover:shadow-lg",
    },
  },
});
```

### Custom Input Styling
```tsx
// Already implemented in src/app/components/ui/input.tsx
"focus:border-[#D91C81] focus:ring-2 focus:ring-pink-100"
```

---

## Accessibility Checklist

### ✅ Must-Have
- [ ] All icon buttons have aria-labels (Landing, Welcome video play button)
- [ ] All forms use FormControl for ARIA linkage
- [ ] All interactive elements have visible focus indicators
- [ ] All images have alt text
- [ ] All modals trap focus
- [ ] All toasts use aria-live regions
- [ ] Welcome celebration cards are keyboard navigable
- [ ] Welcome video iframe has proper title attribute

### ✅ Should-Have
- [ ] Keyboard navigation works for all flows
- [ ] Screen reader testing completed
- [ ] Color contrast meets WCAG AA (4.5:1)
- [ ] Touch targets are 44x44px minimum
- [ ] Loading states announced to screen readers
- [ ] Celebration message cards can be opened with Enter/Space keys

---

## Testing Strategy

### Unit Tests
```tsx
// src/app/components/ui/__tests__/button.test.tsx
describe('Button', () => {
  it('renders with correct variant', () => {
    render(<Button variant="rechub">Click me</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-gradient-to-r');
  });
  
  it('has aria-label when icon-only', () => {
    render(<Button size="icon" aria-label="Delete"><TrashIcon /></Button>);
    expect(screen.getByLabelText('Delete')).toBeInTheDocument();
  });
});
```

### Integration Tests
```tsx
// src/app/pages/__tests__/ShippingInformation.test.tsx
describe('ShippingInformation', () => {
  it('validates form fields', async () => {
    render(<ShippingInformation />);
    
    const submitButton = screen.getByRole('button', { name: /continue/i });
    await userEvent.click(submitButton);
    
    expect(await screen.findByText(/name must be at least 2 characters/i)).toBeInTheDocument();
  });
});

// src/app/pages/__tests__/Welcome.test.tsx
describe('Welcome', () => {
  it('renders celebration messages with keyboard navigation', async () => {
    const mockMessages = [
      { id: '1', senderName: 'John Doe', message: 'Congrats!', eCard: ECARD_TEMPLATES[0] }
    ];
    
    render(<Welcome />);
    
    // Wait for messages to load
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });
    
    // Verify card is keyboard accessible
    const messageCard = screen.getByRole('button', { name: /message from john doe/i });
    expect(messageCard).toBeInTheDocument();
    
    // Test keyboard navigation
    messageCard.focus();
    await userEvent.keyboard('{Enter}');
    
    // Verify dialog opens
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });
  
  it('shows skeleton loaders while loading', () => {
    render(<Welcome />);
    
    // Should show skeletons initially
    expect(screen.getAllByTestId('celebration-skeleton')).toHaveLength(6);
  });
  
  it('video play button is accessible', () => {
    render(<Welcome />);
    
    const playButton = screen.getByRole('button', { name: /play welcome video/i });
    expect(playButton).toBeInTheDocument();
    expect(playButton).toHaveAttribute('aria-label');
  });
});
```

### E2E Tests
```tsx
// e2e/gift-selection-flow.spec.ts
test('complete gift selection flow', async ({ page }) => {
  await page.goto('/');
  await page.click('text=Get Started');
  
  // Verify form accessibility
  await expect(page.locator('input[name="fullName"]')).toHaveAttribute('aria-describedby');
  
  // Complete flow
  await page.fill('input[name="fullName"]', 'John Doe');
  await page.click('button:has-text("Submit")');
  
  await expect(page).toHaveURL(/confirmation/);
});
```

---

## Migration Checklist

### Pre-Migration
- [x] Audit all public pages for component usage
- [ ] Document current styling patterns
- [ ] Create Zod schemas for all forms
- [ ] Set up testing infrastructure

### During Migration
- [ ] Migrate one page at a time
- [ ] Run accessibility audit after each page
- [ ] Update tests for new components
- [ ] Document any custom variants

### Post-Migration
- [x] Run full E2E test suite
- [ ] Perform manual accessibility testing
- [ ] Update component documentation
- [ ] Remove unused custom components

---

## Success Metrics

### Code Quality
- **Reduce component code by 30%** (less boilerplate)
- **Increase test coverage to 80%+**
- **Zero accessibility violations** (axe-core)

### User Experience
- **Consistent focus indicators** across all pages
- **Proper form validation** with inline errors
- **Loading states** on all async operations

### Developer Experience
- **Faster component development** (reusable primitives)
- **Better TypeScript support** (typed props)
- **Easier maintenance** (centralized styling)

---

## Next Steps

1. **Review this plan** with the team
2. **Prioritize phases** based on business needs
3. **Create Jira tickets** for each task
4. **Start with Phase 1** (forms - highest impact)
5. **Run accessibility audit** after each phase

---

## Resources

- [shadcn/ui Documentation](https://ui.shadcn.com)
- [Radix UI Primitives](https://www.radix-ui.com)
- [React Hook Form](https://react-hook-form.com)
- [Zod Validation](https://zod.dev)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
