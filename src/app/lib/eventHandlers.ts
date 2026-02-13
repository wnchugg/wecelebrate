/**
 * Event Handler Type Helpers
 * Type-safe event handler utilities
 */

import type { 
  ChangeEvent, 
  FormEvent, 
  MouseEvent, 
  KeyboardEvent,
  FocusEvent,
  DragEvent,
  TouchEvent,
  ClipboardEvent,
  CompositionEvent,
  PointerEvent,
  TransitionEvent,
  AnimationEvent,
  WheelEvent,
} from 'react';

/**
 * Generic event handler types
 */
export type EventHandler<T = Element, E = Event> = (event: E & { currentTarget: T }) => void;
export type AsyncEventHandler<T = Element, E = Event> = (event: E & { currentTarget: T }) => Promise<void>;

/**
 * Common element types
 */
export type InputElement = HTMLInputElement;
export type TextAreaElement = HTMLTextAreaElement;
export type SelectElement = HTMLSelectElement;
export type ButtonElement = HTMLButtonElement;
export type FormElement = HTMLFormElement;
export type DivElement = HTMLDivElement;
export type AnchorElement = HTMLAnchorElement;

/**
 * Input change handlers
 */
export type InputChangeHandler = (event: ChangeEvent<InputElement>) => void;
export type TextAreaChangeHandler = (event: ChangeEvent<TextAreaElement>) => void;
export type SelectChangeHandler = (event: ChangeEvent<SelectElement>) => void;

/**
 * Form handlers
 */
export type FormSubmitHandler = (event: FormEvent<FormElement>) => void;
export type AsyncFormSubmitHandler = (event: FormEvent<FormElement>) => Promise<void>;

/**
 * Click handlers
 */
export type ClickHandler<T = HTMLElement> = (event: MouseEvent<T>) => void;
export type AsyncClickHandler<T = HTMLElement> = (event: MouseEvent<T>) => Promise<void>;
export type ButtonClickHandler = ClickHandler<ButtonElement>;
export type DivClickHandler = ClickHandler<DivElement>;
export type AnchorClickHandler = ClickHandler<AnchorElement>;

/**
 * Keyboard handlers
 */
export type KeyDownHandler<T = HTMLElement> = (event: KeyboardEvent<T>) => void;
export type KeyUpHandler<T = HTMLElement> = (event: KeyboardEvent<T>) => void;
export type KeyPressHandler<T = HTMLElement> = (event: KeyboardEvent<T>) => void;

/**
 * Focus handlers
 */
export type FocusHandler<T = HTMLElement> = (event: FocusEvent<T>) => void;
export type BlurHandler<T = HTMLElement> = (event: FocusEvent<T>) => void;

/**
 * Drag handlers
 */
export type DragHandler<T = HTMLElement> = (event: DragEvent<T>) => void;
export type DragStartHandler<T = HTMLElement> = (event: DragEvent<T>) => void;
export type DragEndHandler<T = HTMLElement> = (event: DragEvent<T>) => void;
export type DragOverHandler<T = HTMLElement> = (event: DragEvent<T>) => void;
export type DropHandler<T = HTMLElement> = (event: DragEvent<T>) => void;

/**
 * Touch handlers
 */
export type TouchStartHandler<T = HTMLElement> = (event: TouchEvent<T>) => void;
export type TouchMoveHandler<T = HTMLElement> = (event: TouchEvent<T>) => void;
export type TouchEndHandler<T = HTMLElement> = (event: TouchEvent<T>) => void;

/**
 * Other handlers
 */
export type ClipboardHandler<T = HTMLElement> = (event: ClipboardEvent<T>) => void;
export type CompositionHandler<T = HTMLElement> = (event: CompositionEvent<T>) => void;
export type PointerHandler<T = HTMLElement> = (event: PointerEvent<T>) => void;
export type TransitionHandler<T = HTMLElement> = (event: TransitionEvent<T>) => void;
export type AnimationHandler<T = HTMLElement> = (event: AnimationEvent<T>) => void;
export type WheelHandler<T = HTMLElement> = (event: WheelEvent<T>) => void;

/**
 * Value change handlers (without event)
 */
export type ValueChangeHandler<T = string> = (value: T) => void;
export type AsyncValueChangeHandler<T = string> = (value: T) => Promise<void>;

/**
 * Checkbox/Toggle handlers
 */
export type CheckedChangeHandler = (checked: boolean) => void;
export type ToggleHandler = () => void;

/**
 * Select/Option handlers
 */
export type OptionSelectHandler<T = string> = (value: T) => void;
export type MultiSelectHandler<T = string> = (values: T[]) => void;

/**
 * File upload handlers
 */
export type FileChangeHandler = (files: FileList | null) => void;
export type FileUploadHandler = (file: File) => void | Promise<void>;

/**
 * Pagination handlers
 */
export type PageChangeHandler = (page: number) => void;
export type PageSizeChangeHandler = (pageSize: number) => void;

/**
 * Sort handlers
 */
export type SortChangeHandler = (sortBy: string, order: 'asc' | 'desc') => void;

/**
 * Filter handlers
 */
export type FilterChangeHandler = (filters: Record<string, any>) => void;

/**
 * Search handlers
 */
export type SearchHandler = (query: string) => void;
export type AsyncSearchHandler = (query: string) => Promise<void>;

/**
 * Modal/Dialog handlers
 */
export type OpenChangeHandler = (open: boolean) => void;
export type CloseHandler = () => void;

/**
 * Tab handlers
 */
export type TabChangeHandler = (value: string) => void;

/**
 * Slider handlers
 */
export type SliderChangeHandler = (value: number | number[]) => void;

/**
 * Date handlers
 */
export type DateChangeHandler = (date: Date | null) => void;
export type DateRangeChangeHandler = (start: Date | null, end: Date | null) => void;

/**
 * Color handlers
 */
export type ColorChangeHandler = (color: string) => void;

/**
 * Helper: Create a change handler that extracts value
 */
export function createValueChangeHandler(
  handler: ValueChangeHandler
): InputChangeHandler {
  return (event) => handler(event.target.value);
}

/**
 * Helper: Create a checked change handler
 */
export function createCheckedChangeHandler(
  handler: CheckedChangeHandler
): InputChangeHandler {
  return (event) => handler(event.target.checked);
}

/**
 * Helper: Prevent default and stop propagation
 */
export function stopEvent<E extends { preventDefault: () => void; stopPropagation: () => void }>(
  event: E
): void {
  event.preventDefault();
  event.stopPropagation();
}

/**
 * Helper: Create a form submit handler that prevents default
 */
export function createFormHandler(
  handler: (data: FormData) => void | Promise<void>
): FormSubmitHandler {
  return (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    void handler(formData);
  };
}

/**
 * Helper: Create a button click handler that prevents default
 */
export function createButtonHandler(
  handler: () => void | Promise<void>
): ButtonClickHandler {
  return (event) => {
    event.preventDefault();
    void handler();
  };
}

/**
 * Helper: Create a keyboard handler for specific keys
 */
export function createKeyHandler(
  key: string | string[],
  handler: () => void
): KeyDownHandler {
  const keys = Array.isArray(key) ? key : [key];
  return (event) => {
    if (keys.includes(event.key)) {
      event.preventDefault();
      handler();
    }
  };
}

/**
 * Helper: Create an Enter key handler
 */
export function onEnter(handler: () => void): KeyDownHandler {
  return createKeyHandler('Enter', handler);
}

/**
 * Helper: Create an Escape key handler
 */
export function onEscape(handler: () => void): KeyDownHandler {
  return createKeyHandler('Escape', handler);
}

/**
 * Helper: Debounce a handler
 */
export function debounceHandler<T extends (...args: any[]) => any>(
  handler: T,
  delay: number
): T {
  let timeoutId: NodeJS.Timeout;
  
  return ((...args: any[]) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => handler(...args), delay);
  }) as T;
}

/**
 * Helper: Throttle a handler
 */
export function throttleHandler<T extends (...args: any[]) => any>(
  handler: T,
  delay: number
): T {
  let lastCall = 0;
  
  return ((...args: any[]) => {
    const now = Date.now();
    if (now - lastCall >= delay) {
      lastCall = now;
      handler(...args);
    }
  }) as T;
}

/**
 * Helper: Async handler wrapper with error handling
 */
export function asyncHandler<T extends (...args: any[]) => Promise<any>>(
  handler: T,
  onError?: (error: Error) => void
): T {
  return (async (...args: any[]) => {
    try {
      return await handler(...args);
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      if (onError) {
        onError(err);
      } else {
        console.error('Async handler error:', err);
      }
    }
  }) as T;
}

/**
 * Helper: Compose multiple handlers
 */
export function composeHandlers<T extends (...args: any[]) => any>(
  ...handlers: Array<T | undefined>
): T {
  return ((...args: any[]) => {
    handlers.forEach(handler => {
      if (handler) {
        handler(...args);
      }
    });
  }) as T;
}
