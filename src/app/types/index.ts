/**
 * Central Type Definitions Export
 * 
 * This file serves as the main entry point for all type definitions in the application.
 * Import types from here to ensure consistency across the codebase.
 */

// ===== Re-export API Types =====
export * from './api.types';
export * from './emailTemplates';
export * from './shippingConfig';
export * from './catalog';  // NEW: Catalog types
export * from './siteCustomization';  // NEW: Site customization types
export * from './admin';  // NEW: Admin component types
export * from './component.types';  // NEW: Component prop types
export * from './error.types';  // NEW: Error handling types

// Re-export shared types from /src/types
export type {
  SiteGiftConfiguration,
  PriceLevel,
  GiftExclusions,
  GiftOverride,
  SiteCatalogConfiguration,
  AdminUser,
  Event,
} from '../../types';

// ===== Common Component Types =====

export interface BaseModalProps {
  open: boolean;
  onClose: () => void;
}

export interface TableColumn<T = Record<string, unknown>> {
  key: keyof T | string;
  label: string;
  sortable?: boolean;
  render?: (value: unknown, item: T) => React.ReactNode;
  width?: string;
}

export interface FilterOption {
  label: string;
  value: string;
}

export interface SearchParams {
  query: string;
  filters?: Record<string, string>;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// ===== Common Form Types =====

export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'number' | 'textarea' | 'select' | 'checkbox' | 'date';
  required?: boolean;
  placeholder?: string;
  options?: Array<{ label: string; value: string }>;
  validation?: {
    pattern?: RegExp;
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
    custom?: (value: unknown) => string | null;
  };
}

export interface FormError {
  field: string;
  message: string;
}

// ===== Common State Types =====

export interface LoadingState {
  isLoading: boolean;
  error: string | null;
}

export interface DataState<T> extends LoadingState {
  data: T | null;
}

export interface ListState<T> extends LoadingState {
  items: T[];
  total: number;
}

// ===== Common Action Types =====

export type ActionCallback = () => void;
export type AsyncActionCallback = () => Promise<void>;
export type DataActionCallback<T> = (data: T) => void;
export type AsyncDataActionCallback<T> = (data: T) => Promise<void>;

// ===== Common UI State Types =====

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

export interface ConfirmDialogState {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: ActionCallback;
  variant?: 'default' | 'destructive';
}