import { createContext, useContext, useState, useEffect, useCallback, ReactNode, useRef } from 'react';
import { logSecurityEvent, startSessionTimer, clearSessionTimer } from '../utils/security';
import { authApi, setAccessToken, getAccessToken } from '../utils/api';
import { clearAccessToken } from '../lib/apiClient';
import { preloadAdminRoutes } from '../utils/routePreloader';
import { isPublicRoute } from '../utils/routeUtils';
import { logger } from '../utils/logger';

export interface AdminUser {
  id: string;
  username: string;
  email: string;
  role: 'super_admin' | 'admin' | 'manager' | 'client_admin';
}

export interface AdminContextType {
  adminUser: AdminUser | null;
  isAdminAuthenticated: boolean;
  adminLogin: (identifier: string, password: string) => Promise<boolean>;
  adminLogout: () => Promise<void>;
  isLoading: boolean;
  accessToken: string | null;
}

export const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function AdminProvider({ children }: { children: ReactNode }) {
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const justLoggedInRef = useRef(false);
  
  // CRITICAL: Clear any tokens IMMEDIATELY if we're on a public route
  // This must happen BEFORE any API calls or redirects can occur
  const currentPath = window.location.pathname;
  if (isPublicRoute(currentPath)) {
    const token = getAccessToken();
    if (token) {
      logger.info('[AdminProvider] Clearing token on public route', { path: currentPath });
      clearAccessToken();
    }
  }

  logger.debug('[AdminProvider] Render', { 
    username: adminUser?.username || 'null', 
    justLoggedIn: justLoggedInRef.current, 
    isLoading 
  });

  // Use a stable reference for adminLogout that doesn't change
  const adminLogout = useCallback(async () => {
    logger.info('[AdminProvider] adminLogout called');
    // Get fresh adminUser from state at time of logout
    setAdminUser((currentUser) => {
      if (currentUser) {
        logSecurityEvent({
          action: 'admin_logout',
          status: 'success',
          details: { username: currentUser.username, userId: currentUser.id }
        });
      }
      return null;
    });

    try {
      await authApi.logout();
    } catch (error) {
      logger.error('Logout error', { error });
    }

    clearSessionTimer();
    justLoggedInRef.current = false;
  }, []); // No dependencies - uses functional setState to get fresh value

  // Check for existing session on mount
  useEffect(() => {
    async function checkSession() {
      const currentPath = window.location.pathname;
      
      // CRITICAL: Skip session check on public routes
      if (isPublicRoute(currentPath)) {
        logger.info('[Session Check] Skipping - on public route', { path: currentPath });
        setIsLoading(false);
        return;
      }
      
      logger.debug('[Session Check] Current path', { path: currentPath, isPublic: isPublicRoute(currentPath) });
      
      const token = getAccessToken();
      
      // Check if there's an old/stale token when on a public route
      if (token && isPublicRoute(currentPath)) {
        logger.info('[Session Check] Token exists on public route, clearing it', { path: currentPath });
        clearAccessToken();
        setIsLoading(false);
        return;
      }
      
      try {
        logger.debug('[Session Check] Starting session check', { hasToken: !!token });
        
        if (token) {
          const { user } = await authApi.getSession() as { user: AdminUser | null };
          logger.debug('[Session Check] Session check result', { hasUser: !!user });
          
          if (user) {
            setAdminUser(user);
            // Restart session timer for existing session
            startSessionTimer(adminLogout);
            // Preload admin routes for restored session
            preloadAdminRoutes();
          } else {
            // Invalid token, clear it
            logger.info('[Session Check] Session returned no user, clearing token');
            setAccessToken(null);
          }
        }
      } catch (sessionError: unknown) {
        // Session check failed - this is expected if backend is not deployed yet
        // or if there's no active session. Fail silently.
        // Only log if we had a token (meaning this is unexpected)
        if (getAccessToken()) {
          logger.error('[Session Check] Session check failed', { error: sessionError });
          
          // Only log if we had a token but session check failed (helps with debugging expired sessions)
          logger.info('[Session Check] Session expired or invalid, clearing token');
          setAccessToken(null);
          setAdminUser(null);
        } else {
          // No token, so failure is expected - don't log
          logger.debug('[Session Check] No token found, skipping session check');
        }
      } finally {
        setIsLoading(false);
      }
    };

    // Debounce session check to prevent rapid calls during hot reload
    const timeoutId = setTimeout(() => {
      checkSession();
    }, 100);

    // Track if we're in the middle of a page load to ignore spurious storage events
    let isInitialLoad = true;
    setTimeout(() => {
      isInitialLoad = false;
    }, 2000); // Give 2 seconds for page to fully load

    // Set up a listener for token changes to sync adminUser state
    const handleStorageChange = (e: StorageEvent) => {
      // Ignore storage events during initial page load (these are false positives during refresh)
      if (isInitialLoad) {
        logger.info('[Storage Event] Ignoring storage event during initial page load');
        return;
      }
      
      // Only handle if the token key changed AND the new value is null (token removed)
      if (e.key === 'jala_access_token' && e.newValue === null) {
        // Token was removed in another tab, clear admin user
        logger.info('[Storage Event] Token was cleared in another tab');
        setAdminUser(null);
        justLoggedInRef.current = false;
      }
    };
    
    // Custom event listener for when token is cleared by api.ts
    const handleTokenCleared = () => {
      if (!getAccessToken()) {
        logger.info('[Auth Event] Token was cleared, updating admin user state');
        setAdminUser(null);
        justLoggedInRef.current = false;
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('auth-token-cleared', handleTokenCleared);

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('auth-token-cleared', handleTokenCleared);
    };
  }, [adminLogout]); // Don't include justLoggedIn to avoid re-running when it changes

  const adminLogin = async (identifier: string, password: string): Promise<boolean> => {
    try {
      logger.info('[AdminContext] adminLogin called');
      logger.info('[AdminContext] Identifier:', identifier);
      logger.info('[AdminContext] Password length:', password.length);
      
      const response = await authApi.login({ emailOrUsername: identifier, password });
      const { access_token, user } = response as any;
      
      logger.info('[AdminContext] Login API response received');
      logger.info('[AdminContext] Access token exists:', !!access_token);
      logger.info('[AdminContext] User data:', user);
      
      // CRITICAL: Store the access token in sessionStorage
      if (access_token) {
        logger.info('[AdminContext] Storing access token in sessionStorage');
        setAccessToken(access_token);
      } else {
        logger.error('[AdminContext] No access token received from login API!');
      }
      
      setAdminUser(user);
      setIsLoading(false); // Explicitly set loading to false after successful login
      
      logSecurityEvent({
        action: 'admin_login_success',
        status: 'success',
        details: { username: user.username, role: user.role, userId: user.id }
      });

      startSessionTimer(adminLogout);
      
      // Dispatch custom event to notify other contexts to refresh data
      window.dispatchEvent(new CustomEvent('admin-login-success'));
      
      logger.info('[AdminContext] Login successful, setting justLoggedInRef to true');
      justLoggedInRef.current = true;
      
      // After a delay, reset the flag so future session checks work normally
      setTimeout(() => {
        logger.info('[AdminContext] Resetting justLoggedInRef to false');
        justLoggedInRef.current = false;
      }, 5000); // 5 seconds should be enough for navigation to complete
      
      // Preload admin routes
      preloadAdminRoutes();
      
      return true;
    } catch (error: any) {
      logger.error('[AdminContext] Login error', { error });
      logger.error('[AdminContext] Error message:', error.message);
      logger.error('[AdminContext] Error stack:', error.stack);
      
      // Classify the error type for better handling
      const isNetworkError = error instanceof TypeError && error.message.includes('fetch');
      const errorMessage = isNetworkError 
        ? 'Unable to connect to server. Please ensure the backend is running.'
        : error.message;
      
      logSecurityEvent({
        action: 'admin_login_failed',
        status: 'failure',
        details: { 
          identifier, 
          error: errorMessage,
          errorType: isNetworkError ? 'network' : 'auth'
        }
      });
      
      // Throw error so the component can display specific error messages
      throw error;
    }
  };

  return (
    <AdminContext.Provider
      value={{
        adminUser,
        isAdminAuthenticated: !!adminUser,
        adminLogin,
        adminLogout,
        isLoading,
        accessToken: getAccessToken(),
      }}
    >
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin(): AdminContextType {
  const context = useContext(AdminContext);
  
  if (context === undefined) {
    // During development/hot reload, silently return safe defaults to prevent crashes
    // This is expected behavior when React Fast Refresh rebuilds the component tree
    // No warning needed as this is a normal part of the development workflow
    return {
      adminUser: null,
      isAdminAuthenticated: false,
      adminLogin: async () => false,
      adminLogout: async () => {},
      isLoading: true,
      accessToken: null,
    };
  }
  return context;
}

// Add type declaration for the flags (kept for backwards compatibility)
declare global {
  interface Window {
    __adminContextWarningShown?: boolean;
    __adminContextCheckedDelayed?: boolean;
  }
}