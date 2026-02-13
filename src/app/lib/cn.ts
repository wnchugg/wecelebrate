/**
 * CSS Utility Functions
 * Tailwind CSS class name utilities
 */

import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge Tailwind CSS classes with proper precedence
 * This is the standard `cn` utility used throughout shadcn/ui components
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Conditionally apply classes
 */
export function conditionalClass(
  condition: boolean,
  trueClass: string,
  falseClass?: string
): string {
  return condition ? trueClass : (falseClass || '');
}

/**
 * Build responsive classes
 */
export function responsive(base: string, breakpoints: Partial<{
  sm: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
}>): string {
  const classes = [base];
  
  if (breakpoints.sm) classes.push(`sm:${breakpoints.sm}`);
  if (breakpoints.md) classes.push(`md:${breakpoints.md}`);
  if (breakpoints.lg) classes.push(`lg:${breakpoints.lg}`);
  if (breakpoints.xl) classes.push(`xl:${breakpoints.xl}`);
  if (breakpoints['2xl']) classes.push(`2xl:${breakpoints['2xl']}`);
  
  return classes.join(' ');
}

/**
 * Apply variant classes
 */
export function variant<T extends string>(
  base: string,
  variant: T,
  variants: Record<T, string>
): string {
  return cn(base, variants[variant]);
}

/**
 * Apply size classes
 */
export function size<T extends string>(
  base: string,
  size: T,
  sizes: Record<T, string>
): string {
  return cn(base, sizes[size]);
}

/**
 * Focus visible classes
 */
export const focusRing = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary';

/**
 * Common transition classes
 */
export const transition = 'transition-colors duration-200';

/**
 * Disabled state classes
 */
export const disabled = 'disabled:opacity-50 disabled:pointer-events-none';

/**
 * Screen reader only
 */
export const srOnly = 'sr-only';

/**
 * Truncate text
 */
export const truncate = 'truncate';

/**
 * Common button base classes
 */
export const buttonBase = cn(
  'inline-flex items-center justify-center rounded-md text-sm font-medium',
  transition,
  focusRing,
  disabled
);

/**
 * Common input base classes
 */
export const inputBase = cn(
  'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background',
  'file:border-0 file:bg-transparent file:text-sm file:font-medium',
  'placeholder:text-muted-foreground',
  focusRing,
  disabled
);

/**
 * Common card base classes
 */
export const cardBase = 'rounded-lg border bg-card text-card-foreground shadow-sm';

/**
 * Common badge base classes
 */
export const badgeBase = 'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors';

/**
 * Gradient text
 */
export function gradientText(from: string, to: string): string {
  return `bg-gradient-to-r ${from} ${to} bg-clip-text text-transparent`;
}

/**
 * Grid layout helper
 */
export function grid(cols: number | Record<string, number>): string {
  if (typeof cols === 'number') {
    return `grid grid-cols-${cols}`;
  }
  
  const classes = ['grid'];
  if (cols.default) classes.push(`grid-cols-${cols.default}`);
  if (cols.sm) classes.push(`sm:grid-cols-${cols.sm}`);
  if (cols.md) classes.push(`md:grid-cols-${cols.md}`);
  if (cols.lg) classes.push(`lg:grid-cols-${cols.lg}`);
  if (cols.xl) classes.push(`xl:grid-cols-${cols.xl}`);
  
  return classes.join(' ');
}

/**
 * Flex layout helper
 */
export function flex(options?: {
  direction?: 'row' | 'col';
  align?: 'start' | 'center' | 'end' | 'stretch';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around';
  wrap?: boolean;
  gap?: number;
}): string {
  const classes = ['flex'];
  
  if (options?.direction === 'col') classes.push('flex-col');
  if (options?.align) classes.push(`items-${options.align}`);
  if (options?.justify) classes.push(`justify-${options.justify}`);
  if (options?.wrap) classes.push('flex-wrap');
  if (options?.gap) classes.push(`gap-${options.gap}`);
  
  return classes.join(' ');
}

/**
 * Spacing helper
 */
export function spacing(value: number): string {
  return `p-${value}`;
}

/**
 * Container helper
 */
export const container = 'container mx-auto px-4 sm:px-6 lg:px-8';

/**
 * Aspect ratio helper
 */
export function aspectRatio(ratio: 'square' | 'video' | 'wide' | string): string {
  const ratios: Record<string, string> = {
    square: 'aspect-square',
    video: 'aspect-video',
    wide: 'aspect-[21/9]',
  };
  
  return ratios[ratio] || ratio;
}
