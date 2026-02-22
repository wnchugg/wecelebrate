import * as React from "react";

import { cn } from "./utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type = "text", ...props }, ref) => {
    return (
      <input
        ref={ref}
        type={type}
        data-slot="input"
        className={cn(
          "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground flex h-9 w-full min-w-0 rounded-md border border-gray-300 bg-white px-3 py-1 text-base transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          "focus:border-[#D91C81] focus:ring-2 focus:ring-pink-100",
          "hover:border-gray-400",
          "aria-invalid:border-red-500 aria-invalid:ring-red-100",
          className,
        )}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";

export { Input };