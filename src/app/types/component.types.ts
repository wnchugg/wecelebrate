/**
 * Component Props Type Definitions
 * Centralized prop types for all components
 */

import type { ReactNode, HTMLAttributes, ButtonHTMLAttributes, InputHTMLAttributes } from 'react';
import type { Client, Site, Gift, Employee, Event } from './index';

/**
 * Base component props
 */
export interface BaseComponentProps {
  className?: string;
  children?: ReactNode;
}

/**
 * Layout component props
 */
export interface LayoutProps extends BaseComponentProps {
  hideHeader?: boolean;
  hideFooter?: boolean;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

export interface HeaderProps extends BaseComponentProps {
  sticky?: boolean;
  transparent?: boolean;
}

export interface FooterProps extends BaseComponentProps {
  minimal?: boolean;
}

export interface NavigationProps extends BaseComponentProps {
  cartItemCount?: number;
  variant?: 'default' | 'admin';
}

/**
 * Card component props
 */
export interface EventCardProps extends BaseComponentProps {
  event: Event;
  onClick?: (event: Event) => void;
  showActions?: boolean;
}

export interface ProductCardProps extends BaseComponentProps {
  product: Gift;
  onClick?: (product: Gift) => void;
  showAddToCart?: boolean;
  variant?: 'default' | 'compact' | 'detailed';
}

export interface GiftCardProps extends BaseComponentProps {
  gift: Gift;
  onSelect?: (gift: Gift) => void;
  selected?: boolean;
  disabled?: boolean;
}

/**
 * Modal component props
 */
export interface ModalProps extends BaseComponentProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
}

export interface CreateSiteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (site: Site) => void;
  clients: Client[];
}

export interface CreateGiftModalProps {
  giftId?: string;
  onClose: () => void;
  onSuccess?: (gift: Gift) => void;
}

export interface GiftDetailModalProps {
  giftId: string;
  onClose: () => void;
  onEdit?: (giftId: string) => void;
}

export interface EmployeeImportModalProps {
  open: boolean;
  onClose: () => void;
  validationType: string;
  onImport: (employees: Employee[]) => void;
}

export interface SftpConfigModalProps {
  open: boolean;
  onClose: () => void;
  config?: any;
  onSave: (config: any) => void;
}

export interface StoreLocationModalProps {
  open: boolean;
  onClose: () => void;
  store?: any;
  onSave: (store: any) => void;
}

export interface BrandModalProps {
  open: boolean;
  onClose: () => void;
  brand?: any;
  onSave: (brand: any) => void;
}

/**
 * Form component props
 */
export interface FormProps extends BaseComponentProps {
  onSubmit: (data: any) => void;
  validationSchema?: any;
  initialValues?: any;
  disabled?: boolean;
}

export interface FormFieldProps extends BaseComponentProps {
  name: string;
  label?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  helpText?: string;
}

export interface InputFieldProps extends FormFieldProps, Omit<InputHTMLAttributes<HTMLInputElement>, 'name'> {
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search' | 'date';
}

export interface TextAreaFieldProps extends FormFieldProps {
  rows?: number;
  maxLength?: number;
}

export interface SelectFieldProps extends FormFieldProps {
  options: Array<{ value: string; label: string; disabled?: boolean }>;
  placeholder?: string;
}

export interface CheckboxFieldProps extends FormFieldProps {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
}

export interface RadioGroupFieldProps extends FormFieldProps {
  options: Array<{ value: string; label: string; disabled?: boolean }>;
  value?: string;
  onChange?: (value: string) => void;
}

/**
 * Table component props
 */
export interface TableProps extends BaseComponentProps {
  data: any[];
  columns: TableColumn[];
  loading?: boolean;
  emptyMessage?: string;
  pagination?: PaginationProps;
  sortable?: boolean;
  selectable?: boolean;
  onRowClick?: (row: any) => void;
  onSelectionChange?: (selectedRows: any[]) => void;
}

export interface TableColumn {
  key: string;
  header: string;
  accessor?: string | ((row: any) => any);
  render?: (value: any, row: any) => ReactNode;
  sortable?: boolean;
  width?: string | number;
  align?: 'left' | 'center' | 'right';
}

export interface PaginationProps {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  pageSizeOptions?: number[];
}

/**
 * Data display component props
 */
export interface DataTableProps<T = any> {
  data: T[];
  columns: TableColumn[];
  loading?: boolean;
  error?: Error | null;
  pagination?: PaginationProps;
  filters?: FilterConfig[];
  sorting?: SortConfig;
  onSort?: (config: SortConfig) => void;
  onFilter?: (filters: Record<string, any>) => void;
}

export interface FilterConfig {
  key: string;
  label: string;
  type: 'text' | 'select' | 'date' | 'range';
  options?: Array<{ value: string; label: string }>;
}

export interface SortConfig {
  key: string;
  direction: 'asc' | 'desc';
}

/**
 * Loading component props
 */
export interface LoadingSpinnerProps extends BaseComponentProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
}

export interface SkeletonProps extends BaseComponentProps {
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
  animation?: 'pulse' | 'wave' | false;
}

/**
 * Alert/Toast component props
 */
export interface AlertProps extends BaseComponentProps {
  variant?: 'info' | 'success' | 'warning' | 'error';
  title?: string;
  message: string;
  onClose?: () => void;
  dismissible?: boolean;
}

export interface ToastProps extends AlertProps {
  duration?: number;
  position?: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
}

/**
 * Badge component props
 */
export interface BadgeProps extends BaseComponentProps {
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  size?: 'sm' | 'md' | 'lg';
  dot?: boolean;
}

/**
 * Button component props
 */
export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, BaseComponentProps {
  variant?: 'default' | 'primary' | 'secondary' | 'outline' | 'ghost' | 'link' | 'destructive';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  loading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
}

/**
 * Protected route component props
 */
export interface ProtectedRouteProps {
  children: ReactNode;
  redirectTo?: string;
  requiredRole?: string;
}

export interface AdminProtectedRouteProps {
  children: ReactNode;
  redirectTo?: string;
}

/**
 * Language selector component props
 */
export interface LanguageSelectorProps extends BaseComponentProps {
  variant?: 'light' | 'dark';
  showLabel?: boolean;
}

/**
 * Currency display component props
 */
export interface CurrencyDisplayProps extends BaseComponentProps {
  amount: number;
  currency?: string;
  showSymbol?: boolean;
  decimals?: number;
}

/**
 * Error boundary component props
 */
export interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode | ((error: Error, resetError: () => void) => ReactNode);
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

/**
 * Tabs component props
 */
export interface TabsProps extends BaseComponentProps {
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
}

export interface TabsListProps extends BaseComponentProps {
  variant?: 'default' | 'pills' | 'underline';
}

export interface TabsTriggerProps extends BaseComponentProps {
  value: string;
  disabled?: boolean;
}

export interface TabsContentProps extends BaseComponentProps {
  value: string;
}

/**
 * Dropdown menu component props
 */
export interface DropdownMenuProps extends BaseComponentProps {
  trigger: ReactNode;
  align?: 'start' | 'center' | 'end';
  side?: 'top' | 'right' | 'bottom' | 'left';
}

export interface DropdownMenuItemProps extends BaseComponentProps {
  disabled?: boolean;
  onSelect?: () => void;
}

/**
 * Dialog component props
 */
export interface DialogProps extends BaseComponentProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export interface DialogContentProps extends BaseComponentProps {
  onClose?: () => void;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

export interface DialogHeaderProps extends BaseComponentProps {}

export interface DialogTitleProps extends BaseComponentProps {}

export interface DialogDescriptionProps extends BaseComponentProps {}

export interface DialogFooterProps extends BaseComponentProps {}

/**
 * Avatar component props
 */
export interface AvatarProps extends BaseComponentProps {
  src?: string;
  alt?: string;
  fallback?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

/**
 * Progress component props
 */
export interface ProgressProps extends BaseComponentProps {
  value: number;
  max?: number;
  variant?: 'default' | 'success' | 'warning' | 'error';
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Separator component props
 */
export interface SeparatorProps extends BaseComponentProps {
  orientation?: 'horizontal' | 'vertical';
}

/**
 * Switch component props
 */
export interface SwitchProps extends BaseComponentProps {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
}

/**
 * Tooltip component props
 */
export interface TooltipProps extends BaseComponentProps {
  content: ReactNode;
  side?: 'top' | 'right' | 'bottom' | 'left';
  align?: 'start' | 'center' | 'end';
  delayDuration?: number;
}

/**
 * Popover component props
 */
export interface PopoverProps extends BaseComponentProps {
  trigger: ReactNode;
  align?: 'start' | 'center' | 'end';
  side?: 'top' | 'right' | 'bottom' | 'left';
}

/**
 * Select component props
 */
export interface SelectProps extends BaseComponentProps {
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export interface SelectTriggerProps extends BaseComponentProps {}

export interface SelectContentProps extends BaseComponentProps {}

export interface SelectItemProps extends BaseComponentProps {
  value: string;
}

/**
 * Card component props
 */
export interface CardProps extends BaseComponentProps, HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'outlined' | 'elevated';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export interface CardHeaderProps extends BaseComponentProps {}

export interface CardTitleProps extends BaseComponentProps {}

export interface CardDescriptionProps extends BaseComponentProps {}

export interface CardContentProps extends BaseComponentProps {}

export interface CardFooterProps extends BaseComponentProps {}

/**
 * Checkbox component props
 */
export interface CheckboxProps extends BaseComponentProps {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  id?: string;
}

/**
 * Label component props
 */
export interface LabelProps extends BaseComponentProps {
  htmlFor?: string;
  required?: boolean;
}

/**
 * Input component props
 */
export interface InputProps extends InputHTMLAttributes<HTMLInputElement>, BaseComponentProps {
  error?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

/**
 * TextArea component props
 */
export interface TextAreaProps extends BaseComponentProps {
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  disabled?: boolean;
  rows?: number;
  error?: boolean;
}
