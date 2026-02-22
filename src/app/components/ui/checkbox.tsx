"use client";

import * as React from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { CheckIcon } from "lucide-react";

import { cn } from "./utils";

const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(({ className, ...props }, ref) => {
  return (
    <CheckboxPrimitive.Root
      ref={ref}
      data-slot="checkbox"
      className={cn(
        "peer size-4 shrink-0 rounded-[4px] border-2 border-gray-300 bg-white shadow-sm transition-colors outline-none hover:border-gray-400 focus-visible:border-[#D91C81] focus-visible:ring-2 focus-visible:ring-pink-100 disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gray-50 data-[state=checked]:bg-[#D91C81] data-[state=checked]:border-[#D91C81] data-[state=checked]:text-white aria-invalid:border-red-500",
        className,
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="flex items-center justify-center text-current transition-none"
      >
        <CheckIcon className="size-3.5" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
});

Checkbox.displayName = "Checkbox";

export { Checkbox };