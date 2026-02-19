/**
 * Custom Hooks Index
 * Central export point for all custom React hooks
 */

// API Hooks
export * from './useApi';

// Data Hooks
export { useLocalStorage } from './useLocalStorage';
export { useSessionStorage } from './useSessionStorage';
export { useDebounce } from './useDebounce';
export { useThrottle } from './useThrottle';

// UI Hooks
export { useClickOutside } from './useClickOutside';
export { useKeyPress } from './useKeyPress';
export { useMediaQuery } from './useMediaQuery';
export { useWindowSize } from './useWindowSize';
export { useScrollPosition } from './useScrollPosition';
export { useIntersectionObserver } from './useIntersectionObserver';

// Form Hooks
export { useForm } from './useForm';
export { useFormField } from './useFormField';
export { useFormValidation } from './useFormValidation';

// State Hooks
export { useToggle } from './useToggle';
export { usePrevious } from './usePrevious';
export { useAsync } from './useAsync';
export { useAsyncEffect } from './useAsyncEffect';

// Utility Hooks
export { useTimeout } from './useTimeout';
export { useInterval } from './useInterval';
export { useUpdateEffect } from './useUpdateEffect';
export { useMounted } from './useMounted';
export { useCopyToClipboard } from './useCopyToClipboard';

// Internationalization Hooks
export { useCurrencyFormat } from './useCurrencyFormat';
export { useDateFormat } from './useDateFormat';

// Context Hooks (re-export for convenience)
export { useAuth } from '../context/AuthContext';
export { useAdmin } from '../context/AdminContext';
export { useCart } from '../context/CartContext';
export { useSite } from '../context/SiteContext';
export { usePublicSite } from '../context/PublicSiteContext';
export { useLanguage } from '../context/LanguageContext';
export { usePrivacy } from '../context/PrivacyContext';
export { useOrder } from '../context/OrderContext';
export { useGift } from '../context/GiftContext';
