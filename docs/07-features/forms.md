# Form Components Guide

## Overview

This guide covers form implementation patterns using react-hook-form, Zod validation, and shadcn/ui Form components.

## Basic Form Pattern

```tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

// 1. Define schema in src/app/schemas/
const formSchema = z.object({
  email: z.string().email("Invalid email address"),
  name: z.string().min(2, "Name must be at least 2 characters"),
});

type FormValues = z.infer<typeof formSchema>;

export function MyForm() {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
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
                <Input type="email" {...field} />
              </FormControl>
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

## Loading States

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

## Dynamic Schema Selection

```tsx
// For forms with multiple modes (e.g., company vs. individual)
const form = useForm({
  resolver: zodResolver(
    shippingMode === 'company' ? companyShippingSchema : shippingSchema
  ),
});
```

## Validation Schema Location

Store all Zod schemas in `src/app/schemas/`:
- `shipping.schema.ts` - Shipping form validation
- `access.schema.ts` - Access validation forms
- `[feature].schema.ts` - Feature-specific schemas

## Testing

Property-based tests for schemas:
```tsx
import { test } from '@fast-check/vitest';
import * as fc from 'fast-check';

test.prop([fc.emailAddress()], { numRuns: 100 })(
  'should parse valid emails',
  (email) => {
    const result = emailSchema.safeParse({ email });
    expect(result.success).toBe(true);
  }
);
```

## Best Practices

1. Always use `FormControl` wrapper for proper ARIA linkage
2. Use `FormMessage` for error display (automatic ARIA attributes)
3. Disable submit button during `isSubmitting`
4. Store schemas in `src/app/schemas/`
5. Use TypeScript types derived from Zod: `z.infer<typeof schema>`
6. Add loading states with Loader2 icon
7. Test with property-based tests (100 runs minimum)
