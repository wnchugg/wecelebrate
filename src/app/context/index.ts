/**
 * Context Exports Index
 * Central export point for all React contexts and hooks
 */

// Auth Context
export { AuthProvider, useAuth } from './AuthContext';
export type { User, AuthContextType } from './AuthContext';

// Admin Context
export { AdminProvider, useAdmin } from './AdminContext';
export type { AdminUser, AdminContextType } from './AdminContext';

// Site Context
export { SiteProvider, useSite } from './SiteContext';
export type { SiteContextType } from './SiteContext';

// Public Site Context
export { PublicSiteProvider, usePublicSite } from './PublicSiteContext';
export type { PublicSiteContextType } from './PublicSiteContext';

// Cart Context
export { CartProvider, useCart } from './CartContext';
export type { CartItem, CartContextType } from './CartContext';

// Order Context
export { OrderProvider, useOrder } from './OrderContext';
export type { OrderContextType } from './OrderContext';

// Gift Context
export { GiftProvider, useGift } from './GiftContext';
export type { Gift, GiftContextType } from './GiftContext';

// Language Context
export { LanguageProvider, useLanguage } from './LanguageContext';
export type { Language, LanguageContextType } from './LanguageContext';

// Privacy Context
export { PrivacyProvider, usePrivacy } from './PrivacyContext';
export type { PrivacyConsent, PrivacyContextType } from './PrivacyContext';

// Theme Context (if exists)
export { ThemeProvider, useTheme } from './ThemeContext';
export type { Theme, ThemeContextType } from './ThemeContext';
