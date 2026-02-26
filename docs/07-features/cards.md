# Card Components Guide

## Overview

This guide covers Card component usage patterns with shadcn/ui for content containers, gift displays, and order summaries.

## Basic Card Pattern

```tsx
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Card description text</CardDescription>
  </CardHeader>
  <CardContent>
    <p>Card content goes here</p>
  </CardContent>
</Card>
```

## Gift Card Pattern

```tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

<Card className="hover:shadow-xl transition-shadow cursor-pointer">
  <CardHeader className="p-0">
    <img 
      src={gift.image} 
      alt={gift.name}
      className="w-full h-64 object-cover rounded-t-lg"
    />
    <Badge className="absolute top-2 right-2" variant="secondary">
      {gift.category}
    </Badge>
  </CardHeader>
  <CardContent className="p-4">
    <CardTitle>{gift.name}</CardTitle>
    <p className="text-sm text-gray-600">{gift.description}</p>
  </CardContent>
</Card>
```

## Clickable Card with Button

Use `asChild` to merge Card with button element:

```tsx
<Card asChild>
  <button
    onClick={() => handleSelect(gift)}
    className="text-left hover:shadow-xl transition-shadow"
  >
    <CardHeader>
      <CardTitle>{gift.name}</CardTitle>
    </CardHeader>
    <CardContent>
      <p>{gift.description}</p>
    </CardContent>
  </button>
</Card>
```

## Skeleton Loading State

```tsx
import { Skeleton } from "@/components/ui/skeleton";

<Card>
  <CardHeader className="p-0">
    <Skeleton className="h-64 w-full rounded-t-lg" />
  </CardHeader>
  <CardContent className="p-4 space-y-2">
    <Skeleton className="h-6 w-3/4" />
    <Skeleton className="h-4 w-full" />
    <Skeleton className="h-4 w-5/6" />
  </CardContent>
</Card>
```

## Order Summary Card

```tsx
<Card>
  <CardHeader>
    <CardTitle>Order Summary</CardTitle>
  </CardHeader>
  <CardContent className="space-y-4">
    <div className="flex justify-between">
      <span>Gift:</span>
      <span className="font-semibold">{selectedGift.name}</span>
    </div>
    <div className="flex justify-between">
      <span>Quantity:</span>
      <span className="font-semibold">{quantity}</span>
    </div>
    <Separator />
    <div className="flex justify-between text-lg font-bold">
      <span>Total:</span>
      <span>${total}</span>
    </div>
  </CardContent>
</Card>
```

## Keyboard Navigation

Make cards keyboard accessible:

```tsx
<Card
  tabIndex={0}
  role="button"
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleSelect(gift);
    }
  }}
  className="focus:ring-2 focus:ring-[#D91C81] focus:outline-none"
>
  {/* Card content */}
</Card>
```

## Best Practices

1. Use `CardHeader` with `p-0` for full-width images
2. Add hover effects: `hover:shadow-xl transition-shadow`
3. Position badges absolutely in top-right corner
4. Use Skeleton components that match Card structure
5. Make clickable cards keyboard accessible (Enter/Space)
6. Add focus indicators for keyboard navigation
7. Use `asChild` pattern for semantic button cards
