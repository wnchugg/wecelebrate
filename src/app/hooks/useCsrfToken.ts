/**
 * CSRF Token Hook
 * React hook for CSRF token management
 * Phase 2.4: Security Hardening
 */

import { useState, useEffect } from 'react';
import { 
  getCSRFToken, 
  validateCSRFToken, 
  refreshCSRFToken, 
  clearCSRFToken 
} from '../utils/csrfProtection';
import { logger } from '../utils/logger';

/**
 * Hook for CSRF token management
 */
export function useCsrfToken() {
  const [token, setToken] = useState<string>('');

  useEffect(() => {
    // Get or create token on mount
    const csrfToken = getCSRFToken();
    setToken(csrfToken);
  }, []);

  const rotate = () => {
    const newToken = refreshCSRFToken();
    setToken(newToken);
    logger.log('[useCsrfToken] Token rotated');
    return newToken;
  };

  const validate = (tokenToValidate: string) => {
    return validateCSRFToken(tokenToValidate);
  };

  const clear = () => {
    clearCSRFToken();
    setToken('');
    logger.log('[useCsrfToken] Token cleared');
  };

  return {
    token,
    rotate,
    validate,
    clear
  };
}