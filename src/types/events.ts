/**
 * Common Event Handler Types
 * 
 * Reusable event handler type definitions for forms and interactions
 */

import { ChangeEvent, FormEvent, MouseEvent, KeyboardEvent, FocusEvent } from 'react';

// ==================== Form Event Handlers ====================

/**
 * Input change handler (text, number, email, etc.)
 */
export type InputChangeHandler = (e: ChangeEvent<HTMLInputElement>) => void;

/**
 * Textarea change handler
 */
export type TextareaChangeHandler = (e: ChangeEvent<HTMLTextAreaElement>) => void;

/**
 * Select change handler
 */
export type SelectChangeHandler = (e: ChangeEvent<HTMLSelectElement>) => void;

/**
 * Generic change handler for any form element
 */
export type FormChangeHandler = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;

/**
 * Form submit handler
 */
export type FormSubmitHandler = (e: FormEvent<HTMLFormElement>) => void;

// ==================== Click Event Handlers ====================

/**
 * Button click handler
 */
export type ButtonClickHandler = (e: MouseEvent<HTMLButtonElement>) => void;

/**
 * Generic element click handler
 */
export type ClickHandler<T = HTMLElement> = (e: MouseEvent<T>) => void;

/**
 * Link click handler
 */
export type LinkClickHandler = (e: MouseEvent<HTMLAnchorElement>) => void;

/**
 * Div/container click handler
 */
export type DivClickHandler = (e: MouseEvent<HTMLDivElement>) => void;

// ==================== Keyboard Event Handlers ====================

/**
 * Input keyboard handler (for Enter key, etc.)
 */
export type InputKeyHandler = (e: KeyboardEvent<HTMLInputElement>) => void;

/**
 * Generic keyboard handler
 */
export type KeyHandler<T = HTMLElement> = (e: KeyboardEvent<T>) => void;

// ==================== Focus Event Handlers ====================

/**
 * Input focus handler
 */
export type InputFocusHandler = (e: FocusEvent<HTMLInputElement>) => void;

/**
 * Input blur handler
 */
export type InputBlurHandler = (e: FocusEvent<HTMLInputElement>) => void;

/**
 * Generic focus handler
 */
export type FocusHandler<T = HTMLElement> = (e: FocusEvent<T>) => void;

// ==================== Value Change Handlers ====================

/**
 * String value change handler (no event object)
 */
export type StringChangeHandler = (value: string) => void;

/**
 * Number value change handler (no event object)
 */
export type NumberChangeHandler = (value: number) => void;

/**
 * Boolean value change handler (no event object)
 */
export type BooleanChangeHandler = (value: boolean) => void;

/**
 * Generic value change handler
 */
export type ValueChangeHandler<T = any> = (value: T) => void;

// ==================== Async Event Handlers ====================

/**
 * Async form submit handler
 */
export type AsyncFormSubmitHandler = (e: FormEvent<HTMLFormElement>) => Promise<void>;

/**
 * Async button click handler
 */
export type AsyncButtonClickHandler = (e: MouseEvent<HTMLButtonElement>) => Promise<void>;

/**
 * Generic async click handler
 */
export type AsyncClickHandler<T = HTMLElement> = (e: MouseEvent<T>) => Promise<void>;

// ==================== Callback Handlers ====================

/**
 * Void callback (no parameters, no return)
 */
export type VoidCallback = () => void;

/**
 * Async void callback
 */
export type AsyncVoidCallback = () => Promise<void>;

/**
 * Generic callback with parameter
 */
export type Callback<T> = (value: T) => void;

/**
 * Async callback with parameter
 */
export type AsyncCallback<T> = (value: T) => Promise<void>;

// ==================== Helper Type Guards ====================

/**
 * Check if an event is an input change event
 */
export function isInputChangeEvent(e: any): e is ChangeEvent<HTMLInputElement> {
  return e?.target && 'value' in e.target && e.target instanceof HTMLInputElement;
}

/**
 * Check if an event is a select change event
 */
export function isSelectChangeEvent(e: any): e is ChangeEvent<HTMLSelectElement> {
  return e?.target && 'value' in e.target && e.target instanceof HTMLSelectElement;
}

/**
 * Check if an event is a textarea change event
 */
export function isTextareaChangeEvent(e: any): e is ChangeEvent<HTMLTextAreaElement> {
  return e?.target && 'value' in e.target && e.target instanceof HTMLTextAreaElement;
}

// ==================== Type Aliases for Convenience ====================

// Common form element union
export type FormElement = HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;

// Common clickable element union
export type ClickableElement = HTMLButtonElement | HTMLAnchorElement | HTMLDivElement;

// Event handler map for form elements
export interface FormEventHandlers {
  onChange?: FormChangeHandler;
  onSubmit?: FormSubmitHandler;
  onFocus?: FocusHandler;
  onBlur?: FocusHandler;
  onKeyDown?: KeyHandler;
  onKeyUp?: KeyHandler;
}

// Event handler map for clickable elements
export interface ClickableEventHandlers<T = HTMLElement> {
  onClick?: ClickHandler<T>;
  onDoubleClick?: ClickHandler<T>;
  onMouseEnter?: ClickHandler<T>;
  onMouseLeave?: ClickHandler<T>;
}

// ==================== Utility Types for Props ====================

/**
 * Props for components with onChange handler
 */
export interface WithOnChange<T = string> {
  value: T;
  onChange: ValueChangeHandler<T>;
}

/**
 * Props for components with onClick handler
 */
export interface WithOnClick<T = void> {
  onClick: T extends void ? VoidCallback : Callback<T>;
}

/**
 * Props for components with onSubmit handler
 */
export interface WithOnSubmit {
  onSubmit: FormSubmitHandler | AsyncFormSubmitHandler;
}

/**
 * Props for controlled input components
 */
export interface ControlledInputProps extends WithOnChange<string> {
  name?: string;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
}

/**
 * Props for controlled select components
 */
export interface ControlledSelectProps extends WithOnChange<string> {
  options: Array<{ value: string; label: string }>;
  name?: string;
  disabled?: boolean;
  required?: boolean;
}
