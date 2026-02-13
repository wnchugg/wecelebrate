/**
 * Library Exports Index
 * Central export point for all library utilities
 */

// API Client
export { apiClient, ApiError } from './apiClient';
export { api, apiClientExtended } from './apiClientExtended';

// CSS Utilities
export { cn, conditionalClass, responsive, variant, size } from './cn';
export {
  focusRing,
  transition,
  disabled,
  srOnly,
  truncate,
  buttonBase,
  inputBase,
  cardBase,
  badgeBase,
  container,
  gradientText,
  grid,
  flex,
  spacing,
  aspectRatio,
} from './cn';

// Event Handlers
export type {
  EventHandler,
  AsyncEventHandler,
  InputChangeHandler,
  TextAreaChangeHandler,
  SelectChangeHandler,
  FormSubmitHandler,
  AsyncFormSubmitHandler,
  ClickHandler,
  AsyncClickHandler,
  ButtonClickHandler,
  KeyDownHandler,
  KeyUpHandler,
  FocusHandler,
  BlurHandler,
  DragHandler,
  DropHandler,
  ValueChangeHandler,
  CheckedChangeHandler,
  ToggleHandler,
  FileChangeHandler,
  PageChangeHandler,
  SortChangeHandler,
  FilterChangeHandler,
  SearchHandler,
  OpenChangeHandler,
  CloseHandler,
  TabChangeHandler,
  DateChangeHandler,
} from './eventHandlers';

export {
  createValueChangeHandler,
  createCheckedChangeHandler,
  stopEvent,
  createFormHandler,
  createButtonHandler,
  createKeyHandler,
  onEnter,
  onEscape,
  debounceHandler,
  throttleHandler,
  asyncHandler,
  composeHandlers,
} from './eventHandlers';

// Re-export commonly used types
export type {
  InputElement,
  TextAreaElement,
  SelectElement,
  ButtonElement,
  FormElement,
  DivElement,
  AnchorElement,
} from './eventHandlers';
